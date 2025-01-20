# An UnsplittableBehaviour node cannot be split.

module ProseDiff
  class Node

    module Proxy

      module UnsplittableBehaviour

        def split(the_atom)
          ProseDiff::Node.NodeSet(the_atom)
        end

        def diff_children(node, before, options)
          self.becomes_changed(node) unless self.has_same_content_as?(node, before)
          node
        end

      end
    end
  end
end
