# frozen_string_literal: true
module Enterprise
  module ConfigApply
    # ModeHelpers holds small, mostly boolean convenience methods
    # to clearly identify which of the various GHE operating modes are in use:
    # Single node, HA (primary/replica/cache), cluster, and (WiP) "DR cluster"
    module ModeHelpers
      # True if clustering (incl. HA) is enabled on the local node,
      # as indicated by the flag file /etc/github/cluster (contains local hostname)
      def cluster_enabled?
        return @cluster_enabled if defined?(@cluster_enabled)

        @cluster_enabled = (File.exist?("/etc/github/cluster") && !cluster_config.empty?)
      end

      # Alternative for `unless cluster_enabled?` to express logic more intentionally
      # True if the local node is not cluster, HA, DR cluster, etc., i.e. just one GHE instance
      def single_node?
        !cluster_enabled?
      end

      # True if the top-level config flag for HA (cluster.ha) is `true` and this node is in a cluster
      def cluster_ha_enabled?
        cluster_enabled? && cluster_value("ha") == true
      end

      # True if the given node (or local, if unspecified) is in a cluster and configured as a replica,
      # as indicated by the "replica" cluster.conf key being present (not sensitive to the value!)
      # Covers HA replicas and non-HA cluster replicas.
      # Also overloaded to accept a "node" hash like those returned by `cluster_nodes`.
      def cluster_replica?(node_name = cluster_node_name)
        return !node_name["replica"].nil? if node_name.is_a?(Hash)

        cluster_enabled? && !cluster_value(node_name, "replica").nil?
      end

      # True if HA is in use, and the given node (or local) is the primary node
      def cluster_ha_primary?(node_name = cluster_node_name)
        cluster_ha_enabled? && !cluster_replica?(node_name)
      end

      # True if HA is in use, and the given node (or local) is the replica node
      def cluster_ha_replica?(node_name = cluster_node_name)
        cluster_ha_enabled? && cluster_replica?(node_name)
      end

      # True if the HA node is an `enabled` replica, in "active replica" mode.
      # Note that "active" is a special variation on GHE replica behavior,
      # and isn't related to the replica node being enabled/disabled in the config.
      def cluster_ha_replica_active?(node_name = cluster_node_name)
        cluster_ha_replica_enabled?(node_name) &&
          cluster_value_true?(node_name, "active-replica-server")
      end

      # True if the HA node is an `enabled` replica, in "cache" mode.
      # Note that "cache" is a special variation on GHE replica behavior,
      # and isn't related to the replica node being enabled/disabled in the config.
      def cluster_ha_replica_cache?(node_name = cluster_node_name)
        cluster_ha_replica_enabled?(node_name) &&
          cluster_value_true?(node_name, "cache-server")
      end

      def cluster_cache_location(node_name = cluster_node_name)
        cluster_ha_replica_cache?(node_name) ? cluster_value(node_name, "cache-location") : nil
      end

      # True if the HA node is set as a replica, with its `replica` setting specifically `enabled`.
      # Note: if the `replica` key is absent (nil), the node isn't a replica.
      def cluster_ha_replica_enabled?(node_name = cluster_node_name)
        cluster_ha_replica?(node_name) &&
          cluster_value(node_name, "replica") == "enabled"
      end

      # True if the HA node is set as a replica, with its `replica` setting specifically `disabled`
      def cluster_ha_replica_disabled?(node_name = cluster_node_name)
        cluster_ha_replica?(node_name) &&
          cluster_value(node_name, "replica") == "disabled"
      end

      # True if the local node has regular (non-HA) clustering
      def cluster_regular_enabled?
        cluster_enabled? && !cluster_ha_enabled?
      end

      # True if non-HA(DR) cluster and the given node (or local) is the replica node
      def cluster_dr_replica?(node_name = cluster_node_name)
        cluster_dr_enabled? && cluster_replica?(node_name)
      end

      # True if the local node has regular (non-HA) clustering
      # with a secondary failover cluster
      def cluster_dr_enabled?
        cluster_enabled? && !cluster_config["cluster"]["mysql-master-replica"].nil?
      end

      # True if the local node has multiple DCs:
      #    - HA clustering
      #    - Regular (non-HA) clustering with a failover cluster
      def cluster_multi_dc?
        cluster_ha_enabled? || cluster_dr_enabled?
      end
    end
  end
end
