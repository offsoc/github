module Hydro
  class Error < StandardError
    attr_reader :original_exception, :context

    def initialize(message, original_exception: nil, context: {})
      super(message)
      @original_exception = original_exception
      @context = context || {}
    end

    def backtrace
      original_exception ? original_exception.backtrace : super
    end

    def failbot_context
      context
    end
  end

  # Raised when a message cannot be encoded.
  class EncodingError < Hydro::Error; end

  # Raised when an encoder can't be found for a given message.
  class NoEncoderError < Hydro::Error
    def initialize(attributes)
      @attributes = attributes
    end

    def message
      "Unable to find an encoder for #{@attributes.inspect}"
    end
  end

  class MissingSchemaError < Hydro::Error
    def initialize(schema)
      @schema = schema
    end

    def message
      "Unknown schema #{@schema}"
    end
  end

  module Sink
    class Error < Hydro::Error
      attr_reader :messages

      def initialize(message, original_exception: nil, messages: [], context: {})
        super(message, original_exception: original_exception, context: context)
        @messages = messages || []
      end

      def context
        super.merge(message_counts: message_counts)
      end

      def original_exception
        @original_exception
      end

      def message_counts
        @messages.reduce(Hash.new { |h, k| h[k] = 0 }) do |acc, message|
          acc[message.topic] += 1
          acc
        end
      end
    end

    class TimeoutError < Sink::Error; end

    class BufferOverflow < Sink::Error; end

    class MessagesInvalidError < Sink::Error; end

    class MessagesTooLarge < MessagesInvalidError; end
  end

  module Source
    class Error < Hydro::Error; end
  end
end
