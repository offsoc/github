# encoding: utf-8

module ProseDiff
  class Node
    module Proxy
      class Span

        include SpanBehaviour, SplitsChildrenAndSelfBehaviour, BaseBehaviour

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
