# frozen_string_literal: true
module RelayHelpers
  class NodeEncoder < GraphQL::Pro::Encoder
    key("949a6f43824d4469")
  end

  class CursorEncoder1 < GraphQL::Pro::Encoder
    key("8b04e5ad33fa6950")
  end

  class CursorEncoder2 < GraphQL::Pro::Encoder
    key("dfa2fbe57815d03e")
  end

  CursorEncoder = GraphQL::Pro::Encoder.versioned(
    CursorEncoder1,
    CursorEncoder2,
  )


  class ThingType < GraphQL::Schema::Object
    implements GraphQL::Types::Relay::Node
    global_id_field :id
    field :value, Integer, null: true
  end

  class QueryType < GraphQL::Schema::Object
    include GraphQL::Types::Relay::HasNodeField
    field :things, ThingType.connection_type, null: true

    def things
      [1, 2, 3].map { |v| Thing.new(v) }
    end
  end

  class Schema < GraphQL::Schema
    query(QueryType)
    def self.object_from_id(id, ctx)
      value = NodeEncoder.decode(id)
      Thing.new(value.to_i)
    end

    def self.id_from_object(o, t, c)
      NodeEncoder.encode(o.id)
    end

    def self.resolve_type(t, o, c)
      ThingType
    end

    cursor_encoder(CursorEncoder)
  end

  class Thing
    attr_reader :id, :value

    def initialize(value)
      @value = value
      @id = value.to_s
    end
  end
end
