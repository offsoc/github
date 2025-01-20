# frozen_string_literal: true
require_relative "./ably_subscriptions_test.rb"

class GraphQLProAblySubscriptionsConnectionPoolTest < Minitest::Test
  UNDERLYING_REDIS = Redis.new(db: REDIS_NUMBERS[:ably])
  CONN_POOL = ConnectionPool.new(size: 5, timeout: 5) { UNDERLYING_REDIS  }
  MOCK_ABLY = GraphQLProAblySubscriptionsTest::MockAbly.new

  def setup
    UNDERLYING_REDIS.script("flush")
    UNDERLYING_REDIS.flushdb

    MOCK_ABLY.channels.clear
    @database = UNDERLYING_REDIS
    @transport = MOCK_ABLY
    @subscription_arguments = [
      GraphQL::Pro::AblySubscriptions,
      {
        connection_pool: CONN_POOL,
        ably: MOCK_ABLY,
        broadcast: true,
        default_broadcastable: true,
      }
    ]
    super
  end

  def unsubscribe_env(subscription_id, event_name: "channel.closed")
    body = JSON.dump({ "items" => [{ "name" => event_name, "data" => { "channelId" => subscription_id } }] })
    binary_digest = OpenSSL::HMAC.digest("SHA256", "123", body)
    signature = Base64.encode64(binary_digest).strip
    {
      "HTTP_X_ABLY_SIGNATURE" => signature,
      "HTTP_X_ABLY_KEY" => "abcdef",
      "rack.input" => StringIO.new(body)
    }
  end

  include SubscriptionsAssertions
end



class GraphQLProAblySubscriptionsConnectionPoolAndNamespaceTest < Minitest::Test
  UNDERLYING_REDIS = Redis::Namespace.new(:ably2, redis: Redis.new(db: REDIS_NUMBERS[:ably]))
  CONN_POOL = ConnectionPool.new(size: 5, timeout: 5) { UNDERLYING_REDIS  }
  MOCK_ABLY = GraphQLProAblySubscriptionsTest::MockAbly.new

  def setup
    UNDERLYING_REDIS.redis.script("flush")
    UNDERLYING_REDIS.redis.flushdb

    MOCK_ABLY.channels.clear
    @database = UNDERLYING_REDIS
    @transport = MOCK_ABLY
    @subscription_arguments = [
      GraphQL::Pro::AblySubscriptions,
      {
        connection_pool: CONN_POOL,
        ably: MOCK_ABLY,
        broadcast: true,
        default_broadcastable: true,
      }
    ]
    super
  end

  def unsubscribe_env(subscription_id, event_name: "channel.closed")
    body = JSON.dump({ "items" => [{ "name" => event_name, "data" => { "channelId" => subscription_id } }] })
    binary_digest = OpenSSL::HMAC.digest("SHA256", "123", body)
    signature = Base64.encode64(binary_digest).strip
    {
      "HTTP_X_ABLY_SIGNATURE" => signature,
      "HTTP_X_ABLY_KEY" => "abcdef",
      "rack.input" => StringIO.new(body)
    }
  end

  include SubscriptionsAssertions
end
