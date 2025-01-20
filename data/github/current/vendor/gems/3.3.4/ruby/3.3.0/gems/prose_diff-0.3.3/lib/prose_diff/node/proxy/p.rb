module ProseDiff
  class Node
    module Proxy
      class P

        include LevenshteinDistanceBehaviour, SimpleTextContainerBehaviour, BaseBehaviour

        def is_compatible_with?(node, other_node)
          other_node.name == 'p' || other_node.name == 'blockquote'
        end

        def have_comparable_text?(node, other_node)
          is_comparable_text?(node, other_node)
        end

      end
    end
  end
end
