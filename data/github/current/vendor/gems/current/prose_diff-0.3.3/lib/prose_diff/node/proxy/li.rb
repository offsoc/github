module ProseDiff
  class Node
    module Proxy
      class Li

        include LevenshteinDistanceBehaviour, CanOnlyCorrespondToTheSameTagBehaviour, BaseBehaviour

        LIST_ITEM_DIFFERENCE_THRESHOLD = 0.25

        def is_comparable_text?(node, other_node)

          return false unless node[ListBehaviour::HAS_DOPPEL] == other_node[ListBehaviour::HAS_DOPPEL]

          if node[ListBehaviour::HAS_DOPPEL] == 'true'
            node[Node::DIGEST] == other_node[Node::DIGEST]
          else
            LevenshteinDistanceBehaviour.is_comparable_text?(
              Li.significant_text(node),
              Li.significant_text(other_node),
              LIST_ITEM_DIFFERENCE_THRESHOLD
            )
          end
        end

        def self.significant_text(li)
          li.children.map do |child|
            if child.name == 'ol'
              ''
            elsif child.name == 'ul'
              ''
            elsif child['src']
              child['src']
            elsif child.respond_to?(:text)
              child.text
            else
              Node.significant_html(child)
            end
          end.join.strip
        end

      end
    end
  end
end
