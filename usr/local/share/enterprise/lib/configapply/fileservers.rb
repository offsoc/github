# frozen_string_literal: true
module Enterprise
  module ConfigApply
    # FileServers contains methods supporting the list of Git backend "file servers"
    module FileServers
      ALL_NODES = 1
      REPLICA_ENABLED = 2
      REPLICA_DISABLED = 3

      def fileserver_nodes_with_role(role, replica_node_type, skip_offline = true)
        return [[uuid_nodename("#{role}-"), "localhost"]] if single_node?

        cluster_nodes(role, skip_offline, true).select do |node|
          match_node_type(node, replica_node_type)
        end.map { |n| [uuid_nodename("#{role}-", n["uuid"]), n["hostname"]] }
      end

      def match_node_type(props, replica_node_type)
        return true if replica_node_type == ALL_NODES

        !cluster_replica?(props) == (replica_node_type == REPLICA_DISABLED)
      end

      def fileserver_nodes(replica_node_type = ALL_NODES, skip_offline = true)
        fileserver_nodes_with_role("git-server", replica_node_type, skip_offline)
      end

      def cache_fileserver_nodes(replica_node_type = ALL_NODES)
        fileserver_nodes_with_role("cache-server", replica_node_type)
      end

      def pages_fileserver_nodes(replica_node_type = ALL_NODES)
        fileserver_nodes_with_role("pages-server", replica_node_type)
      end

      def storage_fileserver_nodes(replica_node_type = ALL_NODES)
        fileserver_nodes_with_role("storage-server", replica_node_type)
      end

      # Return a string with the number of voting copies, for consumption by ERb's env vars
      def voting_copies(nodes)
        if cluster_ha_enabled? || nodes < 2
          "1"
        else
          "3"
        end
      end

      # Return a string with the number of non-voting copies, for consumption by ERb's env vars
      # cache servers are not counted as non-voting copies since they don't hold pages data,
      # or storage/alambic or git data (unless configured to do so)
      def nonvoting_copies(nodes)
        if cluster_ha_enabled?
          (fileserver_nodes.size - 1 - cache_fileserver_nodes.size).to_s
        elsif single_node? || nodes == 0
          ""
        else
          voting_copies(nodes).to_s
        end
      end

      def voting_fileserver_count
        voting_copies(fileserver_nodes(REPLICA_DISABLED).size)
      end

      def voting_pages_fileserver_count
        voting_copies(pages_fileserver_nodes(REPLICA_DISABLED).size)
      end

      def voting_storage_fileserver_count
        voting_copies(storage_fileserver_nodes(REPLICA_DISABLED).size)
      end

      def nonvoting_fileserver_count
        nonvoting_copies(fileserver_nodes(REPLICA_ENABLED).size)
      end

      def nonvoting_pages_fileserver_count
        nonvoting_copies(pages_fileserver_nodes(REPLICA_ENABLED).size)
      end

      def nonvoting_storage_fileserver_count
        nonvoting_copies(storage_fileserver_nodes(REPLICA_ENABLED).size)
      end

      def update_fileservers
        return unless ghes_cluster_delegate?

        # if the host is not online, mark it so in the fileservers table
        online_hosts = fileserver_nodes.map { |fs| "'#{fs.first}'" }.join(",")
        mysql_query "UPDATE `fileservers` SET `online` = 0 WHERE host NOT IN (#{online_hosts})"

        if cluster_regular_enabled?
          # in true cluster, offline nodes are still counted as part of the cluster
          # (on a primary cluster in Cluster HA, they are counted as part of the quorum)
          # so we get fileserver nodes that include offline (skip_offline = false)
          cluster_hosts = fileserver_nodes(ALL_NODES, false).map { |fs| "'#{fs.first}'" }.join(",")
        else
          # on standard HA, there is only one source of truth — the primary
          # therefore if a node is not online, it should not be voting
          cluster_hosts = online_hosts
        end
        mysql_query "UPDATE `fileservers` SET `non_voting` = 1 WHERE host NOT IN (#{cluster_hosts})"

        fileserver_nodes.each do |node_info|
          uuid_name, config_name = *node_info
          mysql_query "INSERT IGNORE INTO `fileservers` (`host`, `fqdn`, `online`) VALUES ('#{uuid_name}', '#{uuid_name}.', 0)"
          update = "UPDATE `fileservers` SET `online` = 1"
          update += ", `datacenter` = #{fileserver_sql_val(config_name, 'datacenter', 'default')}"
          update += ", `rack` = #{fileserver_sql_val(config_name, 'rack')}"
          update += ", `non_voting` = #{cluster_replica?(config_name) ? 1 : 0}"
          update += ", `cache_location` = #{cache_location_sql_val(config_name)}"
          update += " WHERE `host` = '#{uuid_name}'"
          mysql_query update

          next unless config_name

          %w[repository gist network].each do |table|
            mysql_query "UPDATE `#{table}_replicas` SET `host` = '#{uuid_name}' WHERE `host` = '#{config_name}'"
          end
        end
      end

      # return a fragment of a SQL UPDATE statement
      def fileserver_sql_val(node_name, field, default = nil)
        return "NULL" if single_node?

        val = cluster_value(node_name, field)
        if val && val.size > 0
          "'#{val}'"
        else
          default ? "'#{default}'" : "NULL"
        end
      end

      def cache_location_sql_val(node_name)
        location = cluster_cache_location(node_name)
        location && !location.strip.empty? ? "'#{location}'" : "NULL"
      end

      def update_pages_fileservers
        return unless ghes_cluster_delegate?

        # Mark pages fileservers offline if they're not currently online
        online_hosts = pages_fileserver_nodes.map { |fs| "'#{fs.first}'" }.join(",")
        mysql_query "UPDATE `pages_fileservers` SET `online` = 0 where host not in (#{online_hosts})"

        pages_fileserver_nodes.each do |node_info|
          uuid_name, config_name = *node_info
          mysql_query "INSERT IGNORE INTO `pages_fileservers` (`host`, `online`, `embargoed`, `created_at`, `updated_at`) VALUES ('#{uuid_name}', 0, 0, NOW(), NOW())"
          mysql_query "UPDATE `pages_fileservers` SET `online` = 1, `datacenter` = #{fileserver_sql_val(config_name, 'datacenter', 'default')}, `rack` = #{fileserver_sql_val(config_name, 'rack')}, `non_voting` = #{cluster_replica?(config_name) ? 1 : 0}, `updated_at` = NOW() WHERE `host` = '#{uuid_name}'"
          8.times do |i|
            mysql_query "INSERT IGNORE INTO `pages_partitions` (`host`, `partition`, `disk_free`, `disk_used`, `created_at`, `updated_at`) VALUES ('#{uuid_name}', '#{i}', 0, 0, NOW(), NOW())"
          end

          next unless config_name

          %w[pages_replicas pages_routes].each do |table|
            mysql_query "UPDATE `#{table}` SET `host` = '#{uuid_name}' WHERE `host` = '#{config_name}'"
          end
        end
      end

      def update_storage_fileservers
        return unless ghes_cluster_delegate?

        # Mark storage fileservers offline if they're not currently online
        online_hosts = storage_fileserver_nodes.map { |fs| "'#{fs.first}'" }.join(",")
        # unlike fileservers (for git) above, we don't need to set these entries to non-voting as the storage logic ignores offline hosts
        mysql_query "UPDATE `storage_file_servers` SET `online` = 0 where host not in (#{online_hosts})"

        storage_fileserver_nodes.each do |node_info|
          uuid_name, config_name = *node_info
          mysql_query "INSERT IGNORE INTO `storage_file_servers` (`host`, `online`, `embargoed`, `created_at`, `updated_at`) VALUES ('#{uuid_name}', 0, 0, NOW(), NOW())"
          mysql_query "UPDATE `storage_file_servers` SET `online` = 1, `datacenter` = #{fileserver_sql_val(config_name, 'datacenter', 'default')}, `rack` = #{fileserver_sql_val(config_name, 'rack')}, `non_voting` = #{cluster_replica?(config_name) ? 1 : 0}, `cache_location` = #{cache_location_sql_val(config_name)}, `updated_at` = NOW() WHERE `host` = '#{uuid_name}'"

          16.times do |i|
            mysql_query "INSERT IGNORE INTO `storage_partitions` (`storage_file_server_id`, `partition`, `disk_free`, `disk_used`, `created_at`, `updated_at`) (SELECT `id`, '#{i.to_s(16)}', 0, 0, NOW(), NOW() FROM `storage_file_servers` WHERE `host` = '#{uuid_name}')"
          end

          mysql_query "UPDATE `storage_replicas` SET `host` = '#{uuid_name}' WHERE `host` = '#{config_name}'" if config_name
        end
      end

      def uuid_nodename(prefix = "", uuid = nil)
        "#{prefix}#{uuid || node_uuid}"
      end
    end
  end
end
