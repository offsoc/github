# frozen_string_literal: true
module Enterprise
  module ConfigApply
    module ClusterRebalance
      def cluster_rebalance_enabled?
        cluster_regular_enabled? && !!raw_config.dig("app", "cluster-rebalance", "enabled")
      end

      def cluster_rebalance_schedule
        value = raw_config.dig("app", "cluster-rebalance", "schedule")
        unless value.nil? || value.empty?
          value
        else
          "hourly"
        end
      end

      def cluster_rebalance_apps?
        !!raw_config.dig("app", "cluster-rebalance", "apps")
      end
      def cluster_rebalance_apps
        raw_config.dig("app", "cluster-rebalance", "apps")
      end

      def cluster_rebalance_workers?
        !!raw_config.dig("app", "cluster-rebalance", "workers")
      end
      def cluster_rebalance_workers
        raw_config.dig("app", "cluster-rebalance", "workers")
      end

      def cluster_rebalance_timeout?
        !!raw_config.dig("app", "cluster-rebalance", "timeout")
      end
      def cluster_rebalance_timeout
        raw_config.dig("app", "cluster-rebalance", "timeout")
      end
    end
  end
end
