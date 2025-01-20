# frozen_string_literal: true
require "test_helper"

class GraphQLProSubscriptionsWebhooksClientTest < Minitest::Test
  class GenericWebhookClient < GraphQL::Pro::Subscriptions::WebhooksClient
    def call_with_schema(schema, env)
      env[:example_schema] = schema
    end
  end
  class ExampleSchema; end

  def test_it_lazily_looks_up_schemas_by_name
    client = GenericWebhookClient.new(schema_class_name: "GraphQLProSubscriptionsWebhooksClientTest::ExampleSchema")
    assert_nil client.instance_variable_get(:@schema)
    env = {}
    client.call(env)
    assert_equal ExampleSchema, env[:example_schema]
    assert_equal ExampleSchema, client.instance_variable_get(:@schema)
  end

  def test_it_requires_schema_or_schema_class_name
    assert_raises ArgumentError do
      GenericWebhookClient.new
    end
  end
end
