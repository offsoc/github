# frozen_string_literal: true

module GraphQL
  module Pro
    class PubnubSubscriptions < GraphQL::Pro::Subscriptions
      def initialize(redis:, pubnub:, schema:, **rest)
        @pubnub = pubnub
        super(schema: schema, redis: redis, pusher: false, **rest)
      end

      def execute_all(event, object)
        execute_all_with_backwards_compat(event, object)
      end

      def deliver(subscription_id, result)
        more = !result.context.namespace(:subscriptions)[:final_update]
        payload = { result: result.to_h, more: more }
        @pubnub.publish(
          channel: subscription_id,
          message: payload,
          http_sync: true,
        )
        if !more
          delete_subscription(subscription_id)
        end
      end

      private

      def still_subscribed?(subscription_id)
        envelope = @pubnub.here_now(channel: subscription_id, http_sync: true)
        api_result = envelope.result
        api_result[:data][:occupancy] > 0
      end

      # Receive webhooks from Pubnub to remove items from the DB.
      # It should receive the `active/inactive` payload (not `join/leave/timeout/state-change`)
      class WebhooksClient < GraphQL::Pro::Subscriptions::WebhooksClient
        def call_with_schema(schema, env)
          request = Rack::Request.new(env)
          if request.form_data?
            # We expect the data to come as `Content-Type: multipart/form-data`,
            # see https://www.pubnub.com/docs/chat/reference/presence#use-presence-webhooks
            data = request.POST
            if data["status"] == "inactive"
              subscription_id = data["channel"]
              schema.subscriptions.delete_subscription(subscription_id)
            end
          else
            # Maybe it was accidentally the `join/leave/timeout/state-change` payload,
            # which comes as JSON
          end
          [200, {}, [""]]
        end
      end
    end
  end
end
