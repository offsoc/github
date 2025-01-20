module ProseDiff
  class Node
    module Proxy
      class Ul

        include LevenshteinDistanceBehaviour, CanOnlyCorrespondToTheSameTagBehaviour, ListBehaviour, BaseBehaviour

        def children_of(node)
          node.css('> li')
        end

      end
    end
  end
end
