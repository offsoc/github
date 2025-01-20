require "twirp"
require "generated/hydro/gateway/api/v2/api_twirp"

module Hydro
  class GatewaySink
    include Batching

    # Represents a gateway RPC call. May consist of multiple HTTP requests if retries are necessary.
    RPC_EVENT = "rpc.gateway-sink.hydro"

    # Represents a single HTTP request to the gateway.
    REQUEST_EVENT = "request.gateway-sink.hydro"

    # Represents an HTTP request retry.
    RETRY_EVENT = "request_retry.gateway-sink.hydro"

    # Represents an individual message delivery failure. In a single produce request, it's possible
    # for some message produce operations to succeed while others fail.
    DELIVERY_FAILURE_EVENT = "delivery_failure.gateway-sink.hydro"

    # The default HTTP timeout in seconds.
    DEFAULT_TIMEOUT = 10

    # The default maximum number of retries. Retrying covers both HTTP-level errors like timeouts
    # as well as gateway retriable delivery failures.
    DEFAULT_MAX_RETRIES = 3

    # The default number of seconds to wait in between retries.
    DEFAULT_RETRY_BACKOFF = 1

    # The set of Twirp::Error codes that are considered retriable.
    DEFAULT_RETRIABLE_TWIRP_ERRORS = [
      :deadline_exceeded,
      :unavailable,
    ]

    # The set of Faraday error that are considered retriable.
    DEFAULT_RETRIABLE_FARADAY_ERRORS = [
      Faraday::TimeoutError,
      Faraday::ConnectionFailed,
    ]

    GITHUB_REQUEST_ID_HEADER = "X-GitHub-Request-Id"
    GLB_VIA_HEADER = "X-GLB-Via"
    USER_AGENT_HEADER = "User-Agent"

    # Build a new Hydro::GatewaySink
    #
    # client_id                - A String used to identify clients in requests.
    # cluster                  - A String destination kafka cluster.
    # url                      - A String URL of the gateway twirp service.
    # timeout                  - An optional Integer HTTP timeout in seconds.
    # max_retries              - An optional Integer max retry count. Controls both HTTP retries and
    #                            gateway delivery failure retries. Note than when produce requests
    #                            are retried by GatewaySink or the gateway itself, there is a risk
    #                            of message re-ordering.
    # retriable_twirp_errors   - An optional Array<Symbol> of retriable twirp errors.
    # retriable_faraday_errors - An optional Array<Class> of retriable Faraday errors.
    # block                    - An optional block that receives the Faraday connection builder.
    #                            Can be used to customize the Faraday adapter and middleware.
    #                            Users are highly encouraged to substitute an adapter that supports
    #                            persistent HTTP connections.
    def initialize(client_id:, cluster:, url:,
                   timeout: DEFAULT_TIMEOUT,
                   max_retries: DEFAULT_MAX_RETRIES,
                   retry_backoff: DEFAULT_RETRY_BACKOFF,
                   retriable_twirp_errors: DEFAULT_RETRIABLE_TWIRP_ERRORS,
                   retriable_faraday_errors: DEFAULT_RETRIABLE_FARADAY_ERRORS,
                   max_message_size: KafkaSink::MAX_MESSAGE_SIZE)
      @cluster = cluster
      @max_retries = max_retries
      @retry_backoff = retry_backoff
      @retriable_twirp_errors = validate_twirp_errors(retriable_twirp_errors)
      @retriable_faraday_errors = retriable_faraday_errors
      @max_message_size = max_message_size

      connection = Faraday.new(url: url) do |conn|
        conn.options.timeout = timeout
        conn.use ResponseInstrumenter
        yield conn if block_given?
      end
      @client = Hydro::Gateway::Api::V2::ServiceClient.new(connection)

      @client_id = client_id
      @user_agent = "hydro-client-ruby #{Hydro::VERSION} #{client_id}"
      @tracing_enabled = false
    end

    def write(messages, options = {})
      if batching?
        add_to_batch(messages)
        return Hydro::Sink::Result.success
      end

      Hydro.instrumenter.instrument(RPC_EVENT) do |notification|
        notification[:rpc] = :produce

        begin
          validate_messages(messages)
          deliver_with_retries(messages)
          notification[:delivered_count] = messages.count
          Hydro::Sink::Result.success
        rescue DeliveryFailure => e
          failures = e.context[:failures]
          notification[:delivered_count] = messages.count - failures.count
          notification[:failed_count] = failures.count
          notification[:failures] = failures
          Hydro::Sink::Result.failure(e)
        rescue RetriableClientError, ClientError, Hydro::Sink::MessagesInvalidError => e
          notification[:delivered_count] = 0
          notification[:error] = e
          Hydro::Sink::Result.failure(e)
        end
      end
    end

    def close
      # no op
    end

    def enable_tracing
      @tracing_enabled = true
    end

    def disable_tracing
      @tracing_enabled = false
    end

    def validate_messages(messages)
      too_large = messages.detect do |message|
        message.bytesize > @max_message_size && !message.compress
      end

      if too_large
        raise Hydro::Sink::MessagesTooLarge.new(
          "#{too_large.bytesize} bytes exceeds max message size of #{@max_message_size} bytes",
          context: {
            topic: too_large.topic,
            schema: too_large.schema,
            key: too_large.key,
            timestamp: too_large.timestamp,
          }
        )
      end
    end

    private

    def deliver_with_retries(messages)
      retries = 0
      to_deliver = messages
      non_retriable_delivery_failures = []
      headers = {
        USER_AGENT_HEADER => @user_agent,
        GITHUB_REQUEST_ID_HEADER => RequestIdGenerator.github_request_id,
        GLB_VIA_HEADER => RequestIdGenerator.glb_via,
      }

      begin
        deliver_messages(to_deliver, headers)
      rescue RetriableClientError => e
        retries += 1
        if retries <= @max_retries
          Hydro.instrumenter.instrument(RETRY_EVENT, {error: e, retry: retries})
          sleep @retry_backoff
          retry
        else
          raise e
        end
      rescue DeliveryFailure => e
        retries += 1

        to_deliver = e.failures.map do |failure|
          if failure[:retriable]
            failure[:message]
          else
            # Track non-retriable errors across retry attempts.
            non_retriable_delivery_failures << failure
            nil
          end
        end.compact

        if retries <= @max_retries
          Hydro.instrumenter.instrument(RETRY_EVENT, {error: e, retry: retries})
          if to_deliver.any?
            sleep @retry_backoff
            retry
          end
        end

        raise DeliveryFailure.new("Unable to deliver all messages",
          messages: messages,
          context: {
            failures: non_retriable_delivery_failures + e.failures.select { |failure| failure[:retriable] }
          }
        )
      end
    end

    def deliver_messages(messages, headers)
      request = {
        cluster: @cluster,
        client_id: @client_id,
        messages: messages.map do |message|
          m = {topic: message.topic}
          m[:partition_key] = message.partition_key.to_s if message.partition_key
          m[:partition] = {value: message.partition} if message.partition
          m[:key] = {value: message.key} if message.key
          m[:value] = {value: message.data} if message.data
          m[:compress] = true if message.compress
          m[:headers] = message.headers.map { |key, value| { key: key, value: value } } if message.headers.any?
          m
        end
      }
      request[:trace] = true if tracing_enabled?

      response = @client.rpc(:Produce, request, headers: headers)

      if response.error
        if @retriable_twirp_errors.include?(response.error.code)
          raise RetriableClientError.new(response.error.msg,
            original_exception: response.error,
            context: {error: response.error.to_h}
          )
        else
          raise ClientError.new(response.error.msg,
            original_exception: response.error,
            context: {error: response.error.to_h}
          )
        end
      end

      if response.data.delivery_failures.any?
        failures = response.data.delivery_failures.map do |failure|
          failure.to_h.merge(message: messages[failure.index])
        end

        Hydro.instrumenter.instrument(DELIVERY_FAILURE_EVENT, {failures: failures})

        raise DeliveryFailure.new("Unable to deliver all messages",
          messages: messages,
          context: {failures: failures},
        )
      end
    rescue Faraday::Error => e
      if e.is_a?(Faraday::TimeoutError)
        # Timeouts evade the request instrumentation middleware, but should be
        # captured.
        Hydro.instrumenter.instrument(REQUEST_EVENT, {timeout: true})
      end

      if @retriable_faraday_errors.any? { |error| e.is_a?(error) }
        raise RetriableClientError.new(e.message, original_exception: e)
      else
        raise ClientError.new(e.message, original_exception: e)
      end
    end

    def validate_twirp_errors(error_codes)
      error_codes.each do |code|
        unless Twirp::Error.valid_code?(code)
          raise ArgumentError.new("Invalid twirp error code #{code}")
        end
      end
    end

    def tracing_enabled?
      @tracing_enabled
    end

    class ClientError < Sink::Error; end

    class RetriableClientError < ClientError; end

    class DeliveryFailure < Sink::Error
      def failures
        context[:failures]
      end
    end

    class ResponseInstrumenter
      def initialize(app, options = {})
        @app = app
        @options = options
      end

      def call(request_env)
        @app.call(request_env).on_complete do |response_env|
          Hydro.instrumenter.instrument(REQUEST_EVENT, {status: response_env.status})
        end
      end
    end

    class RequestIdGenerator
      def self.github_request_id
        SecureRandom.uuid
      end

      def self.glb_via
        "hostname=#{Socket.gethostname} t=#{Time.now.to_f}"
      end
    end
  end
end
