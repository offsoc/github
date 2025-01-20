# frozen_string_literal: true

module Enterprise
  module ConfigApply
    module ExportMigrations
      def migrations_enabled?
        !!raw_config.dig("app", "migrations", "enabled")
      end
    end
  end
end
