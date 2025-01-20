module ProseDiff
  class Node
    module Proxy
      class Line

        include Node::Proxy::UnsplittableBehaviour, BaseBehaviour

        def appear_to_correspond?(opaque, other_node)
          return false unless valid_and_compatible?(node, other_node)
          return Node.are_identical?(opaque, other_node)
        end

      end
    end
  end
end
