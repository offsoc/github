# encoding: utf-8

module ProseDiff
  class Node
    module Proxy
      class Unword

        include Node::Proxy::UnsplittableBehaviour, SpanBehaviour, BaseBehaviour

        def is_compatible_with?(node, other_node)
          is_a_simple_text_container?(other_node) &&
          other_node.text =~ ProseDiff::Node::WordSplitting::LEADING_NONWORD_CHARACTERS
        end

        def appear_to_correspond?(node, other_node)
          return false unless valid_and_compatible?(node, other_node)
          has_same_content_as?(node, other_node)
        end

        def has_same_content_as?(node, other_node)
          rendered_node_text = node.text.gsub(/\s+/, ' ')
          rendered_other_node_text = other_node.text.gsub(/\s+/, ' ')
          rendered_node_text = rendered_other_node_text
        end

        def diff_with_before(node, before, options)
          if has_same_content_as?(node, before)
            becomes_changed(node)
          else
            super(node, before, options)
          end
        end

      end
    end
  end
end
