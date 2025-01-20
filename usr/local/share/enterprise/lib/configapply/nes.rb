# frozen_string_literal: true
module Enterprise
  module ConfigApply
    module Nes
      def nes_enabled?
        # Pass DEV_MODE=true to chroot-build in your bp-dev instance in order to test NES without a cluster environment.
        # Internal use only, setting should never be exposed to our customers
        if dev_mode && raw_config.dig("app", "nes", "enabled")
          true
        else
          !!raw_config.dig("app", "nes", "enabled") && cluster_enabled?
        end
      end

      def nes_node_eligible?(node_name = cluster_node_name)
        !!system_log("nes get-node-eligibility #{node_name} --json | jq -re '.Eligibility == \"eligible\"'")
      end
    end
  end
end
