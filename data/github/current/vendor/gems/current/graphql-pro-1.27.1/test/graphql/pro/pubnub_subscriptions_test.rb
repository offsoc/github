# frozen_string_literal: true
require "test_helper"

class GraphQLProPubnubSubscriptionsTest < Minitest::Test
  REDIS = Redis.new(db: REDIS_NUMBERS[:pubnub])

  class MockPubnub
    class Channel
      attr_accessor :occupied
      attr_reader :updates
      attr_reader :id

      def initialize(id)
        @id = id
        @occupied = false
        @updates = []
      end
    end

    def initialize
      @channels = Hash.new { |h, k| h[k] = Channel.new(k) }
    end

    # Mock pubnub:
    def publish(channel:, message:, http_sync:)
      if http_sync != true
        raise "http_sync must be true"
      end
      self.channel(channel).updates << message
      # this actually returns an envelope, but we ignore it
      nil
    end

    def here_now(channel:, http_sync:)
      if http_sync != true
        raise "http_sync must be true"
      end


      OpenStruct.new(
        result: {
          data: {
            occupancy: self.channel(channel).occupied ? 1 : 0,
          }
        }
      )
    end

    # Testing:
    def channel(channel_name)
      @channels[channel_name]
    end
  end

  MOCK_PUBNUB = MockPubnub.new

  def setup
    REDIS.flushdb
    @database = REDIS
    @transport = MOCK_PUBNUB
    @subscription_arguments = [
      GraphQL::Pro::PubnubSubscriptions,
      {
        redis: REDIS,
        pubnub: MOCK_PUBNUB,
        broadcast: true,
        default_broadcastable: true
      }
    ]
    super
  end

  def unsubscribe_env(subscription_id)
    body = "status=inactive&channel=#{subscription_id}"

    {
      "CONTENT_TYPE" => "multipart/form-data",
      "rack.input" => StringIO.new(body),
    }
  end

  include SubscriptionsAssertions
end
