module ProseDiff
  class Node
    module Proxy
      class Opaque

        include Node::Proxy::UnsplittableBehaviour, BaseBehaviour

        def appear_to_correspond?(opaque, other_node)
          return Node.digested(opaque) == Node.digested(other_node)
        end

        def valid?(opaque)
          false
        end

      end
    end
  end
end
