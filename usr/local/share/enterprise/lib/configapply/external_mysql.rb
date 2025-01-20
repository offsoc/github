# frozen_string_literal: true
module Enterprise
  module ConfigApply
    module ExternalMySQL
      def external_mysql_enabled?
        !!raw_config.dig("mysql", "external", "enabled")
      end

      def external_mysql_address
        raw_config.dig("mysql", "external", "address")
      end

      def external_mysql_port
        raw_config.dig("mysql", "external", "port")
      end

      def external_mysql_username
        raw_config.dig("mysql", "external", "username")
      end

      def external_mysql_password
        secret_value("external", "mysql")
      end
    end
  end
end
