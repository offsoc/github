# frozen_string_literal: true
require "open3"

module Enterprise
  module Ghe
    module Mysql
      class ExternalMysqlValidator
        attr_reader :errors, :warnings

        def initialize(username:, password:, address:, port:, host_type:)
          @username = username
          @password = password
          @address = address
          @port = port
          @host_type = host_type
          @config = parse_external_mysql_config
          @errors = []
          @warnings = []
          validate
        end

        def validate
          validate_previously_configured
          validate_mysql_version
          validate_mysql_type
          validate_replication
          validate_general
          validate_perf
          validate_safety
          validate_innodb
        end

        def warning?
          warnings.any?
        end

        def valid?
          errors.empty?
        end

        def error_message
          errors.join("\n")
        end

        def warning_message
          warnings.join("\n")
        end

        private

        attr_reader :config, :username, :password, :address, :port, :host_type

        def mysql_connection_args
          [{"MYSQL_PWD" => password}, "mysql", "--user", username, "--host", address, "--port", port]
        end

        def previously_configured?
          _, _, status = Open3.capture3(*mysql_connection_args, "--database", "github_enterprise", "-e", "DESCRIBE external_database_configuration_log;")
          !!status.success?
        end

        def fetch_raw_external_configs
          stdout, stderr, status = Open3.capture3(*mysql_connection_args, "-e", "SHOW GLOBAL VARIABLES;")
          return stdout if status.success?

          puts stderr
          exit 1
        end

        def parse_external_mysql_config
          fetch_raw_external_configs.split("\n").map { |n| n.split("\t") }.reduce({}) do |config, item|
            if item.size == 2
              config[item.first] = item.last
            elsif item.size == 1
              config[item.first] = ""
            else
              raise "Error: Improperly formatted config. Please ensure you have formatted your my.cnf file properly and are using the required settings."
            end
            config
          end
        end

        def validate_previously_configured
          if previously_configured?
            warnings << "Warning: '#{address}' has previously been configured as a GitHub Enterprise MySQL server."
          end
        end

        def validate_mysql_version
          if !config["version"]
            errors << "Validation Error: Could not find version number. Please use MySQL version 8.0.28 or greater"
          else
            begin
              # we've seen the following version string which causes the Ruby
              # Version gem to throw a "Malformed version number string
              # (ArgumentError)" exception due to the "+":
              # 5.7.44-0ubuntu0.18.04.1+esm1-log
              # See https://ubuntu.com/security/notices/USN-6583-1
              version = config["version"].sub("+", "-")
              if Gem::Version.new(version) < Gem::Version.new("8.0.28")
                errors << "Validation Error: MySQL version must be at least 8.0.28"
              end
            rescue => e
              errors << "Ruby Exception: #{e}"
            end
          end
        end

        def validate_mysql_type
          if !config["version_comment"]
            errors << "Validation Error: Could not find version_comment. Please use Oracle MySQL"
          else
            if config["version_comment"].downcase.include?("mariadb")
              errors << "Validation Error: MariaDB is not a supported distribution of MySQL. Please use Oracle MySQL"
            end
            if config["version_comment"].downcase.include?("percona")
              errors << "Validation Error: Percona is not a supported distribution of MySQL. Please use Oracle MySQL"
            end
          end
        end

        def validate_general
          if !config["default_storage_engine"] || !config["default_storage_engine"].casecmp?("InnoDB")
            errors << "Validation Error: default_storage_engine has to be 'InnoDB'"
          end
          if !config["character_set_server"] || !(config["character_set_server"].casecmp?("utf8") || config["character_set_server"].casecmp?("utf8mb3"))
            errors << "Validation Error: character_set_server has to be 'utf8' or 'utf8mb3'"
          end
          if !config["collation_server"] || !(config["collation_server"].casecmp?("utf8_general_ci") || config["collation_server"].casecmp?("utf8mb3_general_ci"))
            errors << "Validation Error: collation_server has to be 'utf8_general_ci' or 'utf8mb3_general_ci'"
          end
          if !config["sql_mode"] || !config["sql_mode"].casecmp?("NO_ENGINE_SUBSTITUTION")
            errors << "Validation Error: sql_mode has to be 'NO_ENGINE_SUBSTITUTION'"
          end
        end

        def validate_safety
          if !config["max_connections"] || config["max_connections"].to_i < 1000
            errors << "Validation Error: max_connections must be greater than or equal to 1000"
          end
          if !config["lock_wait_timeout"] || config["lock_wait_timeout"].to_i > 30
            errors << "Validation Error: lock_wait_timeout must be less than or equal to 30"
          end
        end

        def validate_replication
          if host_type != "azure" && (!config["gtid_mode"] || !config["gtid_mode"].casecmp?("ON"))
            errors << "Validation Error: gtid_mode has to be 'ON'"
          end
          if host_type != "azure" && (!config["enforce_gtid_consistency"] || !config["enforce_gtid_consistency"].casecmp?("ON"))
            errors << "Validation Error: enforce_gtid_consistency has to be 'ON'"
          end
          if !config["binlog_gtid_simple_recovery"] || !config["binlog_gtid_simple_recovery"].casecmp?("ON")
            errors << "Validation Error: binlog_gtid_simple_recovery has to be 'ON'"
          end
          if !config["log_slave_updates"] || !config["log_slave_updates"].casecmp?("ON")
            errors << "Validation Error: log_slave_updates has to be 'ON'"
          end
          if !config["log_bin"] || config["log_bin"].strip.empty?
            errors << "Validation Error: log_bin must have some value set"
          end
          if !config["sync_binlog"] || config["sync_binlog"] != "1"
            errors << "Validation Error: sync_binlog has to be '1'"
          end
          if !config["binlog_format"] || !config["binlog_format"].casecmp?("ROW")
            errors << "Validation Error: binlog_format has to be 'ROW'"
          end
          if !config["relay_log_recovery"] || !config["relay_log_recovery"].casecmp?("ON")
            errors << "Validation Error: relay_log_recovery has to be 'ON'"
          end
          if !config["server_id"] || config["server_id"].strip.empty?
            errors << "Validation Error: server_id must be present"
          end
        end

        def validate_innodb
          if !config["innodb_file_per_table"] || !config["innodb_file_per_table"].casecmp?("ON")
            errors << "Validation Error: innodb_file_per_table has to be 'ON'"
          end
        end

        def validate_perf
          if host_type != "gcp" && (!config["optimizer_switch"] || !config["optimizer_switch"].downcase.include?("index_merge_intersection=off"))
            errors << "Validation Error: optimizer_switch must contain 'index_merge_intersection=off'"
          end
          if !config["table_open_cache"] || config["table_open_cache"].to_i < 1000
            errors << "Validation Error: table_open_cache must be greater than or equal to 1000"
          end
        end
      end
    end
  end
end
