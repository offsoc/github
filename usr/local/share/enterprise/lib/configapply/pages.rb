# frozen_string_literal: true

module Enterprise
  module ConfigApply
    module Pages
      def pages_enabled?
        !!raw_config.dig("app", "pages", "enabled")
      end
    end
  end
end
