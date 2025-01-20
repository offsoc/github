# frozen_string_literal: true
module Enterprise
  module ConfigApply
    # NodeRoles provides methods that determine the name of GHE nodes
    # that provide various back-end services
    module NodeRoles
      def metrics_servers
        cluster_nodes_online("metrics-server").map { |n| n["hostname"] }
      end

      def git_servers
        cluster_nodes_online("git-server").map { |n| n["hostname"] }
      end

      # Returns the ES nodes that belong to the same ES cluster as the
      # current node.
      #
      # Note that this is not the same as being in the same DC, because
      # in HA, all nodes make up a unique cluster.
      #
      # So for each mode:
      #
      #    Single instance: itself
      #    HA clustering: primary node plus replicas if include_replicas
      #    Non-HA clustering: all nodes in the same dc as the current node
      def search_nodes(include_replicas = false)
        return ["localhost"] unless cluster_enabled?

        root_nodes = cluster_config["cluster"]["elasticsearch-nodes"]

        nodes = cluster_nodes_online("elasticsearch-server").select do |n|
          if cluster_dr_enabled?
            same_cluster_node_match(n, true)
          else
            replica_match(n, include_replicas)
          end
        end.map { |n| n["hostname"] }

        nodes += root_nodes.split if root_nodes
        nodes.uniq
      end

      # Returns a map with the key being datacenter and the values an
      # array of all the ES nodes in that datacenter.
      #
      # So for each mode:
      #
      #    non Cluster instance: { }
      #    Cluster: { "<datacenter>": { "nodes": [ "<node>"...], "url": "http://localhost:<port>"}, ... }
      def search_nodes_by_datacenter
        return {} unless cluster_regular_enabled?
        nodes_map = {}

        cluster_nodes("elasticsearch-server", false).each do |node|
          node_datacenter = cluster_datacenter(node["_node_key"])
          host = node["hostname"]
          nodes = nodes_map[node_datacenter] || []
          nodes << host
          nodes_map[node_datacenter] = nodes
        end

        nodes_by_datacenter = {}
        base_port = 19201
        nodes_map.each_with_index do |(dc, nodes), index|
          port = base_port + index
          nodes_by_datacenter[dc] = { "nodes" => nodes, "url" => "http://localhost:#{ port }", "port" => port }
        end

        nodes_by_datacenter
      end

      def webserver_nodes
        return ["localhost"] if single_node?

        cluster_nodes_online("web-server").select do |n|
          same_cluster_node_match(n, cluster_dr_enabled?)
        end.map { |n| n["hostname"] }.uniq
      end

      # Returns a map where each key is a datacenter name and each value is
      # an array of all the web-server nodes' hostnames in that datacenter.
      #
      # Note that we use consul_datacenter() to determine datacenter names
      # so they can be matched against the consul_primary_datacenter() name.
      #
      # So for each node:
      #
      #    non-cluster: { "default": [ "localhost" ] }
      #    cluster: { "<consul-datacenter>": [ "<hostname>", ... ], ... }
      def webserver_nodes_by_datacenter
        return { consul_primary_datacenter => ["localhost"] } if single_node?
        nodes_map = {}

        cluster_nodes_online("web-server").each do |node|
          node_datacenter = consul_datacenter(node["_node_key"])
          host = node["hostname"]
          nodes = nodes_map[node_datacenter] || []
          nodes << host
          nodes_map[node_datacenter] = nodes
        end

        nodes_by_datacenter = {}
        nodes_map.each_with_index do |(dc, nodes), index|
          nodes_by_datacenter[dc] = nodes
        end

        nodes_by_datacenter
      end

      # Return list of hostnames that have a given role and datacenter
      def hostnames_with_role(role, datacenter, skip_offline = true)
        cluster_nodes(role, skip_offline).select do |node|
          cluster_datacenter(node["_node_key"]) == datacenter
        end.map { |n| n["hostname"] }
      end

      def replica_match(node, include_replicas)
        return true if include_replicas

        node["replica"].nil?
      end

      def same_cluster_node_match(node, same_cluster)
        return true unless same_cluster

        cluster_local_node?(node["hostname"])
      end

      module ViewHelpers
        def memcache_nodes
          return ["localhost"] if single_node?

          nodes = cluster_nodes_in_datacenter(cluster_datacenter, "memcache")
          root_nodes = cluster_value("memcached-nodes")
          nodes += root_nodes.split if root_nodes
          nodes
        end

        def hosts_nodes
          nodes = []
          cluster_nodes.each do |node|
            if wireguard_enabled?
              nodes << [node["hostname"], node_ip(node["hostname"]), node["uuid"]]
            else
              nodes << [node["hostname"], node["ipv4"], node["uuid"]] if node["ipv4"] && !node["ipv4"].empty?
              nodes << [node["hostname"], node["ipv6"], node["uuid"]] if node["ipv6"] && !node["ipv6"].empty?
            end
          end
          nodes
        end
      end
      include ViewHelpers
    end
  end
end
