# frozen_string_literal: true
require_relative "cluster"
require_relative "mode_helpers"
require_relative "config_files"

require_relative "ha_mysql.rb"
require_relative "ha_redis.rb"
require_relative "ha_mssql.rb"

module Enterprise
  module ConfigApply
    # HA contains methods for primary/replica HA support
    module HighAvailability
      include Enterprise::ConfigApply::Cluster
      include Enterprise::ConfigApply::ModeHelpers
      include Enterprise::ConfigApply::ConfigFiles
      include Enterprise::ConfigApply::HighAvailability::MySQL
      include Enterprise::ConfigApply::HighAvailability::Redis
      include Enterprise::ConfigApply::HighAvailability::MSSQL

      def cluster_ha_enabled?
        return false unless cluster_enabled?

        cluster_config["cluster"]["ha"] == true
      end

      def cluster_ha_replica?(nodename = cluster_node_name)
        return false unless cluster_ha_enabled?

        cluster_replica?(nodename)
      end

      def cluster_ha_replica_enabled?(nodename = cluster_node_name)
        return false unless cluster_ha_replica?(nodename)

        cluster_config["cluster"][nodename]["replica"] == "enabled"
      end

      def cluster_ha_replica_active?(nodename = cluster_node_name)
        cluster_ha_replica_enabled?(nodename) && cluster_config["cluster"][nodename]["active-replica-server"] == true
      end

      def cluster_ha_replica_cache?(nodename = cluster_node_name)
        cluster_ha_replica?(nodename) && cluster_config["cluster"][nodename]["cache-server"] == true
      end

      # Return the IP of the primary
      def cluster_ha_primary_ip
        node_ip(cluster_ha_primary)
      end

      # Return the External IP of the primary
      def cluster_ha_primary_external_ip
        external_node_ip(cluster_ha_primary)
      end

      def cluster_ha_primary
        primary_node = cluster_nodes.find { |node| !cluster_replica?(node) }
        primary_node && primary_node["hostname"]
      end

      def cluster_ha_replica_cache_domain(nodename = cluster_node_name)
        return nil unless cluster_ha_replica_cache?(nodename)

        cache_domain = cluster_config["cluster"][nodename]["cache-domain"]
        return nil unless cache_domain && !cache_domain.empty?
        cache_domain
      end
    end
  end
end
