module ProseDiff
  class Node
    module Proxy
      class Div

        include LevenshteinDistanceBehaviour, CanOnlyCorrespondToTheSameTagBehaviour, BaseBehaviour

        def have_comparable_text?(node, other_node)
          is_comparable_text?(node, other_node)
        end

      end
    end
  end
end
