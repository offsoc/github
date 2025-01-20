# frozen_string_literal: true
require_relative "../dashboard_test"

class GraphQLProDashboardSubscriptionsComponentTest < GraphQLProDashboardTest
  class SubscriptionsTestSchema < GraphQL::Schema
    class CustomSubscriptions < GraphQL::Pro::PusherSubscriptions
      def read_subscription_failed_error(sub_id, query_data, err)
        delete_subscription(sub_id)
      end
    end

    REDIS = Redis.new(db: REDIS_NUMBERS[:dashboard])

    class Query < GraphQL::Schema::Object
      field :int, Integer, null: false
    end

    class ClockTicked < GraphQL::Schema::Subscription
      field :value, Integer, null: false
    end

    class Subscription < GraphQL::Schema::Object
      field :clock_ticked, subscription: ClockTicked
    end

    query(Query)
    subscription(Subscription)
    use CustomSubscriptions, pusher: MockPusher.new, redis: REDIS
  end

  def setup
    @schema = SubscriptionsTestSchema
    SubscriptionsTestSchema::REDIS.flushdb
  end

  def exec(*args, **kwargs)
    @schema.execute(*args, **kwargs)
  end

  # See the Integration tests in test/sinatra
  def test_it_renders_disabled
    @schema = OperationStoreHelpers::ActiveRecordBackendSchema
    get "/topics"
    assert_equal 200, last_response.status
    assert_body_includes "SubscriptionsComponent"
    assert_body_includes "is not configured"
    assert_body_includes "http://graphql-ruby.org/subscriptions/pusher_implementation"
  end

  def test_it_renders_new_and_old_subscriptions
    get "/topics"
    assert_equal 200, last_response.status
    refute_body_includes "is not configured"

    query_opts = {}
    query_str = "subscription { clockTicked { value } }"

    @schema.subscriptions.new_subscriptions = false
    res1 = exec(query_str, **query_opts)
    res2 = exec(query_str, **query_opts)

    get "/topics"
    assert_body_includes '<td><a href="/topics/:clockTicked:" >:clockTicked:</a></td>'
    assert_body_includes '<td>2</td>'

    @schema.subscriptions.new_subscriptions = true
    res3 = exec(query_str, **query_opts)
    res4 = exec(query_str, **query_opts)

    get "/topics"
    assert_body_includes '<td><a href="/topics/:clockTicked:" >:clockTicked:</a></td>'
    assert_body_includes '<td>4</td>'

    get "/topics/:clockTicked:"
    assert_body_includes "4 Subscribers"
    [res1, res2, res3, res4].each_with_index do |res, idx|
      assert res.context[:subscription_id], "Res #{idx} has an ID"
      assert_body_includes res.context[:subscription_id]
    end

    [res1, res2, res3, res4].each_with_index do |res, idx|
      get "/subscriptions/#{res.context[:subscription_id]}"
      assert_body_includes res.context[:subscription_id]
      assert_body_includes query_str
    end

    res5 = exec(query_str, context: { bogus: { "__gid__" => "gid://bogus" } })
    get "/subscriptions/#{res5.context[:subscription_id]}"
    assert_body_includes res5.context[:subscription_id]
    assert_body_includes "This subscription was not found or is no longer active."
  end
end
