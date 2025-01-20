# frozen_string_literal: true
module Enterprise
  module ConfigApply
    module NUMA
      def numa_nodes
        `lscpu -J | jq -r '.lscpu[] | select(.field | contains("NUMA node(s)") ) | .data'`.to_i || 0
      end

      def numa_mysql_interleave?
        !!raw_config.dig("numa", "mysql-interleave")
      end

      def numa_enabled?
        !!raw_config.dig("numa", "enabled")
      end
    end
  end
end
