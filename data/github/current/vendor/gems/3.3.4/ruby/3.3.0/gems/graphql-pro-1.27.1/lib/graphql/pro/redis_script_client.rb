# frozen_string_literal: true

module GraphQL
  module Pro
    class RedisScriptClient
      class << self
        def register(name, operation)
          operations[name] = {
            source: operation,
            sha: Digest::SHA1.hexdigest(operation),
          }
        end

        def operations
          @operations ||= {}
        end
      end

      def initialize(redis, connection_pool: nil)
        @redis_client = if connection_pool
          ConnectionPoolRedis.new(connection_pool)
        elsif !redis.respond_to?(:get)
          RedisClientRedis.new(redis)
        else
          RedisRbRedis.new(redis)
        end
      end

      def exec_script(name, keys, argv)
        operation = self.class.operations[name] || raise(ArgumentError, "No script found for #{name.inspect} (registered: #{self.class.operations.keys.inspect})")
        script_sha = operation.fetch(:sha)
        with_redis { |r| r.evalsha(script_sha, keys, argv) }
      rescue StandardError => err
        if err.message.include?("NOSCRIPT")
          script = self.class.operations[name][:source]
          script_sha_from_redis = with_admin_redis { |ar| ar.script("load", script) }
          if script_sha_from_redis != script_sha
            raise "Invariant: Calculated SHA doesn't match Redis SHA (#{script_sha.inspect}, #{script_sha_from_redis.inspect})"
          end
          with_redis { |r| r.evalsha(script_sha, keys, argv) }
        else
          raise err
        end
      end

      class ConnectionPoolRedis
        def initialize(conn_pool)
          @connection_pool = conn_pool
        end

        def with_redis(&block)
          @connection_pool.with(&block)
        end

        def with_admin_redis
          @connection_pool.with do |redis|
            if redis.respond_to?(:redis)
              yield(redis.redis)
            else
              yield(redis)
            end
          end
        end
      end

      class RedisRbRedis
        def initialize(redis)
          @redis = redis
          @admin_redis = redis.respond_to?(:redis) ? redis.redis : redis
        end

        def with_redis
          yield(@redis)
        end

        def with_admin_redis
          yield(@admin_redis)
        end
      end

      class RedisClientRedis
        class RedisClientWrapper
          def initialize(redis_client)
            @redis_client = redis_client
          end

          [
            :get, :set, :del, :mget,
            :incrby, :incr, :decrby, :decr,
            :sadd, :smembers, :srem, :scard, :sismember,
            :keys, :exists, :ttl, :expire, :expireat, :pttl, :pexpire, :pexpireat,
            :script, :flushdb,
            :hmget, :hmset, :hgetall, :hset, :hget, :hdel, :hsetnx,
            :zadd, :zrem, :zcard, :zrange,
          ].each do |redis_method|
            module_eval <<-RUBY, __FILE__, __LINE__
              def #{redis_method}(*args, **kwargs)
                @redis_client.call("#{redis_method.to_s.upcase.sub("?", "")}", *args, **kwargs)
              end
            RUBY
          end

          def multi
            @redis_client.multi do |m|
              wrapped_m = RedisClientWrapper.new(m)
              yield(wrapped_m)
            end
          end

          def with
            yield(self)
          end

          def evalsha(sha, keys, args)
            @redis_client.call("EVALSHA", sha, keys.size, *keys, *args)
          end

          def pipelined
            @redis_client.multi do |pipeline|
              wrapped_pipeline = RedisClientWrapper.new(pipeline)
              yield(wrapped_pipeline)
            end
          end
        end

        def initialize(redis)
          @redis = RedisClientWrapper.new(redis)
        end

        def with_redis(&block)
          @redis.with(&block)
        end

        def with_admin_redis(&block)
          @redis.with(&block)
        end
      end

      def with_redis(&block)
        @redis_client.with_redis(&block)
      end

      def with_admin_redis(&block)
        @redis_client.with_admin_redis(&block)
      end
    end
  end
end
