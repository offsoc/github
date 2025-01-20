# frozen_string_literal: true
module Enterprise
  module ConfigApply
    module GitRPCd
      def gitrpcd_enabled?
        enabled = raw_config.dig("app", "gitrpcd", "enabled")
        enabled.nil? || enabled
      end

      def go_githooks_enabled?
        enabled = raw_config.dig("app", "go-githooks", "enabled")
        enabled.nil? || enabled
      end
    end
  end
end
