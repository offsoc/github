module Hydro
  module Decoding
    class DecodedMessage
      attr_reader :message, :schema, :timestamp, :id
      # A decoded message container.
      #
      # message   - a Hash containing decoded data
      # schema    - a String schema name.
      # timestamp - a Numeric UNIX message timestamp.
      # id        - a UUID identifying the hydro message
      def initialize(message, schema:, timestamp:, id:)
        @message = message
        @schema = schema
        @timestamp = timestamp
        @id = id
      end

      def to_h
        message.to_h
      end
    end
  end
end
