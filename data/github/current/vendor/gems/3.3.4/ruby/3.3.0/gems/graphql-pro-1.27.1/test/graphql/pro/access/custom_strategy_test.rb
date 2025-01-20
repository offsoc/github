# frozen_string_literal: true
require_relative "../access_test"

class GraphQLProAccessCustomTest < Minitest::Test
  include GraphQLProAccessBase

  class CustomStrategy
    CALLS = []

    def initialize(ctx)
      @user = ctx[:current_user]
    end

    def allowed?(gate, value)
      CALLS << [gate, value]
      case gate.role
      when :always
        true
      when :never
        false
      when :creator
        value.id == "5"
      when :admin
        if value.is_a? OpenStruct
          @user.allowed_ids.include?(value.id)
        else
          false
        end
      else
        true
      end
    end
  end

  def setup
    CustomStrategy::CALLS.clear
  end

  def auth_strategy
    CustomStrategy
  end

  def current_user
    OpenStruct.new(allowed_ids: ["2", "5"], name: "rmosolgo")
  end

  def test_it_applies_unauthorized_fields_handler
    schema = build_schema.redefine do
      unauthorized_fields ->(nodes, ctx) {
        fields = nodes.map(&:definition).map(&:name).join(", ")
        raise "#{nodes.length} unauthorized fields for #{ctx[:current_user].name}: #{fields}"
      }
    end

    query_str = <<-GRAPHQL
    {
      s2: sandwich(id: 2) {
        bread
        toppings { name }
      }
    }
    GRAPHQL

    err = assert_raises(RuntimeError) { schema.execute(query_str, context: { current_user: current_user }) }
    assert_equal "1 unauthorized fields for rmosolgo: toppings", err.message
  end

  def test_it_disallows_authorizing_composite_types
    assert_raises(RuntimeError) {
      t = EntreeType.graphql_definition.redefine(authorize: :admin)
      # Trigger the definition:
      t.name
    }
  end

  def test_it_applies_the_fallback_to_each_field
    query_str = <<-GRAPHQL
    {
      s2: sandwich(id: 2) {
        bread
      }
    }
    GRAPHQL

    res = exec_query(query_str, default_auth: {view: :fallback_test})

    assert_equal "WHEAT", res["data"]["s2"]["bread"]
    first_default_call = CustomStrategy::CALLS.first
    assert_equal 2, first_default_call.size, "It's a gate and a value"
    assert_equal :fallback_test, first_default_call[0].role
    assert_equal "sandwich", first_default_call[0].owner.name, "The role was applied to the field"
    assert_nil first_default_call[1]
  end
end
