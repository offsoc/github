require "securerandom"
require "pathname"

module Hydro
  TYPE_URL_PREFIX = Pathname.new("hydro-schemas.github.net/")

  with_generated_files do
    require "hydro/schemas/hydro/v1/envelope_pb"
  end

  # Encodes messages with Protobuf binary format.
  class ProtobufEncoder
    def self.encode(site, message, **kwargs)
      new(site).encode(message, **kwargs)
    end

    # Public: Instantiate a new protobuf encoder. The encoder accepts a
    # handler for the case where a scalar field is set to nil. Because proto3
    # defaults unset scalar fields ("" for strings, 0 for integers, etc),
    # there is no way for message readers to know that a scalar field was unset.
    # To deal with this proto3 constraint, users are encouraged to use wrapper
    # types (see https://git.io/vxjoY) for truly nullable fields.
    #
    # The default encoder behavior is to raise an exception when encountering
    # a `nil` value for a scalar field to prevent users from accidentally
    # publlishing messages with default values. To disable the raise behavior,
    # pass `nil_scalar_handler: :ignore` or pass a custom Proc.
    #
    # pool     - a Google::Protobuf::DescriptorPool
    # callable - :raise, :ignore, or a Proc that accept a single argument, an
    #            instance of UnsetScalarError.
    #
    # Example:
    #
    #     handler = ->(error) { Failbot.report(error) }
    #     ProtobufEncoder.new(nil_scalar_handler: handler)
    #
    def initialize(site = nil, pool: default_pool, nil_scalar_handler: :raise)
      @site = site
      @pool = pool
      @schema_classes = {}
      @nil_scalar_handler = case nil_scalar_handler
                            when Proc then nil_scalar_handler
                            when :ignore then nil
                            when :raise then ->(error) { raise error }
                            else
                              raise ArgumentError.new("nil_scalar_handler must be :raise, :ignore or a Proc")
                            end
    end

    # Encodes a message as a Protobuf-encoded string using the specified schema.
    #
    # message - the message data as a Hash or nil. Nested message types should also
    #           be encoded as Hashes. These will be recursively encoded as
    #           Protobuf messages.
    #
    # Options
    #
    #   schema    - Determines the schema for encoding.
    #   timestamp - Optional Numeric UNIX timestamp.
    #
    #
    # Returns a String with ASCII-8BIT encoding or nil.
    def encode(message, schema:, timestamp: nil)
      return nil if message.nil?

      schema_class = get_schema_class(schema)
      timestamp = timestamp || Time.now.to_f
      encoded = serialize_protobuf(Protobuf.to_protobuf(message, schema_class,
        nil_scalar_handler: nil_scalar_handler
      ))

      apply_envelope(encoded,
        schema: schema_class.descriptor.name,
        timestamp: timestamp
      )
    end

    private

    attr_reader :nil_scalar_handler

    # Internal: Retrieve the schema class for encoding. The schema is lazily
    # loaded because the Protobuf classes may not have been loaded when the
    # encoder is instantiated.
    #
    # schema - The name of the schema class to get. Required if schema was not
    #          specified at initialization.
    #
    # Returns a class that can encode a Protobuf message.
    def get_schema_class(schema)
      @schema_classes[schema] ||= Protobuf.get_schema_class(schema, @pool)
    end

    # Internal: Serializes the Protobuf instance as a string. Uses the Protobuf
    # binary format.
    #
    # pb - an instance of a Protobuf class to be serialized or nil.
    #
    # Returns a String with ASCII-8BIT encoding or nil.
    def serialize_protobuf(pb)
      pb.to_proto
    end

    # Internal: Wraps messages in an envelope that describes message metadata
    # e.g. schema and timestamp.
    #
    # encoded    - a String encoded message.
    # schema     - a String schema name.
    # timestamp  - a Numeric UNIX message timestamp.
    #
    # Returns an encoded Hydro::Schemas::Hydro::V1::Envelope.
    def apply_envelope(message, schema:, timestamp:)
      type_url = TYPE_URL_PREFIX.join(schema).to_s
      event_id = generate_event_id
      begin
        envelope = Hydro::Schemas::Hydro::V1::Envelope.new.tap { |e|
          e.type_url = type_url
          e.id = event_id
          e.timestamp = Google::Protobuf::Timestamp.new.tap { |t| t.from_time(Time.at(timestamp)) }
          e.message = message
          e.site_name = @site.to_s if @site
        }
      rescue TypeError => e
        attributes = {
          type_url: type_url,
          id: event_id,
          timestamp: timestamp,
          message: message,
          site_name: @site,
        }

        raise TypeError.new("#{e.message} Got #{attributes}")
      end

      Hydro::Schemas::Hydro::V1::Envelope.encode(envelope)
    end

    # Interal: Generates a unique message ID string.
    #
    # Returns a String.
    def generate_event_id
      SecureRandom.uuid
    end

    def default_pool
      Google::Protobuf::DescriptorPool.generated_pool
    end
  end
end
