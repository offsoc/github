module Hydro
  class Consumer
    attr_reader :source, :deliver_tombstone_messages

    # Provides an interface for reading decoded messages from a Hydro::Source.
    #
    # source  - a Hydro::Source e.g. Hydro::MemorySource
    # decoder - a Hydro::Decoder e.g. Hydro::ProtobufDecoder
    # deliver_tombstone_messages - a boolean. Enables delivery of tombstone messages which have a `nil` value
    # decode_failure_handler a Proc to call on decode failures
    def initialize(source:, decoder:, deliver_tombstone_messages: false, decode_failure_handler: nil)
      @source = source
      @decoder = decoder
      @deliver_tombstone_messages = deliver_tombstone_messages
      @decode_failure_handler = decode_failure_handler
    end

    def open
      source.open
    end

    # Public: Yields successive batches of decoded messages from the source.
    # Decoded messages expose message metadata like timestamp, offset and site
    # of origin.
    #
    # block - a Proc to process each batch
    def each_batch
      source.each_batch do |batch|
        messages = batch.map { |message|
          if message.value.nil? && deliver_tombstone_messages
            next ConsumerMessage.new(
              value: nil,
              source_message: message,
              timestamp: nil,
              id: nil,
              schema: nil,
            )
          end

          next unless decoded = decode(message)

          ConsumerMessage.new(
            value: decoded.message,
            source_message: message,
            timestamp: decoded.timestamp,
            id: decoded.id,
            schema: decoded.schema
          )
        }

        yield messages.compact
      end
    end

    # Public: Yields individual decoded messages from the source.
    # Decoded messages expose message metadata like timestamp, offset and site
    # of origin.
    #
    # block - a Proc to process each batch
    def each_message
      source.each_message do |message|
        if message.value.nil? && deliver_tombstone_messages
          yield ConsumerMessage.new(
            value: nil,
            source_message: message,
            timestamp: nil,
            id: nil,
            schema: nil,
          )
          next
        end

        next unless decoded = decode(message)

        yield ConsumerMessage.new(
          value: decoded.message,
          source_message: message,
          timestamp: decoded.timestamp,
          id: decoded.id,
          schema: decoded.schema
        )
      end
    end

    def close
      source.close
    end

    # Public: Mark a message as processed. Message offsets are not guaranteed
    # to be committed until `commit_offsets` is called. Manually marking
    # messages as processed is only necessary if the
    # `automatically_mark_as_processed` option is `false`.
    #
    # message - a Hydro::Consumer::ConsumerMessage
    #
    # Example:
    #
    #   consumer.each_batch do |batch|
    #     message_1, message_2 = batch[0], batch[1]
    #
    #     # Do some processing
    #     save(message_1)
    #     save(message_2)
    #
    #     consumer.mark_message_as_processed(message_2)
    #   end
    def mark_message_as_processed(message)
      source.mark_message_as_processed(message.source_message)
    end

    # Public: Store the uncommitted offset high water mark.
    #
    # Returns nothing.
    def commit_offsets
      source.commit_offsets
    end

    # Public: Send a heartbeat manually to the source
    #
    # Returns nothing
    def trigger_heartbeat
      source.trigger_heartbeat
    end

    private

    attr_reader :decoder, :decode_failure_handler

    def decode(message)
      decoder.decode(message.value)
    rescue => error
      if decode_failure_handler
        decode_failure_handler.call(message, error)
        nil
      else
        raise error
      end
    end

    class ConsumerMessage
      attr_reader :source_message, :schema, :timestamp, :id, :value

      def initialize(source_message:, schema:, timestamp:, id:, value:)
        @source_message = source_message
        @schema = schema
        @timestamp = timestamp
        @id = id
        @value = value
      end

      def topic
        source_message.topic
      end

      def partition
        source_message.partition
      end

      def offset
        source_message.offset
      end

      def key
        source_message.key
      end

      def headers
        source_message.headers
      end
    end
  end
end
