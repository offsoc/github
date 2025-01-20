# frozen_string_literal: true
module Enterprise
  module ConfigApply
    module Redis
      def redis_max_memory_gb
        raw_config.dig("redis", "max-memory-gb") || 6
      end

      def wait_for_redis_available
        begin
          timeout = redis_wait_timeout
          redis_wait_attempts = 0
          loop_with_timeout(timeout) do
            log "Waiting for Redis to be available via haproxy-data-proxy, attempt count: #{redis_wait_attempts += 1}"
            # Get current Redis server from HAProxy
            redis_state = check_server_health("/var/run/haproxy/haproxy-data-proxy.sock", "redis")
            unless redis_state == nil
              log("haproxy-data-proxy's currently running redis server is at #{redis_state[:fqdn]} - expected redis server is at #{redis_master}")
              log("redis server is healthy") if redis_state[:healthy]
              # Ensure that the current Redis server matches the redis_master config
              # HAProxy's op_code 2 is "running"
              if redis_state[:op_code] == 2 && redis_state[:fqdn] == redis_master
                ok, _ = system_log("ghe-redis-cli PING 2>&1 | grep -qi pong &> /dev/null")
                break if ok
              end

              # Signal for a reload of haproxy-data-proxy every 10 retries
              instrument_system("/usr/local/share/enterprise/ghe-nomad-signal -l haproxy-data-proxy SIGHUP", "Signalling reload for HAProxy-data-proxy") if redis_wait_attempts%10 == 0
            end
            sleep(1)
          end
        rescue PhaseHelpers::LoopTimeoutError
          log "Timed out waiting #{timeout}s for Redis to be reachable via haproxy-data-proxy"
          exit(1)
        end
      end
    end
  end
end
