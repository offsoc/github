module ProseDiff
  class Node
    module Proxy
      class Td

        include CanOnlyCorrespondToTheSameTagBehaviour, BaseBehaviour

        def appear_to_correspond?(node, other_node)
          return false unless valid_and_compatible?(node, other_node)
          if node['data-github-column'] && other_node['data-github-column']
            node['data-github-column'] == other_node['data-github-column']
          else
            super(node, other_node)
          end
        end

      end
    end
  end
end