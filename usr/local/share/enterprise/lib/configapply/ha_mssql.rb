# frozen_string_literal: true
module Enterprise
  module ConfigApply
    module HighAvailability
      # MSSQL contains methods regarding the operation of the MSSQL daemon
      module MSSQL
        def mssql_master
          return "localhost" if single_node? # Note: single_node is actually true on replicas in HA, but that doesn't matter for all callers of this
          return "localhost" if cluster_value("mssql-master").nil? || cluster_value("mssql-master").empty?  # This handles the case where you have a cluster without actions
          cluster_value("mssql-master")
        end

        def update_mssql_replication
          return if !actions_enabled?
          return if !cluster_enabled?
          return if !cluster_roles.include?("mssql-server")
          # if first one AND second one return false, then failure...
          check_ok, _ = system_log("sudo -u admin /usr/local/share/enterprise/ghe-repl-status-mssql --check-started")
          start_ok, _ = system_log("sudo -u admin /usr/local/share/enterprise/ghe-repl-start-mssql")
          unless (check_ok || start_ok)
            log_status "Setting up mssql replication failed"
            exit(1)
          end

          ok, _ = system_log("sudo -u admin /usr/local/share/enterprise/ghe-mssql-remove-unassigned-replicas")
          if !ok
            log_status "Updating up mssql replication failed"
            exit(1)
          end
        end

        module ViewHelpers
          def mssql_master_ip
            node_ip(mssql_master)
          end
        end
        include ViewHelpers
      end
    end
  end
end
