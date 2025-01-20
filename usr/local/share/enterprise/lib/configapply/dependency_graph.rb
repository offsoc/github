# frozen_string_literal: true
module Enterprise
  module ConfigApply
    module DependencyGraph
      def dependency_graph_enabled?
        dependency_graph_enabled_in_config?
      end

      def vulnerability_alerting_and_settings_enabled?
        dependency_graph_enabled_in_config?
      end

      private

      def dependency_graph_enabled_in_config?
        !!raw_config.dig("app", "dependency-graph", "enabled")
      end
    end
  end
end
