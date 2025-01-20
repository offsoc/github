# frozen_string_literal: true
require_relative "mode_helpers"

module Enterprise
  module ConfigApply
    module HighAvailability
      # Redis contains methods concerning the Redis daemon, particularly for cluster and HA
      module Redis
        include Enterprise::ConfigApply::ModeHelpers
        # Redis master/primary selection
        #
        # Depending on the architecture, the Redis master server will be:
        # * The primary node in a two node HA setup
        # * The primary node in a Geo-replication setup
        # * One of the Redis servers in a Cluster setup
        # * One of the Redis servers in the primary datactener or one of the Redis servers in the
        #   secondary datacenter if we are in Cluster DR
        def redis_master
          return "localhost" if single_node?
          cluster_value("redis-master")
        end

        def redis_master_replica
          return "localhost" if single_node?
          cluster_value("redis-master-replica")
        end

        # True if the given node (defaults to localhost) is the `redis_master`
        def redis_master?(node_name = cluster_node_name)
          redis_master == node_name
        end

        def redis_master_replica?(node_name = cluster_node_name)
          redis_master_replica == node_name
        end

        def update_redis_primary
          # Check if local node runs Redis and is the master
          return unless enabled_service?("redis") && redis_master?

          # If we are the master, make sure we aren't configured as a replica.
          # This can happen in the case of failover. If we are already the master
          # this is a no-op.
          ok, _ = system_log("sudo -u admin /usr/local/share/enterprise/ghe-redis-repl-stop")
          if !ok
            log_status "Disabling replication on master failed"
            exit(1)
          end
        end

        def update_redis_replication
          # Not needed in clustering mode or we're not running Redis, or we're the master
          return if single_node? || !enabled_service?("redis") || redis_master?

          redis_upstream_replica =
            if !cluster_regular_enabled? || !cluster_replica? || redis_master_replica?
              redis_master
            else
              redis_master_replica
            end

          log("[cluster-dr] enabling redis replication, master #{redis_master}")
          ok, _ = system_log("sudo -u admin /usr/local/share/enterprise/ghe-redis-repl-start #{redis_upstream_replica}")
          if !ok
            log_status "Setting up replication failed"
            exit(1)
          end
        end
      end
    end
  end
end
