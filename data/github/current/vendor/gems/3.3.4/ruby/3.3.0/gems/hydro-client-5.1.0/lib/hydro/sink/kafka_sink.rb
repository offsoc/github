require "kafka"

module Hydro
  class KafkaSink
    include Batching

    # The current 'message.max.bytes' configuration.
    MAX_MESSAGE_BATCH_SIZE = MAX_MESSAGE_SIZE = 5_243_000

    ASYNC_PRODUCER_DEFAULTS = {
      # Require acks from primary and all in-sync replicas.
      required_acks: :all,

      # The maximum number of messages allowed in the async producer queue
      # (i.e. the maximum batch size).
      max_queue_size: 500,

      # As of kafka 0.11.0.0, 'message.max.bytes' constrains the size of an
      # entire message batch rather than a single message, so we'll use the
      # 'message.max.bytes' value to cap the producer buffer.
      max_buffer_bytesize: MAX_MESSAGE_BATCH_SIZE,

      # A threshold for automatically dumping queued messages to a background
      # thread for delivery.
      delivery_threshold: 250,

      # A timeout for automatically dumping queued messages to a background
      # thread for delivery if the producer has not yet called `flush_batch`.
      delivery_interval: 10,

      # Number of seconds to wait before retrying failed produce requests.
      retry_backoff: 5,
    }

    SYNC_PRODUCER_DEFAULTS = {
      # Require acks from primary and all in-sync replicas.
      required_acks: :all,
    }

    # Build a Hydro::KafkaSink.
    #
    # seed_brokers     - the Array<String> of kafka broker "<host>:<port>"
    # client_id        - a producer application identifier for use in logging,
    #                    debugging and quotas.
    # kafka            - the kafka client Class (only used in tests)
    # close_timeout    - The max amount of time spent attempting to deliver buffered messages on close.
    # client_options   - a Hash of options passed directly to the Kafka::Client
    # producer_options - a Hash of options passed directly to the Kafka::Producer
    def initialize(seed_brokers:, client_id:, kafka: Kafka, async: true, close_timeout: 5, client_options: {}, producer_options: {})
      @seed_brokers = seed_brokers
      @client_id = client_id
      @kafka = kafka
      @async = async
      @client_options = client_options
      @producer_options = producer_options
      @close_timeout = close_timeout
    end

    def write(messages, options = {})
      result = add_to_batch(messages)

      # instruct the asynchronous producer to deliver immediately
      flush_batch unless batching?

      result
    end

    def add_to_batch(messages)
      validate_messages(messages)

      produced = -1
      messages.each.with_index do |message, i|
        options = {
          topic: message.topic,
          key: message.key,
          partition_key: message.partition_key,
          partition: message.partition,
        }

        options[:headers] = message.headers if message.headers.any?

        producer.produce(message.data, **options)
        produced = i
      end

      @flushable = true
      Hydro::Sink::Result.success
    rescue Hydro::Sink::Error => e
      Hydro::Sink::Result.failure(e)
    rescue => e
      handle_kafka_exception(e, messages[(produced + 1)..-1])
    end

    # Public: Flushes any messages remaining in the buffer. Blocks until
    # all messages have been delivered or we've exhausted the close timeout.
    def close(timeout: nil)
      start = Time.now
      retries = 0
      begin
        producer.deliver_messages
      rescue => e
        if (Time.now - start) < (timeout || @close_timeout)
          Hydro.instrumenter.instrument("hydro.kafka_sink.close.message_flush_retry", {exception: e, retry: retries})
          # Start with 100ms backoff, increase exponentially, cap at 1 second backoff.
          sleep [(2 ** retries * 0.1), 1].min
          retries += 1
          retry
        else
          Hydro.instrumenter.instrument("hydro.kafka_sink.close.message_flush_failure", {exception: e})
        end
      end

      producer.shutdown
    end

    def flush_batch(options = {})
      producer.deliver_messages
      @batching = false
      @flushable = false
      Hydro::Sink::Result.success
    rescue Hydro::Sink::Error => e
      Hydro::Sink::Result.failure(e)
    rescue => e
      handle_kafka_exception(e)
    end

    def flushable?
      !!@flushable
    end

    private

    attr_reader :seed_brokers, :client_id

    def async?
      @async
    end

    def producer
      @producer ||= if async?
        client.async_producer(**producer_options)
      else
        client.producer(**producer_options)
      end
    end

    def client
      @client ||= begin
        client = @kafka.new(seed_brokers, **client_options)
        # ruby-kafka doesn't provide a way to set the instrumenter backend
        # to anything other than ActiveSupport::Notifications, so this ugly
        # hack reaches into the kafka instrumenter.
        # https://github.com/zendesk/ruby-kafka/blob/6f0d59656a1befce0a534a422ac65e01f764b239/lib/kafka/instrumenter.rb#L10-L13
        # We want to make sure the instrumenter is set to `Hydro.instrumenter`.
        if instrumenter = client.instance_variable_get("@instrumenter")
          instrumenter.instance_variable_set("@backend", Hydro.instrumenter)
        end

        client
      end
    end

    def client_options
      {client_id: client_id, logger: Hydro.publisher_logger}.merge(@client_options)
    end

    def producer_options
      defaults.merge(@producer_options)
    end

    def defaults
      async? ? ASYNC_PRODUCER_DEFAULTS : SYNC_PRODUCER_DEFAULTS
    end

    def validate_messages(messages)
      if too_large = messages.detect { |message| message.bytesize > MAX_MESSAGE_SIZE }
        raise Hydro::Sink::MessagesTooLarge.new(
          "#{too_large.bytesize} bytes exceeds max message size of #{MAX_MESSAGE_SIZE} bytes",
          context: {
            topic: too_large.topic,
            schema: too_large.schema,
            key: too_large.key,
            timestamp: too_large.timestamp,
          }
        )
      end
    end

    def handle_kafka_exception(e, messages = [])
      case e
      when Kafka::BufferOverflow
        # Wrap this one explicitly to allow for matching on the wrapper class for
        # handling buffer overflows rather than relying on the underlying Kafka
        # error class.
        wrapped = Hydro::Sink::BufferOverflow.new(e.message, original_exception: e, messages: messages)
        Hydro::Sink::Result.failure(wrapped)
      else
        wrapped = Hydro::Sink::Error.new(e.message,
          messages: messages,
          original_exception: e,
        )
        Hydro::Sink::Result.failure(wrapped)
      end
    end
  end
end
