# encoding: utf-8

module ProseDiff
  class Node
    module Proxy
      class H

        include LevenshteinDistanceBehaviour, BaseBehaviour

        def is_compatible_with?(node, other_node)
          !!(other_node.name =~ /^h[1-6]$/i)
        end

        def have_comparable_text?(node, other_node)
          is_comparable_text?(node, other_node)
        end

      end
    end
  end
end
