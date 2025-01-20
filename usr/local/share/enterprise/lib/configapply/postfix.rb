# frozen_string_literal: true
module Enterprise
  module ConfigApply
    module Postfix
      def postfix_enabled?
        !!raw_config.dig("smtp", "enabled")
      end
    end
  end
end
