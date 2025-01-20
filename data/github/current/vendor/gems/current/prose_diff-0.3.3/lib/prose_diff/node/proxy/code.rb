module ProseDiff
  class Node
    module Proxy
      class Code

        include UnsplittableBehaviour, BaseBehaviour

        def appear_to_correspond?(node, other_node)
          return false unless valid_and_compatible?(node, other_node)
          if node['id'] && node['id'] == other_node['id']
            return true
          elsif node['itemprop'] && node['itemprop'] == other_node['itemprop']
            return true
          else
            ProseDiff::Node.has_same_content_as? node, other_node
          end
        end

      end
    end
  end
end
