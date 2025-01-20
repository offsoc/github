module ProseDiff
  class Node
    module Proxy
      class Caption

        include CanOnlyCorrespondToTheSameTagBehaviour, BaseBehaviour

        def appear_to_correspond?(node, other_node)
          return false unless valid_and_compatible?(node, other_node)
          true
        end

      end
    end
  end
end
