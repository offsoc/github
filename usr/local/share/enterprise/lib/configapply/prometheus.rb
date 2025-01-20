module Enterprise
  module ConfigApply
    module Prometheus 
      def prometheus_enabled?
        !!raw_config.dig("app", "prometheus", "enabled")
      end
    end
  end
end
