# frozen_string_literal: true
require "open3"

module Enterprise
  module ConfigApply
    module MySQL
      def mysql_enabled?
        return false if external_mysql_enabled?

        if single_node?
          true
        else
          cluster_roles.include?("mysql-server") && !cluster_value_true?(cluster_node_name, "offline")
        end
      end

      def wait_for_mysql_running(timeout = 600)
        log "Waiting for MySQL to be running"
        timeout.times do
          ok, _ = system_log("/usr/local/share/enterprise/ghe-service-wait-mysql --local 10")
          return if ok
        end
        log "mysql did not transition to state running in #{timeout} seconds"
        exit(1)
      end

      def mysql_max_connections
        raw_config.dig("mysql", "max-connections") || nil
      end

      def mysql_innodb_flush_no_fsync
        !!raw_config.dig("mysql", "innodb-flush-no-fsync")
      end

      def mysql_max_memory
        raw_config.dig("mysql", "max-memory") || 64
      end

      def mysql_kill_timeout
        raw_config.dig("mysql", "kill-timeout") || "10m"
      end
    end
  end
end
