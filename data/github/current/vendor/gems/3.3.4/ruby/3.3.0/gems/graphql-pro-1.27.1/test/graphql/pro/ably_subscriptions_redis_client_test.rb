# frozen_string_literal: true
require_relative "./ably_subscriptions_test.rb"

class GraphQLProAblySubscriptionsRedisClientTest < Minitest::Test
  REDIS_CONFIG = RedisClient.config(db: REDIS_NUMBERS[:ably_redis_client])
  REDIS_CLIENT = REDIS_CONFIG.new_pool(timeout: 0.5, size: 5)
  MOCK_ABLY = GraphQLProAblySubscriptionsTest::MockAbly.new

  def setup
    REDIS_CLIENT.call("script", "flush")
    REDIS_CLIENT.call("flushdb")

    MOCK_ABLY.channels.clear
    @database = GraphQL::Pro::RedisScriptClient::RedisClientRedis::RedisClientWrapper.new(REDIS_CLIENT)
    @transport = MOCK_ABLY
    @subscription_arguments = [
      GraphQL::Pro::AblySubscriptions,
      {
        redis: REDIS_CLIENT,
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
