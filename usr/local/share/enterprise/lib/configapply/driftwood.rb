# frozen_string_literal: true

module Enterprise
  module ConfigApply
    module Driftwood
      def streaming_enabled?
        val = raw_config.dig("app", "driftwood", "enabled")
        return true if val.nil?
        val
      end
    end
  end
end
