# frozen_string_literal: true
require "test_helper"

class GraphQLProRoutesTest < Minitest::Test
  parallelize_me!

  using GraphQL::Pro::Routes

  class ExampleRouteSchema < GraphQL::Schema
    class Query < GraphQL::Schema::Object
      field :f, Int, null: true
    end
    query(Query)
    subscription(Query)
    use(GraphQL::Pro::PusherSubscriptions, redis: {}, pusher: :noop)
    use(GraphQL::Pro::OperationStore)
  end

  class ExampleAblySchema < GraphQL::Schema
    class Query < GraphQL::Schema::Object
      field :f, Int, null: true
    end
    query(Query)
    subscription(Query)
    use(GraphQL::Pro::AblySubscriptions, redis: {}, ably: OpenStruct.new(options: { key: "abc.def:ghi" }))
  end

  class ExamplePusherSchema < GraphQL::Schema
    class Query < GraphQL::Schema::Object
      field :f, Int, null: true
    end
    query(Query)
    subscription(Query)
    use(GraphQL::Pro::PusherSubscriptions, redis: {}, pusher: OpenStruct.new)
  end

  class ExamplePubnubSchema < GraphQL::Schema
    class Query < GraphQL::Schema::Object
      field :f, Int, null: true
    end
    query(Query)
    subscription(Query)
    use(GraphQL::Pro::PubnubSubscriptions, redis: {}, pubnub: OpenStruct.new)
  end

  def test_it_adds_route_methods_to_a_schema
    assert_instance_of GraphQL::Pro::PusherSubscriptions::WebhooksClient, ExampleRouteSchema.pusher_webhooks_client
    assert_instance_of GraphQL::Pro::Dashboard, ExampleRouteSchema.dashboard
    assert_instance_of GraphQL::Pro::OperationStore::Endpoint, ExampleRouteSchema.operation_store_sync

    assert_instance_of GraphQL::Pro::AblySubscriptions::WebhooksClient, ExampleAblySchema.ably_webhooks_client
    assert_instance_of GraphQL::Pro::PusherSubscriptions::WebhooksClient, ExamplePusherSchema.pusher_webhooks_client
    assert_instance_of GraphQL::Pro::PubnubSubscriptions::WebhooksClient, ExamplePubnubSchema.pubnub_webhooks_client
  end

  def test_it_can_build_lazy_routes
    lazy_dashboard = GraphQL::Pro::Dashboard.new(schema_class_name: "GraphQLProRoutesTest::ExampleRouteSchema")
    lazy_dashboard.call({ "PATH_INFO" => "/static/blah" })
    expected_routes = ExampleRouteSchema.dashboard.instance_variable_get(:@dispatcher).instance_variable_get(:@routing_table)
    lazy_routes = lazy_dashboard.instance_variable_get(:@dispatcher).instance_variable_get(:@routing_table)
    assert_equal expected_routes, lazy_routes
  end

  def test_it_has_lazy_route_helpers
    lazy_dashboard = GraphQL::Pro::Routes::Lazy.new(schema_class_name: "GraphQLProRoutesTest::ExampleRouteSchema")
    assert_instance_of GraphQL::Pro::PusherSubscriptions::WebhooksClient, lazy_dashboard.pusher_webhooks_client
    assert_instance_of GraphQL::Pro::Dashboard, lazy_dashboard.dashboard
    assert_instance_of GraphQL::Pro::OperationStore::Endpoint, lazy_dashboard.operation_store_sync

    assert_instance_of GraphQL::Pro::AblySubscriptions::WebhooksClient, lazy_dashboard.ably_webhooks_client
    assert_instance_of GraphQL::Pro::PusherSubscriptions::WebhooksClient, lazy_dashboard.pusher_webhooks_client
    assert_instance_of GraphQL::Pro::PubnubSubscriptions::WebhooksClient, lazy_dashboard.pubnub_webhooks_client
  end
end
