# frozen_string_literal: true
require "graphql/pro/redis_script_client"

module GraphQL
  module Pro
    class Subscriptions < GraphQL::Subscriptions
      # @api private
      class RedisStorage
        PREFIX = "gql:sub:"

        class ScriptClient < GraphQL::Pro::RedisScriptClient
          register :filter_active_subscriptions, <<-LUA
            local topic_key = KEYS[1]
            local subscription_keys = {unpack(KEYS, 2)}
            local all_subscription_ids = ARGV
            local active_subscription_ids = {}
            local inactive_subscription_ids = {}
            local inactive_subscription_keys = {}
            local subscription_id = nil
            local subscription_values = redis.call('mget', unpack(subscription_keys))

            for i, subscription_value in ipairs(subscription_values) do
              subscription_id = all_subscription_ids[i]
              if subscription_value == false or subscription_value == '' then
                inactive_subscription_keys[#inactive_subscription_keys + 1] = subscription_keys[i]
                inactive_subscription_ids[#inactive_subscription_ids + 1] = subscription_id
              else
                active_subscription_ids[#active_subscription_ids + 1] = subscription_id
              end
            end

            if #inactive_subscription_keys ~= 0 then
              redis.call('del', unpack(inactive_subscription_keys))
              redis.call('srem', topic_key, unpack(inactive_subscription_ids))
            end

            if #active_subscription_ids == 0 then
              redis.call('del', topic_key)
            end

            return active_subscription_ids
          LUA

          register :subscription_ids_for_fingerprint_keys, <<-LUA
            -- This will hold arrays of results, mapping to the keys in sequence
            local results = {}
            local all_subscription_ids = nil
            for _i, fingerprint_subscriptions_key in ipairs(KEYS) do
              all_subscription_ids = redis.call('smembers', fingerprint_subscriptions_key)
              results[#results + 1] = all_subscription_ids
            end
            return results
          LUA

          register :clean_inactive_subs, <<-LUA
            -- return an array for each set of fingerprint subscription IDs
            local results = {}
            local fingerprint_subscriptions_keys_size = tonumber(ARGV[1])
            local fingerprint_subscriptions_keys = {unpack(KEYS, 1, fingerprint_subscriptions_keys_size)}
            local all_subscription_keys = {unpack(KEYS, 1 + fingerprint_subscriptions_keys_size)}
            local subscription_keys_lengths = {unpack(ARGV, 2)}
            local keys_offset = 0
            local keys_length = nil
            local subscriptions = nil
            local subscription_keys = nil
            local subscription_key = nil
            -- a `1` indicates that the corresponding ID is active
            local active_subscription_indicators = nil

            for i, fingerprint_subscriptions_key in ipairs(fingerprint_subscriptions_keys) do
              keys_length = tonumber(subscription_keys_lengths[i])
              active_subscription_indicators = {}
              if keys_length > 0 then
                subscription_keys = {unpack(all_subscription_keys, keys_offset + 1, keys_offset + keys_length)}
                subscriptions = redis.call('mget', unpack(subscription_keys))
                for j, subscription_value in ipairs(subscriptions) do
                  subscription_key = subscription_keys[j]
                  if subscription_value == false or subscription_value == '' then
                    -- this is garbage
                    redis.call('del', subscription_key)
                    redis.call('srem', fingerprint_subscriptions_key, subscription_key)
                    active_subscription_indicators[#active_subscription_indicators + 1] = 0
                  else
                    active_subscription_indicators[#active_subscription_indicators + 1] = 1
                  end
                end
              end

              results[#results + 1] = active_subscription_indicators
              keys_offset = keys_offset + keys_length
            end

            return results
          LUA

          register :delete_subscription, <<-LUA
            local all_topics_key = KEYS[1]
            local subscription_key = KEYS[2]
            local subscription_id = ARGV[1]
            local topics_size = tonumber(ARGV[2])
            local topic_key = nil
            local topic_subscribers_remaining = nil
            local fingerprint_subscribers_remaining = nil
            local remaining = nil
            local fingerprint_subscriptions_key = nil
            local topic_fingerprints_key = nil
            local fingerprint = nil
            local topic = nil

            for topic_idx = 1, topics_size, 1 do
              topic_key = KEYS[1 + (topic_idx * 2)]
              redis.call('srem', topic_key, subscription_id)
              topic_subscribers_remaining = redis.call('scard', topic_key)
              if topic_subscribers_remaining == 0 then
                redis.call('del', topic_key)
              end

              fingerprint_subscriptions_key = KEYS[2 + (topics_size * 2) + topic_idx]
              topic_fingerprints_key = KEYS[1 + (topic_idx * 2) + 1]
              fingerprint_subscribers_remaining = nil
              if fingerprint_subscriptions_key then
                redis.call('srem', fingerprint_subscriptions_key, subscription_id)
                remaining = redis.call('scard', fingerprint_subscriptions_key)
                if remaining == 0 then
                  redis.call('del', fingerprint_subscriptions_key)
                  fingerprint = ARGV[3 + topics_size + topic_idx]
                  redis.call('srem', topic_fingerprints_key, fingerprint)
                  fingerprint_subscribers_remaining = redis.call('scard', topic_fingerprints_key)
                  if fingerprint_subscribers_remaining == 0 then
                    redis.call('del', topic_fingerprints_key)
                  end
                end
              end

              if fingerprint_subscribers_remaining == nil then
                fingerprint_subscribers_remaining = redis.call('scard', topic_fingerprints_key)
              end

              if (topic_subscribers_remaining == 0 and fingerprint_subscribers_remaining == 0) then
                topic = ARGV[3 + topic_idx]
                redis.call('srem', all_topics_key, topic)
              end
            end
            redis.call('del', subscription_key)
          LUA
        end

        def initialize(redis: nil, connection_pool: nil, subscriptions:, stale_ttl:)
          @script_client = ScriptClient.new(redis, connection_pool: connection_pool)
          @stale_ttl = stale_ttl
          # This reference is used for loading & dumping context
          @subscriptions = subscriptions
        end

        # Record a few things:
        # - Query data for this subscription
        # - Add this subscription to each topic's list of subscriptions
        # - Add these topics to the global list of topics
        def write_subscription(query, events)
          sub_id = query.context[:subscription_id] || raise("Failed to get subscription id")
          query_string = query.query_string ? query.query_string : query.document.to_query_string
          query_hash = {
            query_string: query_string,
            variables: query.provided_variables.to_json,
            context_string: @subscriptions.dump_context(query.context),
            operation_name: query.operation_name,
            topics: events.map(&:topic),
            created_at: Time.now.to_i,
          }
          if @subscriptions.new_subscriptions
            fingerprints = events.map(&:fingerprint)
            query_hash[:fingerprints] = fingerprints
          end
          query_data = JSON.dump(query_hash)
          sub_key = subscription_key(sub_id)

          if @subscriptions.new_subscriptions
            with_redis do |redis|
              redis.multi do |m|
                # Setting a TTL here means that the whole system has to be ready
                # to receive `nil` from this key.
                # (This _should_ be handled well already --
                # see `#delete_subscription`, `#each_subscription_id`)
                m.set(sub_key, query_data, ex: @stale_ttl)
                m.sadd(all_topics_key, events.map(&:topic))
                events.each do |event|
                  t = event.topic
                  f = event.fingerprint
                  m.sadd(fingerprints_key(t), [f])
                  m.sadd(fingerprint_subscriptions_key(f), [sub_id])
                end
              end
            end
          else
            with_redis do |redis|
              redis.multi do |m|
                m.set(sub_key, query_data, ex: @stale_ttl)
                events.each do |event|
                  m.sadd(all_topics_key, [event.topic])
                  t_key = topic_key(event.topic)
                  m.sadd(t_key, [sub_id])
                end
              end
            end
          end

          nil
        end

        # This subscription received an update, reset the TTL
        # (No-op when no TTL is configured)
        # @param subscription_id [String, Array<String>]
        # @return void
        def reset_ttl(subscription_id)
          if @stale_ttl
            if subscription_id.is_a?(Array)
              keys = subscription_id.map { |sid| subscription_key(sid) }
              with_redis do |redis|
                redis.multi do |m|
                  keys.each { |k| m.expire(k, @stale_ttl) }
                end
              end
            else
              key = subscription_key(subscription_id)
              with_redis { |redis| redis.expire(key, @stale_ttl) }
            end
          end
          nil
        end

        # Fetch the query data for this subscription
        def read_subscription(sub_id)
          read_subscriptions([sub_id]).first
        end

        def read_subscriptions(sub_ids)
          sub_keys = sub_ids.map { |sid| subscription_key(sid) }
          query_data_strs = with_redis { |r| r.mget(sub_keys) }
          query_data_strs.each_with_index.map do |query_data_str, idx|
            # It's possible that the subscription was cleaned up _between_
            # the call to `each_subscription_id` and this call.
            # Or, it could have expired due to TTL.
            # In that case, return nil, and handle this upstream to skip this subscription.
            if query_data_str.nil? || query_data_str.size == 0
              nil
            else
              begin
                sub_id = sub_ids[idx]
                query_data = JSON.parse(query_data_str)
                context_str = query_data.fetch("context_string")
                context = @subscriptions.load_context(context_str)
                variables_h = JSON.parse(query_data.fetch("variables"))
                {
                  query_string: query_data.fetch("query_string"),
                  variables: variables_h,
                  context: context,
                  operation_name: query_data.fetch("operation_name"),
                  created_at: query_data["created_at"] && query_data["created_at"].to_i, # This is missing for old subscriptions
                  topics: query_data["topics"],
                  fingerprints: query_data["fingerprints"] || [],
                }
              rescue StandardError => err
                @subscriptions.read_subscription_failed_error(sub_id, query_data, err)
                nil
              end
            end
          end
        end

        def each_subscription_id_legacy(topic)
          t_key = topic_key(topic)
          all_subscription_ids = with_redis { |redis| redis.smembers(t_key) }
          if all_subscription_ids.any?
            all_subscription_keys = all_subscription_ids.map { |sid| subscription_key(sid) }
            keys = [t_key, *all_subscription_keys]
            values = all_subscription_ids
            active_subscription_ids = @script_client.exec_script(:filter_active_subscriptions, keys, values)
            active_subscription_ids.each { |sid| yield(sid) }
          end
          nil
        end

        def each_fingerprint_and_subscription_ids(topic)
          fingerprints_key = fingerprints_key(topic)
          # This was broken down from a big Lua script because
          # we have to convert values in to keys, and Redis (and libraries like redis-namespace)
          # really require keys to come in via the `keys` array.
          fingerprints = with_redis { |r| r.smembers(fingerprints_key) }
          fingerprint_subscription_keys = fingerprints.map { |f| fingerprint_subscriptions_key(f) }
          all_subscription_ids_for_fingerprint_keys = @script_client.exec_script(:subscription_ids_for_fingerprint_keys, fingerprint_subscription_keys, [])
          # Convert the result, which contains IDs, into Redis keys
          all_subscription_keys_for_fingerprint_keys = all_subscription_ids_for_fingerprint_keys.map do |subscription_ids|
            subscription_ids.map { |sid| subscription_key(sid) }
          end

          keys = [
            *fingerprint_subscription_keys,
            *all_subscription_keys_for_fingerprint_keys.flatten,
          ]
          args = [
            fingerprint_subscription_keys.size,
            *all_subscription_keys_for_fingerprint_keys.map { |s_keys| s_keys.size },
          ]

          filtered_subscription_keys = @script_client.exec_script(:clean_inactive_subs, keys, args)

          cleanup_fingerprints = []
          fingerprints.each_with_index do |fingerprint, idx|
            active_subscription_ids = []
            all_subscription_ids = all_subscription_ids_for_fingerprint_keys[idx]
            # Inspect the result. If a `1` is present, then the corresponding ID is active.
            filtered_subscription_keys[idx].each_with_index do |presence_indicator, sub_idx|
              if presence_indicator == 1
                active_subscription_ids << all_subscription_ids[sub_idx]
              end
            end

            if active_subscription_ids.empty?
              cleanup_fingerprints << fingerprint
            else
              yield(fingerprint, active_subscription_ids)
            end
          end

          if cleanup_fingerprints.any?
            cleanup_fingerprint_keys = cleanup_fingerprints.map { |f| fingerprint_subscriptions_key(f) }
            with_redis do |r|
              r.multi do |m|
                m.srem(fingerprints_key, cleanup_fingerprints)
                m.del(cleanup_fingerprint_keys)
              end
            end
          end
          nil
        end

        # Find each subscription for the triggered topic
        def each_subscription_id(topic)
          any_subscriptions = false

          each_subscription_id_legacy(topic) do |sub_id|
            any_subscriptions = true
            yield(sub_id)
          end

          each_fingerprint_and_subscription_ids(topic) do |f, f_sub_ids|
            f_sub_ids.each do |f_sub_id|
              any_subscriptions = true
              yield(f_sub_id)
            end
          end

          # Any subscriptions that used to exist for this topic
          # have been TTL'ed, deleted, GC'ed, etc --
          # remove this topic from the list of all topics.
          if !any_subscriptions
            remove_topic(topic)
          end
          nil
        end

        def remove_topic(topic)
          with_redis { |r| r.srem(all_topics_key, [topic]) }
        end

        # Delete this subscription by:
        # - removing it from each of its topics lists of subscriptions
        # - if it was the last subscriber to a topic, removing the topic from the list of topics
        # - removing its query data
        # @param query_data [Hash] The result of `read_subscription`, if it's already available.
        def delete_subscription(sub_id, subscription: nil)
          sub_key = subscription_key(sub_id)
          if subscription
            topics = subscription[:topics]
            fingerprints = subscription[:fingerprints]
          else
            query_data_str = with_redis { |r| r.get(sub_key) }
            if query_data_str.nil? || query_data_str == ""
              return
            else
              query_data = JSON.parse(query_data_str)
              topics = query_data["topics"]
              # This can be `nil` for legacy subscription data:
              fingerprints = query_data["fingerprints"] || []
            end
          end

          # _Part_ of this could be implemented with `multi` --
          # but not the part that checks list size and cleans up where needed.
          # If this operation in particular proved to be to CPU-intensive on Redis,
          # it could be split into two parts:
          # - A `multi` operation to run deletes and srems;
          # - A script for checking list sizes and cleaning up where necessary.
          # But that would have the downside of making two round trips.
          keys = [all_topics_key, sub_key]
          topics.each { |t|
            keys << topic_key(t)
            keys << fingerprints_key(t)
          }
          fingerprints.each { |f|
            keys << fingerprint_subscriptions_key(f)
          }
          argv = [sub_id, topics.size, fingerprints.size, *topics, *fingerprints]
          @script_client.exec_script(:delete_subscription, keys, argv)
        end

        # Clear all subscription state
        def clear(cursor: nil)
          while cursor != "0"
            cursor ||= "0" # This is the initial value
            cursor, keys = with_redis { |r| r.scan(cursor, match: "#{PREFIX}*", count: 100) }
            if keys.any?
              with_redis { |r| r.del(*keys) }
            end
          end
        end

        # For the UI:
        def topics(limit:, offset:)
          all_topic_names = with_redis { |r| r.smembers(all_topics_key) }
          topic_names = if limit.nil? && offset.nil?
            all_topic_names
          else
            all_topic_names[offset, limit] || []
          end

          topics = topic_names.map do |t|
            legacy_topic_sub_count = with_redis { |r| r.scard(topic_key(t)) }
            new_topic_sub_count = with_redis { |r| r.scard(fingerprints_key(t)) }
            topic_sub_count = legacy_topic_sub_count + new_topic_sub_count
            OpenStruct.new(
              name: t,
              subscriptions_count: topic_sub_count,
            )
          end
          return topics, all_topic_names.size
        end

        private

        # This key holds query data for `sub_id`
        def subscription_key(sub_id)
          "#{PREFIX}query:#{sub_id}"
        end

        # This key holds subscription ids for `topic`
        def topic_key(topic)
          "#{PREFIX}topics:#{topic}"
        end

        def all_topics_key
          "#{PREFIX}alltopics"
        end

        def fingerprints_key(topic)
          "#{PREFIX}fingerprints:#{topic}"
        end

        def fingerprint_subscriptions_key(fingerprint)
          "#{PREFIX}fingerprintsubscriptions:#{fingerprint}"
        end

        def with_redis(&block)
          @script_client.with_redis(&block)
        end
      end
    end
  end
end
