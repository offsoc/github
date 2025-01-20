# frozen_string_literal: true
module Enterprise
  module ConfigApply
    module AutoUpdateCheck
      def auto_update_check_enabled?
        raw_config.dig("auto-update", "enabled")
      end
    end
  end
end
