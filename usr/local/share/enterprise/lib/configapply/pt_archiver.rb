# frozen_string_literal: true
module Enterprise
  module ConfigApply
    module PtArchiver
      def pt_archiver_enabled?
        if single_node?
          true
        elsif cluster_enabled?
          if external_mysql_enabled?
            # return if the current node is first online node in cluster
            !cluster_nodes_online.empty? && (cluster_node_name == cluster_nodes_online.first["hostname"])
          else
            mysql_master?
          end
        else
          # system should not get to this state, but return false to explicitly disable pt_archiver
          false
        end
      end
    end
  end
end
