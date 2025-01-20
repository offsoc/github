# encoding: utf-8
module ProseDiff
  class Node

    module Proxy

      module LevenshteinDistanceBehaviour

        TEXT_DIFFERENCE_THRESHOLD = 0.5

        def is_comparable_text?(node, other_node, threshold = TEXT_DIFFERENCE_THRESHOLD)
          node_text, other_node_text = Node.to_text_string(node), Node.to_text_string(other_node)

          return true if node_text == other_node_text

          node_length, other_node_length = node_text.length, other_node_text.length
          if node_length > other_node_length
            max_distance = node_length * threshold
            return false if other_node_length < (node_length - max_distance)
          else
            max_distance = other_node_length * threshold
            return false if node_length < (other_node_length - max_distance)
          end
          Levenshtein.distance(node_text, other_node_text) <= max_distance
        end

        module_function :is_comparable_text?

      end
    end
  end
end