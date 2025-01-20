# frozen_string_literal: true
require "test_helper"

class GraphQLProAccessInstrumentationAuthorizedResolveTest < Minitest::Test
  class CustomStrategy
    def allowed?(*)
      true
    end
  end

  if rails_loaded?
    def test_allowed_value_handles_relations_with_custom_strategies
      query = GraphQL::Query.new(ConnectionHelpers::Schema, "{ __typename }", context:  { GraphQL::Pro::Access::STRATEGY_KEY => CustomStrategy.new })
      ctx = query.context
      value = ConnectionHelpers::Expansion.first.cards
      type = ConnectionHelpers::ExpansionType.to_list_type
      runtime_gate = GraphQL::Pro::Access::Instrumentation::RuntimeTypeGate.new(type)
      merged_gate = GraphQL::Pro::Access::Instrumentation::MergedGate.new(nil, runtime_gate)
      res = GraphQL::Pro::Access::Instrumentation::AuthorizedResolve::AllowedValue.call(merged_gate, ctx, type, value)
      # Previously this would raise an error without a #scope method
      assert res.is_a?(GraphQL::Pro::Access::Instrumentation::AuthorizedResolve::AllowedList)
    end
  end
end
