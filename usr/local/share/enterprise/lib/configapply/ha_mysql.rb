# frozen_string_literal: true

module Enterprise
  module ConfigApply
    module HighAvailability
      # MySQL contains methods regarding the operation of the MySQL daemon
      module MySQL
        def mysql_master
          return external_mysql_address if external_mysql_enabled?

          single_node? ? "localhost" : cluster_value("mysql-master")
        end

        def mysql_master_port
          external_mysql_enabled? ? external_mysql_port : 3306
        end

        def mysql_master_replica
          return external_mysql_address if external_mysql_enabled?

          single_node? ? "localhost" : cluster_value("mysql-master-replica")
        end

        # True if the given node (defaults to localhost) is the `mysql_master`
        def mysql_master?(node_name = cluster_node_name)
          # In non single node ghes operating mode:
          # 1. We always respect the `mysql-master` to decide if a node is mysql master node.
          # 2. In HA mode, `mysql-master` should match HA primary node.
          # 3. With external database, mysql_master will be an external hostname, this should always return false
          mysql_master == node_name
        end

        # Check if the node could be used as a delegate in "cluster"
        #
        # In Single Node mode:
        #  return true
        #
        # In Regular Cluster and HA mode:
        #
        # - If MySQL is running inside cluster:
        #     return true if current node is MySQL primary node
        #     return false if current node is not MySQL primary node
        #
        # - If MySQL is not running inside cluster (e.g., using external MySQL):
        #     return true if current node is the first online node inside cluster
        #     return false if current node is not first online node inside cluster
        def ghes_cluster_delegate?
          return true if single_node? || cluster_ha_primary? || mysql_master?
          if external_mysql_enabled?
            return true if cluster_node_name == cluster_nodes_online.first["hostname"]
          end
          false
        end

        # Get cluster delegate based on the same logic of ghes_cluster_delegate?
        def ghes_cluster_delegate
          return "localhost" if single_node?
          return cluster_ha_primary if cluster_ha_enabled?
          return cluster_nodes_online.first["hostname"] if external_mysql_enabled?
          mysql_master
        end

        def mysql_auto_failover?
          cluster_regular_enabled? && cluster_value_true?("mysql-auto-failover")
        end

        # True if the given node (defaults to localhost) is the `mysql_master_replica`
        def mysql_master_replica?(node_name = cluster_node_name)
          mysql_master_replica == node_name
        end

        def mysql_slave_net_timeout
          4
        end

        # Set the server_id to an integer based of the hash of the UUID.
        def update_mysql_server_id
          return unless mysql_enabled?

          wait_for_mysql_running(180)
          # capture2e combines stdout and stderr
          output, _ = Open3.capture2e("sudo mysql -u root -sN -e 'SELECT @@server_id;'")
          if output != mysql_server_id
            system_log("sudo mysql -u root -e 'SET GLOBAL server_id = #{mysql_server_id}'")
          end
        end

        # Update mysql primary if it is changed
        def update_mysql_primary
          # Check if local node runs MySQL and is the master
          return unless mysql_enabled? && mysql_master?

          # A prior configuration run may have scheduled a MySQL stop & start
          # We're allotting 30 seconds of shutdown time & 60 seconds of startup time
          wait_for_mysql_running(180)
          # This will be no-op if mysql primary didn't change. Otherwise,
          # the new mysql primary will need to stop replication first.
          ok, _ = system_log("sudo -u admin /usr/local/share/enterprise/ghe-mysql-repl-stop")
          if !ok
            log_status "Disabling replication on new master failed"
            exit(1)
          end
        end

        def mysql_master_param
          # mysql hostname has max length of 60 characters in mysql < v8
          mysql_host_max_length = 60
          if !cluster_regular_enabled? || !cluster_replica? || mysql_master_replica?
            mysql_host_ip = wireguard_enabled? ? cluster_value(mysql_master, "vpn") : cluster_value(mysql_master, "ipv4")
            mysql_master.length > mysql_host_max_length ? mysql_host_ip : mysql_master
          else
            mysql_host_ip = wireguard_enabled? ? cluster_value(mysql_master_replica, "vpn") : cluster_value(mysql_master_replica, "ipv4")
            mysql_master_replica.length > mysql_host_max_length ? mysql_host_ip : mysql_master_replica
          end
        end

        def update_mysql_replication
          # Not needed if it is sql master or we're not running MySQL
          return if !mysql_enabled? || mysql_master?

          cmd = "sudo --preserve-env=SKIP_DB_SEED -u admin /usr/local/share/enterprise/ghe-mysql-repl-start "
          cmd += mysql_master_param.to_s

          ok = false
          # we're reading the config from the cluster.conf since we want to restrict skipping db seeding to specific nodes
          if system("ghe-config --true cluster.#{cluster_node_name}.skip-data-setup")
            # skip-data-setup is not allowed on an active replica server since we redirect read traffic to the node
            if cluster_ha_replica_active?
              logger.warn "WARNING: skip-data-setup is not allowed on an active replica server, database will be seeded"
              ok, _ = system_log(cmd)
            else
              # only an option for (true) cluster configurations
              ok, _ = system_log(cmd, {"SKIP_DB_SEED" => "1"})
            end
          else
            ok, _ = system_log(cmd)
          end

          if !ok
            log_status "Setting up replication failed"
            exit(1)
          end
        end

        # ViewHelpers for MySQL
        module ViewHelpers
          def mysql_replicas
            # BYODB replica endpoints are enabled for active replica
            if external_mysql_enabled? && mysql_active_replicas?
              external_mysql_replicas = external_mysql_replicas_in_datacenter(cluster_datacenter)
              return external_mysql_replicas if external_mysql_replicas.any?
            end

            return [mysql_master] if external_mysql_enabled?
            return [mysql_master] if single_node?
            return [mysql_master] unless mysql_active_replicas?

            cluster_nodes_in_datacenter(cluster_datacenter, "mysql")
          end

          # ports matching with mysql_replicas
          def mysql_replica_ports
            # BYODB replica endpoints are enabled for active replica
            if external_mysql_enabled? && mysql_active_replicas?
              external_mysql_replica_ports = external_mysql_replica_ports_in_datacenter(cluster_datacenter)
              return external_mysql_replica_ports if external_mysql_replica_ports.any?
            end

            Array.new(mysql_replicas.length, mysql_master_port)
          end

          def mysql_username
            return external_mysql_username if external_mysql_enabled?

            return "github" if single_node? || !cluster_value("mysql-username")

            cluster_value("mysql-username")
          end

          def mysql_password
            if external_mysql_enabled?
              external_mysql_password.to_s
            else
              secret_value("mysql").to_s
            end
          end

          # Returns a unique integer based on the UUID,
          # used in templates/etc/mysql/conf.d/serverid.cnf.erb
          def mysql_server_id
            @node_uuid = node_uuid
            Digest::SHA256.hexdigest(@node_uuid).unpack1("N")
          end

          private

          # Whether mysql replicas should be used
          def mysql_active_replicas?
            return true if cluster_ha_replica_active? || cluster_ha_replica_cache?

            cluster_dr_enabled? && !cluster_local_node?(mysql_master)
          end
        end
        include ViewHelpers
      end
    end
  end
end
