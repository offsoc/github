# frozen_string_literal: true
require "test_helper"

class PlaneswalkerPolicy
  def initialize(user, obj)
    @user = user
    @obj = obj
  end

  class Scope
    def initialize(user, rel)
      @user = user
      @rel = rel
    end

    def resolve
      if @rel.is_a?(Mongoid::Criteria)
        @rel.where(:converted_mana_cost.gt => @user)
      else
        @rel.where("converted_mana_cost > ?", @user)
      end
    end
  end

  def planeswalker?
    case @obj
    when ConnectionHelpers::Card
      @obj.converted_mana_cost > @user
    else
      true
    end
  end
end

class ScopingAbility
  include CanCan::Ability

  def initialize(user)
    can :planeswalker, :all
    cannot :planeswalker, ConnectionHelpers::Card, ["converted_mana_cost < ?", user] do |card|
      card.converted_mana_cost < user
    end
  end
end

class CustomScopingStrategy
  def initialize(ctx)
    @val = ctx[:cmc]
  end

  def scope(gate, relation)
    if relation.is_a?(Mongoid::Criteria)
      relation.where(:converted_mana_cost.gt => @val)
    else
      relation.where("converted_mana_cost > ?.0", @val)
    end
  end

  def allowed?(gate, value)
    true
  end
end

if MODERN_RAILS
  class GraphQLProAccessScopingTest < Minitest::Test
    include AccessRelayHelpers
    include ConnectionHelpers

    ALL_CARDS_QUERY = <<-GRAPHQL
    query GetCards($after: String){
      expansion(sym: "SHM") {
        # Test a list
        cards_list {
          name
        }
        # Test a connection
        auto_cards(first: 3, after: $after) {
          edges {
            node {
              name
              converted_mana_cost
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
    GRAPHQL

    PRINTABLES_QUERY = <<~GRAPHQL
    {
      printables {
        ... on Card {
          name
        }
        ... on Expansion {
          name
        }
        printings {
          card {
            name
          }
        }
      }
    }
    GRAPHQL

    MONGOID_CARDS_QUERY = <<-GRAPHQL
    {
      expansion(sym: "SHM") {
        mongoid_cards {
          name
          converted_mana_cost
        }
      }
    }
    GRAPHQL

    def setup
      reset_data
    end

    def get_cards_list(res)
      res["data"]["expansion"]["cards_list"]
    end

    def get_auto_cards(res)
      res["data"]["expansion"]["auto_cards"]["edges"].map { |e| e["node"]}
    end

    def get_auto_cards_page_info(res)
      res["data"]["expansion"]["auto_cards"]["pageInfo"]
    end


    EXPECTED_NAMES = [
      "Spectral Procession",
      "Heartmender",
      "Hollowsage",
      "Lockjaw Snapper",
    ]

    # Since the primary key is different here,
    # the default sort is also different
    EXPECTED_AUTO_NAMES = EXPECTED_NAMES.sort

    def check_filtered_output(schema, sql_filter:)
      skip "This is broken on class-based"
      log = StringIO.new
      res = with_sql_log(io: log) do
        # As a weird test of the system, I'm using `3` as the current user :laughing:
        schema.execute(ALL_CARDS_QUERY, context: { cmc: 3 })
      end
      assert_equal 2, log.string.scan(/#{Regexp.quote(sql_filter)}/).count
      assert_equal EXPECTED_NAMES, get_cards_list(res).map { |c| c["name"] }
      assert_equal EXPECTED_AUTO_NAMES[0..2], get_auto_cards(res).map { |c| c["name"] }
      assert_equal true, get_auto_cards_page_info(res)["hasNextPage"]

      last_cursor = get_auto_cards_page_info(res)["endCursor"]
      res = schema.execute(ALL_CARDS_QUERY, context: { cmc: 3 }, variables: {"after" => last_cursor})
      assert_equal EXPECTED_AUTO_NAMES[3..-1], get_auto_cards(res).map { |c| c["name"] }
      assert_equal false, get_auto_cards_page_info(res)["hasNextPage"]
    end

    def check_mongoid_output(schema)
      # Basically just test that > 3 is applied by the scope method
      res = schema.execute(MONGOID_CARDS_QUERY, context: { cmc: 3 })
      returned_names = res["data"]["expansion"]["mongoid_cards"].map { |c| c["name"]}
      # Don't use sorted names here because Mongoid doesn't have the composite primary key
      expected_names = EXPECTED_NAMES
      assert_equal expected_names, returned_names
    end

    def test_pundit_filters_properly
      schema = get_schema(:pundit,
        fallback: { authorize: { role: :planeswalker, pundit_policy_name: "PlaneswalkerPolicy" } },
        current_user: :cmc,
      )
      check_filtered_output(schema, sql_filter: "AND (converted_mana_cost > 3)")
      check_mongoid_output(schema)
    end

    def test_cancan_filters_properly
      schema = get_schema(:cancan, { ability_class: ScopingAbility, fallback: { authorize: :planeswalker }, current_user: :cmc })
      check_filtered_output(schema, sql_filter: "AND (not (converted_mana_cost < 3))")
      # CanCan doesn't support mongoid yet, as far as I can tell.
      # check_mongoid_output(schema)
    end

    def test_custom_filters_properly
      schema = get_schema(CustomScopingStrategy, { fallback: { authorize: :planeswalker } })
      check_filtered_output(schema, sql_filter: "AND (converted_mana_cost > 3.0)")
      check_mongoid_output(schema)
    end

    def test_abstract_type_list_with_pundit_doesnt_crash
      skip "Not updating for AST analysis"
      schema = get_schema(:pundit)
      res = schema.execute(PRINTABLES_QUERY)
      names = res["data"]["printables"].map { |x| x["name"] }
      assert_equal Card.all.length, names.length
    end
  end
end
