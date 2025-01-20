# frozen_string_literal: true
module Enterprise
  module ConfigApply
    module Checks
      def checks_retention_enabled?
        !!raw_config.dig("checks", "retention", "enabled")
      end
    end
  end
end