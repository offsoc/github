module ProseDiff
  class Node
    module Proxy
      class Tr

        include CanOnlyCorrespondToTheSameTagBehaviour, BaseBehaviour

        def appear_to_correspond?(node, other_node)
          return false unless valid_and_compatible?(node, other_node)
          are_comparable_lists?(node.css('> td').map(&:text), other_node.css('> td').map(&:text))
        end

      end
    end
  end
end