# frozen_string_literal: true


TESTING_NEW_PAGINATION = ENV["TESTING_NEW_PAGINATION"]
module ConnectionHelpers
  class BaseField < GraphQL::Schema::Field
    def initialize(*args, **kwargs, &block)
      kwargs[:camelize] = false
      super(*args, **kwargs, &block)
    end
  end

  class BaseScalar < GraphQL::Schema::Scalar
  end

  class BaseEnum < GraphQL::Schema::Enum
  end

  class BaseInput < GraphQL::Schema::InputObject
  end

  class BaseObject < GraphQL::Schema::Object
    field_class BaseField
  end

  class BaseUnion < GraphQL::Schema::Union
  end

  module BaseInterface
    include GraphQL::Schema::Interface
    field_class BaseField
  end

  class DateType < BaseScalar
    def self.coerce_input(v, _c)
      Time.at(v.to_i)
    end

    def self.coerce_result(v, _c)
      v.to_i.to_s
    end
  end

  class RarityType < BaseEnum
    value "COMMON"
    value "UNCOMMON"
    value "RARE"
    value "MYTHIC_RARE"
    value "MASTERPIECE"
    value "TIMESHIFTED"
  end

  class ColorType < BaseEnum
    value "WHITE"
    value "BLUE"
    value "BLACK"
    value "RED"
    value "GREEN"
  end

  class PrintableInputType < BaseInput
    argument :name, String, required: true
  end

  class CardOrderInputType < BaseInput
    argument :by, String, required: true
    argument :dir, String, required: true
  end

  class ArtistType < BaseObject
    field :name, String, null: true
    field :printings, ["ConnectionHelpers::PrintingType"], null: true
  end

  class PersonUnion < BaseUnion
    graphql_name "Person"
    possible_types ArtistType
  end

  class RarityInfoType < BaseObject
    field :rarity, RarityType, null: false
    field :name, String, null: false
    field :name_len, Int, null: false
  end

  module PrintableType
    include BaseInterface
    field :printings, ["ConnectionHelpers::PrintingType"], null: true do
      argument :rarity, [RarityType], "Filter by Rarity", required: false
    end
  end

  class PrintingType < BaseObject
    field :rarity, RarityType, null: true
    field :card, "ConnectionHelpers::CardType", null: true
    field :expansion, "ConnectionHelpers::ExpansionType", null: true
    field :artist, ArtistType, null: true
  end

  class CardType < BaseObject
    implements PrintableType
    field :name, String, null: false
    field :rules, String, null: false
    field :power, String, null: true
    field :toughness, String, null: true
    field :loyalty, String, null: true
    field :flavor, String, null: true
    field :colors, [ColorType], null: true
    field :mana_cost, String, null: false
    field :converted_mana_cost, Int, null: false
    field :printings, [PrintingType], null: true do
      argument :rarity, [RarityType], "Filter by Rarity", required: false
    end
  end

  # Make a customized connection type
  CardConnectionWithTotalCountType = Class.new(CardType.connection_type) do
    graphql_name "CardConnectionWithTotalCountType"
    # TODO it would be nice if this was inherited
    edge_type(CardType.connection_type.instance_variable_get(:@edge_type))

    field :total_count, Integer, null: true

    def total_count
      if TESTING_NEW_PAGINATION
        object.items.size
      else
        object.nodes.size
      end
    end

    field :custom_data, [String], null: false

    def custom_data
      [
        object.respond_to?(:parent) ? object.parent.class.name : "",
        object.respond_to?(:field) ? object.field.name : "",
        "p:#{object.max_page_size.to_s}",
        object.respond_to?(:arguments) ? "a:#{object.arguments.to_h.size.to_s}" : "",
        object.first.to_s,
        object.after.to_s,
        object.last.to_s,
        object.before.to_s,
      ]
    end
  end

  class ExpansionType < BaseObject
    implements PrintableType
    field :name, String, null: true
    field :sym, String, null: true
    field :release_date, DateType, null: true
    field :cards_list, [CardType], method: :cards, null: true
    field :printings, [PrintingType], null: true do
      argument :rarity, [RarityType], "Filter by Rarity", required: false
    end

    field :rarity_infos, RarityInfoType.connection_type, null: true do
      argument :order, Boolean, default_value: true, required: false
    end

    def rarity_infos(order:)
      rarity_infos = object.cards
        .select("rarity, max(name) as name, sum(length(name)) as name_len")
        .group("rarity")

      if order
        rarity_infos = rarity_infos.order("rarity desc")
      end
      rarity_infos
    end

    field :auto_cards, CardConnectionWithTotalCountType, max_page_size: 5, connection: true, null: true do
      argument :orders, [CardOrderInputType], default_value: [], required: false
    end

    def auto_cards(orders:)
      cards = object.cards
      if orders.any? { |o| o[:by] == "expansion_name" }
        cards = cards.joins(:expansions)
      end
      orders.each do |order|
        cards = case order[:by]
        when "expansion_name"
          # IRL this is SQL injection
          # Interesting: `.name` is a conflict between expansions and cards
          cards.order("expansions.name #{order[:dir]}")
        when "field_function"
          # test FIELD(...)
          cards.order("FIELD(name, \"Reflecting Pool\") #{order[:dir] == "desc" ? "desc" : ""}")
        when "cast_stmt"
          cards.order("CASE WHEN LENGTH(name) > 14 THEN 0 ELSE 1 END #{order[:dir] == "desc" ? "desc" : ""}")
        else
          cards.order(order[:by] => (order[:dir] == "desc" ? :desc : :asc))
        end
      end

      cards
    end

    field :auto_cards_without_max_page_size, CardConnectionWithTotalCountType, connection: true, null: true do
      argument :orders, [CardOrderInputType], default_value: [], required: false
    end

    def auto_cards_without_max_page_size(orders:)
      cards = object.cards
      orders.each do |order|
        cards = cards.order(order[:by] => (order[:dir] == "desc" ? :desc : :asc))
      end
      cards
    end

    field :mongoid_cards, [CardType], null: false

    def mongoid_cards
      MongoidCard.where(expansion_sym: object.sym)
    end
  end

  class AnythingUnion < BaseUnion
    graphql_name "Anything"
    possible_types CardType, ExpansionType, ArtistType
  end

  class QueryType < BaseObject
    field :card, CardType, null: false do
      argument :id, ID, required: true
    end

    def card(id:)
      Card.find(id)
    end

    field :expansion, ExpansionType, null: false do
      argument :sym, String, required: true
    end

    def expansion(sym:)
      ExpansionLoader.load(sym)
    end

    field :printable, PrintableType, null: false do
      argument :printableInput, PrintableInputType, required: false
    end

    field :printables, [PrintableType], null: true

    def printables
      Card.all
    end

    field :anything, AnythingUnion, null: true do
      argument :id, ID, required: true
    end

    # Not implement, just to make sure it's in the schema
    field :person, PersonUnion, null: true
  end

  class AddCard < GraphQL::Schema::RelayClassicMutation
    argument :name, String, required: true
    argument :expansion_sym, String, required: true

    field :expansion, ExpansionType, null: false
    field :cardsConnection, CardType.connection_type, null: false
    field :newCardEdge, CardType.edge_type, null: false

    def resolve(name:, expansion_sym:)
      expansion = Expansion.find_by(sym: expansion_sym)
      cards = expansion.cards
      new_card = cards.build(name: name, expansions: [expansion], mana_cost: "3{B/R}{B/R}", rarity: "common")
      new_card.save!

      new_card_relation = expansion.cards.where(name: new_card.name, mana_cost: new_card.mana_cost)
      example_connection = GraphQL::Pro::RelationConnection.new(new_card_relation, {}, parent: expansion, context: context)
      new_card_edge = GraphQL::Relay::Edge.new(example_connection.nodes.first, example_connection)
      {
        expansion: expansion,
        newCardEdge: new_card_edge,
      }
    end
  end

  class MutationType < BaseObject
    field :addCard, mutation: AddCard
  end

  class EncryptedCursorEncoder < GraphQL::Pro::Encoder
    key("d96ab1e9bd8c85ed")
    tag("1")
  end

  VersionedCursorEncoder = GraphQL::Pro::Encoder.versioned(
    EncryptedCursorEncoder,
    GraphQL::Schema::Base64Encoder,
  )

  class Schema < GraphQL::Schema
    query(QueryType)
    mutation(MutationType)
    use GraphQL::Batch
    lazy_resolve(Promise, :sync)
    cursor_encoder(VersionedCursorEncoder)
    orphan_types(PersonUnion)

    self.connections = nil

    def self.resolve_type(type, obj, ctx)
      ConnectionHelpers.const_get("#{obj.class.name}Type")
    end
  end
end
