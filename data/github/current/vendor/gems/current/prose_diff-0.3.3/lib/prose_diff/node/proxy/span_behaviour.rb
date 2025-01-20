# encoding: utf-8

module ProseDiff
  class Node

    module Proxy

      module SpanBehaviour

        def appear_to_correspond?(node, other_node)
          return false unless valid_and_compatible?(node, other_node)
          return node['id'] == other_node['id'] if node['id'] || other_node['id']
          return true if node.inner_text.empty? && other_node.inner_text.empty?
          return false if node.inner_text.empty? || other_node.inner_text.empty?
          prefix_l, del_text_l, ins_text_l, suffix_l = LCS.smallest_contiguous_change(node.text, other_node.text).map(&:length)
          change_size =[del_text_l, ins_text_l].max
          change_size < ((prefix_l + suffix_l).to_f / 2.0)
        end

        def is_textlike? node
          true
        end

        def unsplit(node, other_node)

          if ProseDiff::Node.is_uncomplicated?(node) && node.children.empty?
            Nokogiri::XML::NodeSet.new(node.document, [ other_node ])
          elsif ProseDiff::Node.is_uncomplicated?(node) && other_node.kind_of?(Nokogiri::XML::Text)
            a, b = node.children[0..-2], ProseDiff::Node.unsplit(node.children.last, other_node)
            Nokogiri::XML::NodeSet.new(node.document, [ Node.replace_children( node.dup,  a + b )])
          elsif ProseDiff::Node.analysis(node) == ProseDiff::Node.analysis(other_node) &&
              ProseDiff::Node.is_textlike?(other_node) && ProseDiff::Node.doesnt_have_natural_keys?(other_node)
            a, b = node.children[0..-2], ProseDiff::Node.unsplit_all(node.children.last, other_node.children)
            Nokogiri::XML::NodeSet.new(node.document, [ Node.replace_children( node.dup,  a + b )])
          else
            super(node, other_node)
          end

        end

      end
    end
  end
end
