module ProseDiff
  class Node
    module Proxy
      class Img

        include UnsplittableBehaviour, CanOnlyCorrespondToTheSameTagBehaviour, BaseBehaviour

        def has_same_content_as? node, other_node
          node['src'] == other_node['src']
        end

        def appear_to_correspond? node, other_node
          return false unless valid_and_compatible?(node, other_node)
          self.has_same_content_as?(node, other_node)
        end

      end
    end
  end
end
