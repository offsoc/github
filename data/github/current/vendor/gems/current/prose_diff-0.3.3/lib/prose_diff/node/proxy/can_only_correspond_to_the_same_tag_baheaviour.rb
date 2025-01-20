module ProseDiff
  class Node
    module Proxy
      module CanOnlyCorrespondToTheSameTagBehaviour

        def is_compatible_with?(node, other_node)
          other_node.name == node.name
        end

      end
    end
  end
end
