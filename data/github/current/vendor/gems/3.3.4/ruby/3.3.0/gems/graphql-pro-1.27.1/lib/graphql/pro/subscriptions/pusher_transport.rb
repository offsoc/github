# frozen_string_literal: true
module GraphQL
  module Pro
    class Subscriptions < GraphQL::Subscriptions
      # @api private
      class PusherTransport
        def initialize(pusher:)
          @pusher = pusher
        end

        def deliver(subscription_id, result)
          payload = { result: result.to_h, more: true }
          @pusher.trigger(subscription_id, "update", payload)
        end
      end
    end
  end
end
