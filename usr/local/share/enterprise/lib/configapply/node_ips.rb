# frozen_string_literal: true
module Enterprise
  module ConfigApply
    # NodeIPs provides methods that determine the IP lists for certain cluster nodes
    module NodeIPs
      module ViewHelpers
        def metrics_servers_ips
          cluster_nodes("metrics-server").map { |n| node_ip(n["hostname"]) }
        end

        def domain_host_ips
          return ["127.0.0.1"] if single_node? || cluster_ha_enabled?

          ips = []
          cluster_nodes_online("web-server").each do |node|
            if cluster_local_node?(node["hostname"])
              if node["vpn"] && !node["vpn"].empty? && wireguard_enabled?
                ips << node["vpn"]
              else
                ips << node["ipv4"] unless node["ipv4"].to_s.empty?
                ips << node["ipv6"] unless node["ipv6"].to_s.empty?
              end
            end
          end
          ips
        end
      end
      include ViewHelpers
    end
  end
end
