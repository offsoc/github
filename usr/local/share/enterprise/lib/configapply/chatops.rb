# frozen_string_literal: true

module Enterprise
  module ConfigApply
    module Chatops
      def chatops_msteams_enabled?
        !!raw_config.dig("app", "chatops", "msteams", "enabled")
      end
      def chatops_slack_enabled?
        !!raw_config.dig("app", "chatops", "slack", "enabled")
      end
    end
  end
end
