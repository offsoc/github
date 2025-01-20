# frozen_string_literal: true
module Enterprise
  module ConfigApply
    module Spokesd
      def spokesd_enabled?
        enabled = raw_config.dig("app", "spokesd", "enabled")
        enabled.nil? || enabled
      end

      def spokesd_storage_policy
        storage_policy = raw_config.dig("app", "spokesd", "storage-policy")
        return storage_policy unless storage_policy.nil? || storage_policy.empty?
        return "single-node" if single_node?
        return "cluster-ha" if cluster_ha_enabled?
        "cluster-dr"
      end
    end
  end
end
