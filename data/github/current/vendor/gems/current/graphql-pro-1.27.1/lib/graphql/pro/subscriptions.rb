# frozen_string_literal: true
require "graphql/pro/subscriptions/pusher_transport"
require "graphql/pro/subscriptions/redis_storage"
require "graphql/pro/subscriptions/webhooks_client"
require "forwardable"

module GraphQL
  module Pro
    class Subscriptions < GraphQL::Subscriptions
      extend Forwardable

      def self.use(*args, **kwargs)
        if self == GraphQL::Pro::Subscriptions
          warn("GraphQL::Pro::Subscriptions is deprecated; use GraphQL::Pro::PusherSubscriptions instead. (It works the same, plus it cleans up orphaned subscription records.)")
        end
        super
      end

      # @param schema [Class<GraphQL::Schema>]
      # @param redis [Redis]
      # @param cleanup_delay_s [Integer] Number of seconds to wait before cleaning up brand new subscriptions
      # @param stale_ttl_s [Integer] Clean up subscriptions after this many seconds have passed without pushing an update.
      #    In theory, this shouldn't be necessary, but evidently there are some weird edge cases, so you could set this for a long duration.
      def initialize(schema:, redis: nil, connection_pool: nil, cleanup_delay_s: 5, pusher: nil, stale_ttl_s: nil, **rest)
        redis || connection_pool || raise(ArgumentError, "#{self.class} requires either `redis:` or `connection_pool:`, please add one of them")
        super(schema: schema, **rest)
        # TODO extract PusherSubscriptions as a separate class
        # This is required because AblySubscriptions extends this class
        if pusher != false
          @transport = PusherTransport.new(pusher: pusher || Pusher)
        end
        @cleanup_delay_s = cleanup_delay_s
        @new_subscriptions = Gem::Version.new(GraphQL::VERSION) >= Gem::Version.new("1.11.0")
        @storage = Pro::Subscriptions::RedisStorage.new(redis: redis, connection_pool: connection_pool, subscriptions: self, stale_ttl: stale_ttl_s)
        @delivery_class = Delivery
      end

      # This is used for backwards compatibility between 1.11+ and older versions
      # @api private
      attr_accessor :new_subscriptions

      attr_reader :delivery_class

      def_delegators :@storage, :read_subscription
      def_delegators :@transport, :deliver

      # These are for the UI:
      def_delegators :@storage, :topics, :each_subscription_id, :clear

      # @api private
      def execute_all_with_backwards_compat(event, object)
        topic_has_any_subscriptions = false
        delivery = self.delivery_class.new(self)
        # This fetches subscriptions stored since 1.11+ was adopted by the application,
        # and runs them with the new algorithm.
        @storage.each_fingerprint_and_subscription_ids(event.topic) do |event_fingerprint, fingerprint_subscription_ids|
          topic_has_any_subscriptions = true
          # This will be populated by the first fingerprint that's still online.
          # (It might not be populated at all, if all subscribers have gone offline)
          # (Use a sentinel value because `execute_update` might legitimately return `nil`)
          first_result = :not_executed
          still_subscribed_fingerprint_sub_ids = filter_still_subscribed(fingerprint_subscription_ids)
          still_subscribed_fingerprint_sub_ids.each do |fingerprint_sub_id|
            if first_result == :not_executed
              first_result = execute_update(fingerprint_sub_id, event, object)
            end
            # Deliver the result to this fingerprint (may be reused from a previous iteration)
            if first_result
              delivery.add(fingerprint_sub_id, first_result)
            end
          end
        end

        delivery.finish

        # This is for backwards compat, it finds subscriptions stored in the old way,
        # and it evaluates them and delivers them in the old way.
        legacy_sub_ids = []
        @storage.each_subscription_id_legacy(event.topic) do |subscription_id|
          topic_has_any_subscriptions = true
          legacy_sub_ids << subscription_id
        end

        active_legacy_sub_ids = filter_still_subscribed(legacy_sub_ids)
        active_legacy_sub_ids.each do |subscription_id|
          execute(subscription_id, event, object)
        end

        if !topic_has_any_subscriptions
          @storage.remove_topic(event.topic)
        end
      end

      def write_subscription(query, events)
        # Get the channel prefix to support private Pusher channels
        id_prefix = query.context[:channel_prefix] || ""
        query.context[:subscription_id] = "#{id_prefix}#{build_id}"
        log_debug(query) { "write_subscription #{query.context[:subscription_id]}" }
        @storage.write_subscription(query, events)
      end

      def delete_subscription(subscription_id, subscription: nil)
        log_debug(@schema) { "delete_subscription #{subscription_id}" }
        @storage.delete_subscription(subscription_id, subscription: subscription)
      end

      # This is called on a GraphQL::Query::Context
      # and should return a string, which will be stored in Redis.
      # @param ctx [GraphQL::Query::Context]
      # @return [String]
      def dump_context(ctx)
        GraphQL::Subscriptions::Serialize.dump(ctx.to_h)
      end

      # Given a stringified context from Redis,
      # Return a hash for passing as `context:` to `.execute`
      # @param ctx_str [String] A value returned from {#dump_context}
      # @return [Hash] Key-value pairs for `context:`
      def load_context(ctx_str)
        GraphQL::Subscriptions::Serialize.load(ctx_str)
      end

      # Called when an error is encountered when reloading query data from storage
      # @param subscription_id [String] The Subscription ID that was being loaded
      # @param query_data [Hash<String => String>] Raw data from Redis
      # @param error [StandardError] The error encountered when trying to reload the query
      # @return [void]
      # @example Suppressing the error and deleting the subscription
      #
      #   class ErrorHandlingSubscriptions < GraphQL::Pro::PusherSubscriptions
      #     def read_subscription_failed_error(subscription_id, _query_data, error)
      #       BugTracker.report(error)
      #       delete_subscription(subscription_id)
      #     end
      #   end
      def read_subscription_failed_error(subscription_id, query_data, error)
        raise error
      end

      class Delivery
        def initialize(subscriptions)
          @subscriptions = subscriptions
        end

        def add(subscription_id, result)
          @subscriptions.deliver(subscription_id, result)
        end

        def finish
          # no-op
        end
      end

      private

      def filter_still_subscribed(subscription_ids)
        subscribed_ids, unsubscribed_ids = subscription_ids.partition { |sid| still_subscribed?(sid) }
        if unsubscribed_ids.any?
          subscriptions = @storage.read_subscriptions(unsubscribed_ids)
          # It's possible that some of these IDs point to empty data and the above returned `nil`
          subscriptions.compact!
          if @cleanup_delay_s > 0
            subscriptions.each do |subscription|
              sub_id = subscription[:context][:subscription_id]
              # Only new subscriptions will have this key,
              # don't apply the delay to previously-created ones (since we have no data)
              if subscription[:created_at] && Time.now.to_i < (subscription[:created_at] + @cleanup_delay_s)
                subscribed_ids << sub_id
                unsubscribed_ids.delete(sub_id)
              else
                delete_subscription(sub_id, subscription: subscription)
              end
            end
          else
            subscriptions.each do |subscription|
              subscription_id = subscription[:context][:subscription_id]
              delete_subscription(subscription_id, subscription: subscription)
            end
          end
        end
        @storage.reset_ttl(subscribed_ids)
        subscribed_ids
      end

      def still_subscribed?(subscription_id)
        raise "Implementations must use this method to check if the channel is still in use and return true/false"
      end

      def log_debug(loggable)
        logger = (loggable.respond_to?(:logger) && loggable.logger) || (loggable.respond_to?(:default_logger) && loggable.default_logger)
        if logger
          logger.debug { "[#{self.class}] #{yield}"}
        end
      end
    end
  end
end
