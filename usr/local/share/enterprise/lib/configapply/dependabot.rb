# frozen_string_literal: true

module Enterprise
  module ConfigApply
    module Dependabot
      def dependabot_enabled?
        !!raw_config.dig("app", "dependabot", "enabled")
      end

      def dependabot_rules_enabled?
        val = raw_config.dig("app", "dependabot", "rules", "enabled")
        return true if val.nil?
        val
      end
    end
  end
end
