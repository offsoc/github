# frozen_string_literal: true
module Enterprise
  module ConfigApply
    module Ernicorn
      def ernicorn_single_node_enabled?
        enabled = raw_config.dig("app", "ernicorn", "single-node-enabled") || true
      end
    end
  end
end

