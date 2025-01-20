module Hydro
  module Decoding
    class ProtobufDecoder
      def self.decode(*args)
        new.decode(*args)
      end

      def initialize(pool: Google::Protobuf::DescriptorPool.generated_pool)
        @pool = pool
      end

      # Public: Decode an encoded protobuf message.
      #
      #   bytes - A String encoded protobuf message
      #
      # Returns a DecodedMessage.
      def decode(bytes)
        envelope = Hydro::Schemas::Hydro::V1::Envelope.decode(bytes)
        schema = envelope.type_url.sub(TYPE_URL_PREFIX.to_s, "")
        schema_class = Hydro::Protobuf.get_schema_class(schema, pool)
        decoded = schema_class.decode(envelope.message)

        DecodedMessage.new(decoded.to_h,
          schema: schema,
          timestamp: envelope.timestamp.to_f,
          id: envelope.id
        )
      end

      private

      attr_reader :pool
    end
  end
end
