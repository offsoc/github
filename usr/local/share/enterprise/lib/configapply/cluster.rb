# frozen_string_literal: true
module Enterprise
  module ConfigApply
    # Cluster contains methods concerning multi-node clustering (also used by HA)
    module Cluster
      def cluster_failover_file
        ENV.fetch("GHE_CLUSTER_FAILOVER_FILE", "/data/user/common/cluster-failover-occurred")
      end

      def cluster_node_name
        return "localhost" if single_node?

        @cluster_node_name ||= File.read("/etc/github/cluster").chomp
      end

      def cluster_datacenter(node_name = cluster_node_name)
        return "default" if single_node?

        dc = cluster_value(node_name, "datacenter")
        return dc if dc && dc != ""

        "default"
      end

      # Returns true if the given node is in the same datacenter as the local host
      def cluster_local_node?(node_name)
        return true unless cluster_enabled?

        cluster_datacenter(node_name) == cluster_datacenter
      end

      # Returns hostnames of the nodes in the given datacenter,
      # optionally with the given role like "web" (translates to "web-server")
      def cluster_nodes_in_datacenter(datacenter, role = nil)
        return ["localhost"] if single_node?

        cluster_nodes_online.select do |node|
          node_dc = node["datacenter"]
          node_dc = "default" if node_dc.to_s.empty?

          node_dc == datacenter && (!role || node["#{role}-server"] == true)
        end.map { |n| n["hostname"] }
      end

      # Returns array of all the node property hashes from cluster.conf started with datacenter primary key
      #
      # Each array element is a hash, and an artificial key "_node_key" will
      # contain the hash key from the config, e.g. `cluster.NODEKEY.web-server = true`.
      #
      def external_mysql_nodes
        cluster_config["cluster-external-mysql"] ? cluster_config["cluster-external-mysql"]
          .select  { |_node, props| props.is_a?(Hash) }
          .map     { |node, props| props.update("_node_key" => node) }
          .sort_by { |props| props["_node_key"] }
          : []
      end

      def nodes(type)
        cluster_config["cluster"]
          .select  { |_node, props| props.is_a?(Hash) }
          .map     { |node, props| props.update("_node_key" => node) }
          .reject  { |props| (props[type] != true) }
          .reject  { |props| (props["offline"] == true) }
          .sort_by { |props| props["_node_key"] }
      end

      # The following "count" methods
      # are used in the "update" stanzas of
      # various services. See nomad templates

      def web_plus_active_replica_count
        return 1 if single_node? || cluster_ha_enabled?

        return (cluster_nodes_in_datacenter(cluster_datacenter, "web") + cluster_nodes_in_datacenter(cluster_datacenter, "active-replica")).uniq.length
      end

      def git_server_count
        return 1 if single_node? || cluster_ha_enabled?

        return cluster_nodes_in_datacenter(cluster_datacenter, "git").count
      end

      def job_plus_git_server_count
        return 1 if single_node? || cluster_ha_enabled?

        return (cluster_nodes_in_datacenter(cluster_datacenter, "git") + cluster_nodes_in_datacenter(cluster_datacenter, "job")).uniq.length
      end

      # timerd runs on web-server,job-server,git-server,pages-server
      def timerd_node_count
        return 1 if single_node? || cluster_ha_enabled?

        return (cluster_nodes_in_datacenter(cluster_datacenter, "web") + cluster_nodes_in_datacenter(cluster_datacenter, "git") + cluster_nodes_in_datacenter(cluster_datacenter, "job") + cluster_nodes_in_datacenter(cluster_datacenter, "pages")).uniq.length
      end

      def web_server_count
        return 1 if single_node? || cluster_ha_enabled?

        return cluster_nodes_in_datacenter(cluster_datacenter, "web").count
      end

      def job_server_count
        return 1 if single_node? || cluster_ha_enabled?

        return cluster_nodes_in_datacenter(cluster_datacenter, "job").count
      end

      # alambic runs on web-server,job-server,storage-server,active-replica-server
      def alambic_node_count
        return 1 if single_node? || cluster_ha_enabled?

        return (cluster_nodes_in_datacenter(cluster_datacenter, "web") + cluster_nodes_in_datacenter(cluster_datacenter, "job") + cluster_nodes_in_datacenter(cluster_datacenter, "storage") + cluster_nodes_in_datacenter(cluster_datacenter, "active-replica")).uniq.length
      end

      def cluster_nodes_in_datacenter_count
        return 1 if single_node? || cluster_ha_enabled?

        return cluster_nodes_in_datacenter(cluster_datacenter).count
      end

      # Returns mysql read replicas endpoint in the given datacenter,
      def external_mysql_replicas_in_datacenter(datacenter)
        external_mysql_nodes.select do |node|
          node_dc = node["datacenter"]
          node_dc = "default" if node_dc.to_s.empty?

          node_dc == datacenter
        end.map { |n| n["address"] }
      end

      # Returns mysql read replicas endpoint in the given datacenter,
      def external_mysql_replica_ports_in_datacenter(datacenter)
        external_mysql_nodes.select do |node|
          node_dc = node["datacenter"]
          node_dc = "default" if node_dc.to_s.empty?

          node_dc == datacenter
        end.map { |n| n["port"] }
      end

      # Returns an array of "roles" (e.g. "web-server") for the local node from `services_map.json`
      def cluster_roles(all_roles = false)
        roles = SERVICES_MAP.values.flatten.uniq
        roles += NOMAD_ROLES

        return roles.reject { |role| role.start_with?("!") }.uniq.sort - %w[active-replica-server cache-server bare-server] if single_node? || all_roles

        @roles ||= roles.select do |role|
          cluster_value(cluster_node_name, role)
        end
      end

      # Returns array of all the node property hashes from cluster.conf,
      # or an empty array for non-clustered (single node) mode.
      #
      # Excludes top-level cluster values like `cluster.ha = true`.
      # Each array element is a hash, and an artificial key "_node_key" will
      # contain the hash key from the config, e.g. `cluster.NODEKEY.web-server = true`.
      #
      # Results are optionally limited to nodes with a certain flag set `true` (like `web-server`),
      # or nodes that aren't marked offline or in the case of a replica, disabled.
      # By default includes all nodes in the config, sorted by config key.
      def cluster_nodes(flag = nil, skip_offline = false, skip_disabled = false)
        return [] if single_node?

        cluster_config["cluster"]
          .select  { |_node, props| props.is_a?(Hash) }
          .map     { |node, props| props.update("_node_key" => node) }
          .reject  { |props| (flag && props[flag] != true) ||
            (skip_offline && props["offline"] == true) ||
            (skip_disabled && props["replica"] == "disabled")
          }
          .sort_by { |props| props["_node_key"] }
      end

      # Convenience wrappers for cluster_nodes
      def cluster_nodes_online(flag = nil)
        cluster_nodes(flag, true)
      end

      # Returns whether the current node is in the primary cluster of a DR setup
      def cluster_dr_primary?
        return false unless cluster_dr_enabled?

        cluster_local_node?(mysql_master)
      end

      # cluster_index provides the numerical index of the given node
      # in the cluster config, based at 0.  For non-cluster, always returns 0.
      # Suggested for use where configs should be written uniquely across the cluster.
      def cluster_index(node_name = cluster_node_name)
        return 0 if single_node?

        cluster_nodes.index { |n| n["_node_key"] == node_name }
      end

      def node_ip(node_name = cluster_node_name)
        return "127.0.0.1" if node_name == "localhost"

        vpn_node_ip(node_name) || external_node_ip(node_name)
      end

      def vpn_node_ip(node_name = cluster_node_name)
        return nil unless wireguard_enabled?

        cluster_value(node_name, "vpn") unless cluster_value(node_name, "vpn").to_s.empty?
      end

      def external_node_ip(node_name = cluster_node_name)
        return nil unless cluster_enabled?
        return nil unless cluster_config["cluster"][node_name]

        if cluster_value(node_name, "ipv4") && !cluster_value(node_name, "ipv4").to_s.empty?
          cluster_value(node_name, "ipv4")
        elsif cluster_value(node_name, "ipv6") && !cluster_value(node_name, "ipv6").to_s.empty?
          cluster_value(node_name, "ipv6")
        end
      end

      # Returns the presumed IP "network" address for WireGuard
      # e.g. 169.254.179.0.
      def cluster_vpn_subnet
        (vpn_node_ip || "169.254.179.1").gsub(/\.([^\.]+)$/, ".0")
      end

      def cluster_interface
        if wireguard_enabled?
          "tun0"
        else
          "eth0"
        end
      end

      def wireguard_enabled?
        # cluster.wireguard is for backwards compat, wireguard.enabled should be used instead
        return false unless cluster_enabled?
        return true if cluster_ha_enabled? && (cluster_value("wireguard") != false || cluster_value("wireguard") == true)
        return true if cluster_ha_enabled? && raw_config.dig("wireguard", "enabled") != false
        !!raw_config.dig("wireguard", "enabled") || cluster_value_true?("wireguard")
      end

      # Returns the MTU to use for the WireGuard interface.
      #
      # This should always be somewhere in the range of 1280 to 1420, and should
      # be 80 (overhead) lower than the eth0 interface MTU in most cases to
      # account for the overhead of WireGuard with IPv4 or IPv6.
      #
      # 1. Returns wireguard.mtu from github.conf.
      # 2. Returns vpn.mtu from github.conf for legacy support.
      # 3. Returns interface MTU - overhead for systems where eth0 MTU is
      # 1280 + overhead to 1500.
      # 4. Returns 1280 where eth0 MTU is any lower than 1280 + overhead,
      # in these cases fragmentation will need to take care of this, as 1280 is
      # the lowest you can go with IPv6.
      # 5. Returns 1500 - overhead for systems where eth0 has a MTU higher than
      # 1500.
      def wireguard_mtu
        overhead = 80
        if raw_config["wireguard"] && raw_config["wireguard"]["mtu"]
          raw_config["wireguard"]["mtu"].to_i
        elsif raw_config["vpn"] && raw_config["vpn"]["mtu"]
          raw_config["vpn"]["mtu"].to_i
        elsif interface_mtu >= 1280 + overhead && interface_mtu <= 1500
          interface_mtu - overhead
        elsif interface_mtu < 1280 + overhead
          1280
        else
          1500 - overhead
        end
      end

      def wireguard_peers
        cluster_nodes.map do |node|
          next if node["hostname"] == cluster_node_name
          next unless node["vpn"] && node["wireguard-pubkey"]

          if cluster_ha_replica? && wireguard_hub_and_spoke?
            next unless cluster_ha_primary?(node["hostname"])

            {
              external_ip: external_node_ip(node["hostname"]),
              vpn_ip: "#{cluster_vpn_subnet}/24",
              public_key: node["wireguard-pubkey"],
              preshared_key: secret_value("wireguard", "psk")
            }
          else
            {
              external_ip: external_node_ip(node["hostname"]),
              vpn_ip: "#{node['vpn']}/32",
              public_key: node["wireguard-pubkey"],
              preshared_key: secret_value("wireguard", "psk")
            }
          end
        end.compact
      end

      def wireguard_hub_and_spoke?
        return false unless raw_config["wireguard"] && raw_config["wireguard"]["hub-and-spoke"]

        raw_config["wireguard"]["hub-and-spoke"] == true
      end

      def wireguard_private_key
        File.read("/data/user/common/wireguard.key").strip
      end
    end
  end
end
