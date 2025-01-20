module ProseDiff
  class Node
    module Proxy
      class Word

        include Node::Proxy::UnsplittableBehaviour, SpanBehaviour, BaseBehaviour

        def is_compatible_with?(node, other_node)
          is_a_simple_text_container?(other_node)
        end

        def appear_to_correspond?(node, other_node)
          return false unless valid_and_compatible?(node, other_node)
          is_comparable_text?(node.text.strip, other_node.text.strip)
        end

      end
    end
  end
end
