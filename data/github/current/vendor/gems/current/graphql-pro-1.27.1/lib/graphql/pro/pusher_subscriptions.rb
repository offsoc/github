# frozen_string_literal: true
require "zlib"
require "json"

module GraphQL
  module Pro
    class PusherSubscriptions < GraphQL::Pro::Subscriptions
      attr_reader :pusher

      attr_reader :batch_size

      # @param schema [Class<GraphQL::Schema>]
      # @param redis [Redis]
      # @param pusher [Pusher, Class] A Pusher client
      def initialize(schema:, redis: nil, connection_pool: nil, pusher: nil, batch_size: 10, **rest)
        @pusher = pusher || Pusher
        # Pass `pusher: false` to avoid `@transport` in superclass
        super(schema: schema, redis: redis, connection_pool: connection_pool, pusher: false, **rest)
        @batch_size = batch_size
        @delivery_class = @batch_size > 1 ? BatchDelivery : Delivery
      rescue NameError => err
        if err.name == :Pusher
          raise "Failed to find constant `Pusher`. Either add `gem \"pusher\"` to your Gemfile, or pass an explicit `pusher:` option."
        else
          raise
        end
      end

      def execute_all(event, object)
        execute_all_with_backwards_compat(event, object)
      end

      def deliver(subscription_id, result)
        payload = prepare_payload(result)
        log_debug(result.query) { "deliver #{subscription_id}: #{result.to_h}" }
        @pusher.trigger(subscription_id, "update", payload)
        if !payload[:more]
          delete_subscription(subscription_id)
        end
      end

      def deliver_all(deliveries)
        payloads = deliveries.map do |(subscription_id, result)|
          {
            channel: subscription_id,
            name: "update",
            data: prepare_payload(result),
          }
        end
        log_debug(deliveries.first[1].query) { "deliver_all: #{deliveries.size} payload#{deliveries.size == 1 ? "" : "s"}" }
        @pusher.trigger_batch(payloads)
        payloads.each do |payload|
          if !payload[:data][:more]
            delete_subscription(payload[:channel])
          end
        end
      end

      # This is called with the payload when `compressed_result: true` is configured.
      # If needed, you can override this method to customize the stringification and compression.
      # (I'd love to hear _why_ you're doing it, if it's the case.)
      #
      # The client will also need to be ready for this compressed result.
      #
      # @return [String] A stringified, compressed, base64-encoded version of `result`
      # @param result [Hash] A GraphQL query result
      def compress(result)
        result_s = JSON.dump(result)
        compressed = Zlib.gzip(result_s)
        Base64.encode64(compressed)
      end

      # Implements `Subscriptions::Delivery`,
      # but stores deliveries into a batch before sending them.
      # Pusher only accepts up to 10 per batch.
      class BatchDelivery
        def initialize(subscriptions)
          @subscriptions = subscriptions
          @deliveries = []
        end

        def add(subscription_id, result)
          @deliveries << [subscription_id, result]
          if @deliveries.size >= @subscriptions.batch_size
            send_batch
          end
        end

        def finish
          send_batch
        end

        private

        def send_batch
          if @deliveries.size > 0 # Pusher returns an error if you send an empty batch
            @subscriptions.deliver_all(@deliveries)
            @deliveries.clear
          end
        end
      end

      private

      def still_subscribed?(subscription_id)
        channel_info = @pusher.channel_info(subscription_id)
        channel_info[:occupied]
      end

      def prepare_payload(result)
        result_h = result.to_h
        has_more = !result.context.namespace(:subscriptions)[:final_update]
        payload = { more: has_more }
        if result.context[:compress_pusher_payload]
          payload[:compressed_result] = compress(result_h)
        else
          payload[:result] = result_h
        end
        payload
      end

      # Receive webhooks from Pusher to remove items from the DB
      class WebhooksClient < GraphQL::Pro::Subscriptions::WebhooksClient
        def call_with_schema(schema, env)
          request = Rack::Request.new(env)
          webhook = ::Pusher::WebHook.new(request, schema.subscriptions.pusher)
          if webhook.valid?
            webhook.events.each do |event|
              case event["name"]
              when "channel_vacated"
                subscription_id = event["channel"]
                schema.subscriptions.delete_subscription(subscription_id)
              else
                # No worries, some event we don't care about
              end
            end
            [200, {}, [""]]
          else
            [401, {}, [""]]
          end
        end
      end
    end
  end
end
