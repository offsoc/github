# frozen_string_literal: true
require "digest"

module GraphQL
  module Pro
    class AblySubscriptions < GraphQL::Pro::Subscriptions
      attr_reader :ably

      # @param cipher_base [String] If provided, it's combined with `subscription_id` to make a cipher key for Ably's end-to-end encryption.
      def initialize(redis: nil, connection_pool: nil, ably:, schema:, cipher_base: nil, **rest)
        @ably = ably
        @cipher_base = cipher_base
        super(schema: schema, redis: redis, connection_pool: connection_pool, pusher: false, **rest)
      end

      def execute_all(event, object)
        execute_all_with_backwards_compat(event, object)
      end

      ENCRYPTED_PREFIX = "ablyencr-"

      # Override this method to add a prefix when a cipher should be used for this subscription.
      # That way, we can tell which subscriptions need a cipher by the subscription ID alone.
      def build_id
        "#{@cipher_base ? ENCRYPTED_PREFIX : ""}#{super}"
      end

      # Override this method to add the cipher key to
      # context so it can be returned in a header.
      def write_subscription(query, events)
        super
        if @cipher_base
          sub_id = query.context[:subscription_id]
          query.context[:ably_cipher_base64] = to_cipher_key(sub_id)
        end
        nil
      end

      def deliver(subscription_id, result)
        has_more = !result.context.namespace(:subscriptions)[:final_update]
        payload = { result: result.to_h, more: has_more }
        ably_channel = channel_for(subscription_id)
        ably_message = Ably::Models::Message.new(name: "update", data: payload )
        # Since we're not using the return value here,
        # use `quickAck: true` to reduce latency, as seen here:
        # https://github.com/ably/ably-ruby/blob/3da9dfb3d921d2bd7374257700f7d033dd6e6bda/lib/ably/rest/channel.rb#L70
        log_debug(result.query) { "deliver #{subscription_id}" }
        ably_channel.publish(ably_message, quickAck: true)
        if !has_more
          delete_subscription(subscription_id)
        end
      end

      private

      def still_subscribed?(subscription_id)
        ably_channel = channel_for(subscription_id)
        subscribers = ably_channel.presence.get.items
        subscribers.any?
      end

      # Return the channel for this `subscription_id`,
      # with `cipher` configuration added if appropriate.
      # @return [Ably::Rest::Channel]
      def channel_for(subscription_id)
        opts = {}
        if @cipher_base && use_cipher?(subscription_id)
          key = to_cipher_key(subscription_id)
          opts[:cipher] = { key: key }
        end
        @ably.channel(subscription_id, **opts)
      end

      # Make a per-subscription cipher key, using the configured `cipher_base:`
      def to_cipher_key(subscription_id)
        Digest::SHA256.base64digest(@cipher_base + subscription_id)
      end

      def use_cipher?(subscription_id)
        # Usually it would be `.start_with?`, but technically we support `id_prefix`
        @cipher_base && subscription_id.include?(ENCRYPTED_PREFIX)
      end

      # Receive webhooks from Ably to remove items from the DB
      # @api private
      class WebhooksClient < GraphQL::Pro::Subscriptions::WebhooksClient
        def call_with_schema(schema, env)
          if @ably_key.nil?
            ably_client_key = schema.subscriptions.ably.options[:key]
            _ably_app_id, ably_api_key = ably_client_key.split(".")
            @ably_key, @ably_secret = ably_api_key.split(":")
          end
          request = Rack::Request.new(env)
          body = request.body.read
          payload = JSON.load(body)

          # Get the auth headers from this request
          incoming_signature = request.env["HTTP_X_ABLY_SIGNATURE"]
          incoming_key = request.env["HTTP_X_ABLY_KEY"]

          # Generate the expected values for those headers
          expected_key = @ably_key
          expected_binary_digest = OpenSSL::HMAC.digest("SHA256", @ably_secret, body)
          expected_signature = Base64.encode64(expected_binary_digest).strip

          # Make sure the headers match the generated, expected values
          if incoming_key != expected_key || expected_signature != incoming_signature
            # Bad request, auth headers didn't match
            [401, {}, [""]]
          elsif payload && payload["items"]
            # When channels are closed, remove our record of the subscription.
            payload["items"].each do |item|
              case item["name"]
              when "channel.closed", "presence.leave"
                subscription_id = item["data"]["channelId"]
                schema.subscriptions.delete_subscription(subscription_id)
              when "presence.message"
                subscription_id = item["data"]["channelId"]
                item["data"]["presence"].each do |presence_data|
                  if presence_data["action"] == 3 # leave
                    schema.subscriptions.delete_subscription(subscription_id)
                  end
                end
              else
                # ignore others
              end
            end
            [200, {}, [""]]
          else
            [200, {}, [""]]
          end
        end
      end
    end
  end
end
