# frozen_string_literal: true
require_relative "../dashboard_test"

class GraphQLProDashboardLimiterComponentTest < GraphQLProDashboardTest
  class QueryType < GraphQL::Schema::Object
    field :sleep, Float, null: false do
      argument :seconds, Float, required: true
    end

    def sleep(seconds:)
      Kernel.sleep(seconds)
      seconds
    end
  end

  def test_it_shows_a_getting_started_message_for_each_limiter
    @schema = Class.new(GraphQL::Schema) do
      query(QueryType)
    end
    get "/limiter/active_operations"
    assert_body_includes_link "graphql-ruby docs", "http://graphql-ruby.org/limiters/overview"

    get "/limiter/runtime"
    assert_body_includes_link "graphql-ruby docs", "http://graphql-ruby.org/limiters/overview"
  end
end
