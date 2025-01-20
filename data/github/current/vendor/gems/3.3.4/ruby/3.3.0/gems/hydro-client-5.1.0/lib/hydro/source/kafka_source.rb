require "kafka"

module Hydro
  class KafkaSource

    # The default socket timeout is 10 seconds, which conflicts with the
    # 30-second default session timeout. This means consumer connections can
    # time out when joining a group and cause increased consumer group churn.
    DEFAULT_CLIENT_OPTIONS = {
      socket_timeout: 60,
    }

    CLIENT_OPTIONS = [
      :seed_brokers,
      :client_id,
      :connect_timeout,
      :socket_timeout,
      /^ssl_/,
      /^sasl/,
    ]

    BATCH_OPTIONS = [
      :min_bytes,
      :max_bytes,
      :max_wait_time,
      :automatically_mark_as_processed,
    ]

    SUBSCRIBE_OPTIONS = [
      :max_bytes_per_partition,
      :start_from_beginning,
    ]

    SIMPLE_CONSUMER_OPTIONS = [
      :topic,
      :start_from_beginning,
      :max_wait_time,
      :min_bytes,
      :max_bytes,
    ]

    # Expose messages from kafka as a Hydro::Source.
    #
    # seed_brokers - an Array<String> of broker "<host>:<port>". Required.
    # subscribe_to - a String, Regexp, Array<String> or Array<Regexp> that specifies the topic
    #                or topic pattern to consumer from. String args will be converted to regexes.
    #                Required.
    #                args will be converted to regexes. Required.
    # group_id     - a String to uniquely identify the kafka consumer group. Required.
    # simple       - a Boolean to switch to simple consumer mode. A simple consumer does not use
    #                a consumer group and consumes all partitions within single topic.
    # options      - a Hash of additional options passed to the underlying Kafka::Client
    #                and Kafka::Consumer.
    #
    #                Client options:
    #                :client_id                    - the String identifier for this application.
    #                :connect_timeout              - the Integer timeout setting for connecting to
    #                                                brokers.
    #                :socket_timeout               - the Integer timeout setting for socket
    #                                                connections.
    #                :ssl_ca_cert                  - a String PEM encoded CA cert, or an
    #                                                Array<String> of PEM encoded CA certs, to use
    #                                                with an SSL connection.
    #                :ssl_ca_cert_file_path        - a String path on the filesystem to a PEM
    #                                                encoded CA cert to use with an SSL connection.
    #                :ssl_client_cert              - a String PEM encoded client cert to use with
    #                                                an SSL connection. Must be used in combination
    #                                                with ssl_client_cert_key.
    #                :ssl_client_cert_key          - a String PEM encoded client cert key to use
    #                                                with an SSL connection. Must be used in
    #                                                combination with ssl_client_cert.
    #                :ssl_client_cert_key_password - the String password required to read the
    #                                                ssl_client_cert_key. Must be used in
    #                                                combination with ssl_client_cert_key.
    #                :sasl_gssapi_principal        - a String KRB5 principal
    #                :sasl_gssapi_keytab           - a String KRB5 keytab filepath
    #                :sasl_scram_username          - a String SCRAM username
    #                :sasl_scram_password          - a String SCRAM password
    #                :sasl_scram_mechanism         - a String Scram mechanism, either "sha256" or
    #                                                "sha512"
    #                :sasl_over_ssl                - a Boolean whether to enforce SSL with SASL
    #                :sasl_oauth_token_provider    - OAuthBearer Token Provider instance that
    #                                                implements method token.
    #
    #                Consumer group options:
    #                :group_id                - the String id of the group that the consumer should
    #                                           join.
    #                :session_timeout         - the Integer number of seconds after which, if a
    #                                           client hasn't contacted the Kafka cluster, it will
    #                                           be kicked out of the group.
    #                :offset_commit_interval  - the Integer interval between offset commits, in
    #                                           seconds.
    #                :offset_commit_threshold - the Integer number of messages that can be processed
    #                                           before their offsets are committed. If zero, offset
    #                                           commits are not triggered by message processing.
    #                :heartbeat_interval      - the Integer interval between heartbeats; must be
    #                                           less than the session window.
    #                :offset_retention_time   - the Integer time period that committed offsets will
    #                                           be retained, in seconds. Defaults to the broker
    #                                           setting.
    #                :fetcher_max_queue_size  - Integer max number of items in the fetch queue that
    #                                           are stored for further processing. Note, that each
    #                                           item in the queue represents a response from a
    #                                           single broker.
    #
    #                Fetch options:
    #                :start_from_beginning            - Boolean whether to start from the beginning
    #                                                   of the topic or just subscribe to new
    #                                                   messages being produced. This only applies
    #                                                   when first consuming a topic partition – once
    #                                                   the consumer has checkpointed its progress,
    #                                                   it will always resume from the last
    #                                                   checkpoint.
    #                :max_bytes_per_partition         - the Integer maximum amount of data fetched
    #                                                   from a single partition at a time.
    #                :min_bytes                       - the Integer minimum number of bytes to read
    #                                                   before returning messages from each broker;
    #                                                   if `max_wait_time` is reached, this is ignored.
    #                :max_bytes                       - the Integer maximum number of bytes to read
    #                                                   before returning messages from each broker.
    #                :max_wait_time                   - the Numeric maximum duration of time to wait
    #                                                   before returning messages from each broker,
    #                                                   in seconds.
    #                :automatically_mark_as_processed - Boolean whether to automatically mark a
    #                                                   message as successfully processed when the
    #                                                   block returns without an exception. Once
    #                                                   marked successful, the offsets of processed
    #                                                   messages can be committed to Kafka.
    #
    #                Simple consumer options:
    #                :start_from_beginning - A Boolean whether to start from the beginning of the
    #                                        topic or just subscribe to new messages being
    #                                        produced.
    #                :max_wait_time        - The Integer maximum amount of time to wait before the
    #                                        server responds, in seconds.
    #                :min_bytes            - The Integer minimum number of bytes to wait for. If set
    #                                        to zero, the broker will respond immediately, but the
    #                                        response may be empty. The default is 1 byte, which
    #                                        means that the broker will respond as soon as a message
    #                                        is written to the partition.
    #                :max_bytes            - The Integer maximum number of bytes to include in the
    #                                        response message set. Default is 1 MB. You need to set
    #                                        this higher if you expect messages to be larger than
    #                                        this.
    def initialize(seed_brokers:, subscribe_to:, group_id: nil, simple: false, kafka: Kafka, **options)
      @seed_brokers = Array(seed_brokers)
      @subscribe_to = subscribe_to
      @simple = simple

      if !simple && !group_id
        raise ArgumentError.new("missing keyword: :group_id")
      else
        @group_id = group_id
      end

      @kafka = kafka
      @options = options
      @options[:client_id] ||= group_id
    end

    def open
      # no op
    end

    def each_batch(&block)
      processing_exeption = nil

      begin
        Hydro.instrumenter.instrument("hydro.kafka_source.batch_processed", {client_id: @options[:client_id], group_id: @group_id, max_bytes_per_partition: subscribe_options[:max_bytes_per_partition], start_from_beginning: subscribe_options[:start_from_beginning]}) do
          consume_message_batches(&block)
        end
      rescue Kafka::ProcessingError => e
        processing_exeption = e
        raise e.cause
      end
    rescue => e
      raise Hydro::Source::Error.new(e.message,
        original_exception: e,
        context: {
          topic: processing_exeption&.topic,
          partition: processing_exeption&.partition,
          offset: processing_exeption&.offset,
        }
      )
    end

    def each_message
      processing_exeption = nil

      begin
        consumer.each_message(**batch_options) do |message|
          Hydro.instrumenter.instrument("hydro.kafka_source.message_processed", {client_id: @options[:client_id], group_id: @group_id, max_bytes_per_partition: subscribe_options[:max_bytes_per_partition], start_from_beginning: subscribe_options[:start_from_beginning]}) do
            yield wrap_message(message)
          end
        end

      rescue Kafka::ProcessingError => e
        processing_exeption = e
        raise e.cause
      end
    rescue => e
      raise Hydro::Source::Error.new(e.message,
        original_exception: e,
        context: {
          topic: processing_exeption&.topic,
          partition: processing_exeption&.partition,
          offset: processing_exeption&.offset,
        }
      )
    end

    def close
      consumer.stop
      client.close
    end

    # Public: Record but don't commit offsets for processed messages.
    #
    # message - a Source::Message
    def mark_message_as_processed(message)
      consumer.mark_message_as_processed(message)
    end

    # Public: Commit offsets for processed messages.
    #
    # message - a Source::Message
    def commit_offsets
      consumer.commit_offsets
    end

    # Public: Send a heartbeat manually to the kafka consumer
    #
    # Returns nothing
    def trigger_heartbeat
      consumer.trigger_heartbeat
    end

    private

    attr_reader :seed_brokers

    def consume_message_batches
      if @simple
        if topics.count > 1
          raise ArgumentError.new("The simple consumer only support consuming a single topic, got #{topics.inspect}")
        end

        client.each_message(topic: topics.first, **simple_consumer_options) do |message|
          yield [wrap_message(message)]
        end
      else
        consumer.each_batch(**batch_options) do |batch|
          yield batch.messages.map(&method(:wrap_message))
        end
      end
    end

    def client
      @client ||= begin
        @client = @kafka.new(seed_brokers, **client_options)
        if instrumenter = client.instance_variable_get("@instrumenter")
          instrumenter.instance_variable_set("@backend", Hydro.instrumenter)
        end
        client
      end
    end

    def consumer
      return @consumer if defined?(@consumer)
      Hydro.instrumenter.instrument("hydro.kafka_source.consumer_initialized", {client_id: @options[:client_id], group_id: @group_id, consumer_options: consumer_options}) do
        consumer = client.consumer(**consumer_options.merge(group_id: @group_id))

        raise NoMatchingTopicsError.new(subscribe_to) if topics.none?

        topics.each do |topic|
          Hydro.instrumenter.instrument("hydro.kafka_source.consumer_subscribed", {client_id: @options[:client_id], group_id: @group_id, topic: topic, max_bytes_per_partition: subscribe_options[:max_bytes_per_partition], start_from_beginning: subscribe_options[:start_from_beginning]}) do
            consumer.subscribe(topic, **subscribe_options)
          end
        end

        @consumer = consumer
      end
    end

    def client_option?(option)
      CLIENT_OPTIONS.any? { |client_option| client_option === option } # rubocop:disable Style/CaseEquality
    end

    def client_options
      DEFAULT_CLIENT_OPTIONS.merge(logger: Hydro.consumer_logger).merge(@options.select do |option|
        client_option?(option)
      end)
    end

    def consumer_options
      @consumer_options ||= @options
        .reject { |option| client_option?(option) }
        .reject { |option| BATCH_OPTIONS.include?(option) }
        .reject { |option| SUBSCRIBE_OPTIONS.include?(option) }
    end

    def batch_options
      @batch_options ||= @options.select do |option|
        BATCH_OPTIONS.include?(option)
      end
    end

    def subscribe_options
      @subscribe_options ||= @options.select do |option|
        SUBSCRIBE_OPTIONS.include?(option)
      end
    end

    def simple_consumer_options
      @simple_consumer_options ||= @options.select do |option|
        SIMPLE_CONSUMER_OPTIONS.include?(option)
      end
    end

    def topics
      return @topics if defined?(@topics)

      topics = client.topics
      @topics = subscribe_to.flat_map { |pattern| topics.grep(pattern) }.uniq
    end

    def subscribe_to
      Array(@subscribe_to)
    end

    def wrap_message(message)
      Source::Message.new(
        value: message.value,
        topic: message.topic,
        partition: message.partition,
        key: message.key,
        offset: message.offset,
        headers: message.headers,
      )
    end

    class NoMatchingTopicsError < ArgumentError
      def initialize(patterns)
        @patterns = patterns
      end

      def message
        "Couldn't find any topics matching #{@patterns.map(&:inspect).join(', ')}"
      end
    end
  end
end
