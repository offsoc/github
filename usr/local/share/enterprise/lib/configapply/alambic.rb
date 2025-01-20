# frozen_string_literal: true
module Enterprise
  module ConfigApply
    module Alambic
      # ALAMBIC_DB_FETCH_ENABLED is an Alambic's environment variable that controls
      # whether avatars should be fetched from the database, and whose value is a
      # percentage ranging from 0 to 100.
      def alambic_db_fetch_enabled?
        db_fetch_enabled_value = raw_config.dig("app", "alambic", "db-fetch-enabled")
        return false if db_fetch_enabled_value.nil?

        trimmed_value = db_fetch_enabled_value.strip
        return false if trimmed_value.empty?
        trimmed_value.to_i > 0
      end

      def alambic_db_fetch_enabled
        raw_config.dig("app", "alambic", "db-fetch-enabled")
      end
    end
  end
end
