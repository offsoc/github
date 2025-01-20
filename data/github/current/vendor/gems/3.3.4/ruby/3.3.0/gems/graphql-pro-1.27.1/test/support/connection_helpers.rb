# frozen_string_literal: true
require_relative "./active_record_setup"
require_relative "connection_schema.rb"

module ConnectionHelpers
  if rails_loaded?
    class Expansion < ActiveRecord::Base
      self.primary_key = :id
      has_many :printings
      has_many :cards, through: :printings
    end

    class Printing < ActiveRecord::Base
      self.primary_key = :id
      belongs_to :expansion
      belongs_to :card, foreign_key: [:card_name, :card_mana_cost]
    end

    class Card < ActiveRecord::Base
      self.primary_keys = :name, :mana_cost
      has_many :printings, foreign_key: [:card_name, :card_mana_cost]
      has_many :expansions, through: :printings

      def colors
        colors_s.split(",")
      end

      def colors=(new_colors)
        self.colors_s = new_colors.join(",")
      end
    end

    Mongoid.load!("mongoid.yml", :development)
    class MongoidCard
      include Mongoid::Document
      field :name, type: String
      field :expansion_sym, type: String
      field :converted_mana_cost, type: Integer
    end

  end

  def assert_matching_sql(expected, actual, message = nil)
    # Rails 4.2 sometimes puts a double-space before ORDER
    # Rails 5+ adds a set of parens for HAVING
    normalized_actual = actual
      .sub("  ORDER", " ORDER")
      .sub(/HAVING \(\((.*)\)\)/, "HAVING (\\1)")

    assert_equal(expected, normalized_actual, message)
  end

  def quoted(str)
    "#{quote_char}#{str}#{quote_char}"
  end

  def reset_data
    Card.delete_all
    Printing.delete_all
    Expansion.delete_all
    # MongoidCard.delete_all

    shm = Expansion.create!(name: "Shadowmoor", sym: "SHM", release_date: Date.new(2008, 5, 2))
    eve = Expansion.create!(name: "Eventide", sym: "EVE", release_date: Date.new(2008, 7, 26))
    eve.tap do |exp|
      card_attrs = [
        { name: "Springjack Pasture", mana_cost: "", converted_mana_cost: 0, colors_s: "", rarity: "RARE" },
        { name: "Stillmoon Cavalier", mana_cost: "1{W/B}{W/B}", converted_mana_cost: 3, colors_s: "WHITE,BLACK", rarity: "RARE" },
        { name: "Figure of Destiny", mana_cost: "{R/W}", converted_mana_cost: 1, colors_s: "WHITE,RED", rarity: "RARE" },
        { name: "Batwing Brume", mana_cost: "1{W/B}", converted_mana_cost: 2, colors_s: "WHITE,BLACK", rarity: "UNCOMMON" },
        { name: "Hallowed Burial", mana_cost: "3{W}{W}", converted_mana_cost: 5, colors_s: "WHITE", rarity: "RARE" },
        { name: "Lingering Tormenter", mana_cost: "3{B}", converted_mana_cost: 4, colors_s: "BLACK", rarity: "UNCOMMON" },
        { name: "Monstrify", mana_cost: "3{G}", converted_mana_cost: 4, colors_s: "GREEN", rarity: "COMMON" },
        { name: "Necroskitter", mana_cost: "1{B}{B}", converted_mana_cost: 3, colors_s: "BLACK", rarity: "RARE" },
        { name: "Mirror Sheen", mana_cost: "1{U/B}{U/R}", converted_mana_cost: 3, colors_s: "BLUE,RED", rarity: "RARE" },
      ]
      card_attrs.each { |c| exp.cards.create!(c) }
      # card_attrs.each { |c| MongoidCard.create!(name: c[:name], converted_mana_cost: c[:converted_mana_cost], expansion_sym: exp.sym) }
    end


    shm.tap do |exp|
      card_attrs = [
        { name: "Spectral Procession", mana_cost: "{2/W}{2/W}{2/W}", converted_mana_cost: 6, colors_s: "WHITE", rarity: "UNCOMMON", created_at: "2010-01-01T01:01:01.000001" },
        { name: "Reflecting Pool", mana_cost: "", converted_mana_cost: 0, colors_s: "", rarity: "RARE", created_at: "2010-01-01T01:01:01.000002" },
        { name: "Sygg, River Cuttthroat", mana_cost: "{U/B}{U/B}", converted_mana_cost: 2, colors_s: "BLUE,BLACK", rarity: "RARE", created_at: "2010-01-01T01:01:01.000003" },
        { name: "Goldenglow Moth", mana_cost: "{W}" , converted_mana_cost: 1, colors_s: "WHITE", rarity: "COMMON", created_at: "2010-01-01T01:01:01.000005" },
        { name: "Graven Cairns", mana_cost: "", converted_mana_cost: 0, colors_s: "", rarity: "RARE", created_at: "2010-01-01T01:01:01.000006" },
        { name: "Heartmender", mana_cost: "2{G/W}{G/W}", converted_mana_cost: 4, colors_s: "WHITE,GREEN", rarity: "RARE", created_at: "2010-01-01T01:01:01.000007" },
        { name: "Hollowsage", mana_cost: "3{B}", converted_mana_cost: 4, colors_s: "BLACK", rarity: "RARE", created_at: "2010-01-01T01:01:01.000008" },
        { name: "Lockjaw Snapper", mana_cost: "4", converted_mana_cost: 4, colors_s: "", rarity: "RARE", created_at: "2010-01-01T01:01:01.000009" },
        { name: "Oona's Gatewarden", mana_cost: "{U/B}", converted_mana_cost: 1, colors_s: "BLUE,BLACK", rarity: "UNCOMMON", created_at: "2010-01-01T01:01:01.000010" },
      ]
      card_attrs.each { |c| exp.cards.create!(c) }
      # card_attrs.each { |c| MongoidCard.create!(name: c[:name], converted_mana_cost: c[:converted_mana_cost], expansion_sym: exp.sym) }
    end
  end

  class ExpansionLoader < GraphQL::Batch::Loader
    def perform(syms)
      Expansion.where(sym: syms).each { |record| fulfill(record.sym, record) }
      syms.each { |id| fulfill(id, nil) unless fulfilled?(id) }
    end
  end

  GET_CARDS_TEMPLATE = <<-GRAPHQL
  query getCards(
    $sym: String!
    $first: Int
    $after: String
    $last: Int
    $before: String
    $orders: [CardOrderInput!]
    ) {
    expansion(sym: $sym) {
      %{field}(first: $first, after: $after, last: $last, before: $before, orders: $orders) {
        edges {
          node {
            name
          }
          cursor
        }
        pageInfo {
          startCursor
          endCursor
          hasNextPage
          hasPreviousPage
        }
        totalCount
        customData
      }
    }
  }
  GRAPHQL

  SHM_BY_ID = [
    "Spectral Procession",
    "Reflecting Pool",
    "Sygg, River Cuttthroat",
    "Goldenglow Moth",
    "Graven Cairns",
    "Heartmender",
    "Hollowsage",
    "Lockjaw Snapper",
    "Oona's Gatewarden",
  ]

  SHM_BY_NAME = [
    "Goldenglow Moth",
    "Graven Cairns",
    "Heartmender",
    "Hollowsage",
    "Lockjaw Snapper",
    "Oona's Gatewarden",
    "Reflecting Pool",
    "Spectral Procession",
    "Sygg, River Cuttthroat",
  ]

  SHM_BY_CMC = [ # also sorted by name
    "Graven Cairns",          # 0
    "Reflecting Pool",        # 0
    "Goldenglow Moth",        # 1
    "Oona's Gatewarden",      # 1
    "Sygg, River Cuttthroat", # 2
    "Heartmender",            # 4
    "Hollowsage",             # 4
    "Lockjaw Snapper",        # 4
    "Spectral Procession",    # 6
  ]
end
