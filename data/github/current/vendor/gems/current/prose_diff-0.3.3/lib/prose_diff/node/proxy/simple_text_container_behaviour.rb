# encoding: utf-8

module ProseDiff
  class Node
    module Proxy
      module SimpleTextContainerBehaviour

        CHUNKING_THRESHOLD = 0.5

        WORD_DIFFER = lambda { |a, b| Node.to_text_string(a).downcase == Node.to_text_string(b).downcase }

        def diff_children(node, before, options)

          common_prefix, node_children, before_children, common_suffix = strip_prefixes([], node.children.to_a, before.children.to_a, [])

          node_text, before_text = node_children.map(&:inner_text).join, before_children.map(&:inner_text).join

          if !ProseDiff::Node::Proxy::LevenshteinDistanceBehaviour.is_comparable_text?(node_text.downcase, before_text.downcase, CHUNKING_THRESHOLD)

            chunk_diff(node, common_prefix, node_children, before_children, common_suffix, options)

          elsif node_children.length == 1 && node_children.first.kind_of?(Nokogiri::XML::Text) && before_children.length == 1 && before_children.first.kind_of?(Nokogiri::XML::Text)

            text_diff(node, common_prefix, node_children.first, before_children.first, common_suffix, options)

          else

            children_diff(node, common_prefix, node_children, before_children, common_suffix, options)

          end

          if self.was_unchanged?(node) && node.children.any? { |ch| ProseDiff::Node.was_changed?(ch) || ProseDiff::Node.was_added?(ch) || ProseDiff::Node.was_removed?(ch) }
            self.becomes_changed(node)
          end

          node

        end

        private

        # fastest
        def chunk_diff(node, common_prefix, node_children, before_children, common_suffix, options)
          children = common_prefix +
                     before_children.map do |child|
                       child = Node.SPAN(child) if child.kind_of?(Nokogiri::XML::Text)
                       becomes_removed(child)
                     end +
                     node_children.map do |child|
                       child = Node.SPAN(child) if child.kind_of?(Nokogiri::XML::Text)
                       becomes_added(child)
                     end +
                     common_suffix

          children = Nokogiri::XML::NodeSet.new(node.document, children)

          children = Transformer.transform_nodes(:after_diff, children, options)

          replace_children( node, children)
        end

        # fast
        def text_diff(node, common_prefix, node_child, before_child, common_suffix, options)

          node.children = Nokogiri::XML::NodeSet.new(node.document, common_prefix)

          node = ProseDiff::LCS.fold_diff(
            WORD_DIFFER,
            ProseDiff::Node::WordSplitting.split_by_word(node_child.inner_text),
            ProseDiff::Node::WordSplitting.split_by_word(before_child.inner_text),
            node
          ) do |acc, after, before|

            if before.nil?
              acc << ProseDiff::Node.becomes_added( Nokogiri::XML::Node.new('span', node.document).tap { |s| s << after } )

            elsif after.nil?
              acc << ProseDiff::Node.becomes_removed( Nokogiri::XML::Node.new('span', node.document).tap { |s| s << before } )

            elsif after == before
              acc << after

            else
              after = Nokogiri::XML::Node.new('span', node.document).tap { |s| s << after }
              after[Node::BEFORE_TEXT] = before
              becomes_changed( after )
              acc << after

            end

          end

          children = node.children.to_a + common_suffix

          children = Nokogiri::XML::NodeSet.new(node.document, children)

          children = Transformer.transform_nodes(:after_diff, children, options)

          children = if children.length > 1
                       unsplit_all(children.first, children[1..-1])
                     else
                       children
                     end

          replace_children( node, children)
        end

        # slow :-()
        def children_diff(node, common_prefix, node_children, before_children, common_suffix, options)

          node_children   = fast_split_children node_children
          before_children = fast_split_children before_children

          node.children = Nokogiri::XML::NodeSet.new(node.document, common_prefix)

          node = ProseDiff::LCS.fold_diff(
            WORD_DIFFER,
            node_children,
            before_children,
            node
          ) do |acc, after, before|

            if before.nil?
              acc << ProseDiff::Node.becomes_added( Node.PARENT(after, node.document) )

            elsif after.nil?
              acc << ProseDiff::Node.becomes_removed( Node.PARENT(before, node.document))

            elsif after == before
              acc << after

            else
              after  = Node.PARENT(after, node.document)
              before = Node.PARENT(before, node.document)
              Node.diff_with_before(after, before, options)
              acc << after

            end
          end

          children = node.children.to_a + common_suffix

          children = Nokogiri::XML::NodeSet.new(node.document, children)

          children = Transformer.transform_nodes(:after_diff, children, options)

          children = if children.length > 1
                       unsplit_all(children.first, children[1..-1])
                     else
                       children
                     end

          replace_children( node, children)

        end

        def fast_split_children(children)
          children.map do |child|
            if child.kind_of?(Nokogiri::XML::Text)
              ProseDiff::Node::WordSplitting.split_by_word(child.inner_text)
            # TODO: optimize case where the child is a simple text container
            else
              ProseDiff::Node.split(child)
            end
          end.flatten
        end

        def strip_prefixes(outer_prefix, node_children, before_children, outer_suffix)

          node_first, before_first = node_children.first, before_children.first

          if node_first.kind_of?(Nokogiri::XML::Text) && before_first.kind_of?(Nokogiri::XML::Text)

            node_rest, before_rest = node_children[1..-1], before_children[1..-1]

            a, b = Node.to_text_string(node_first), Node.to_text_string(before_first)
            prefix_index = 0
            split_index = nil

            while a[prefix_index] && b[prefix_index] && a[prefix_index] == b[prefix_index]
              split_index = prefix_index if /\s/.match(a[prefix_index])
              prefix_index += 1
            end
            split_index = prefix_index if (a[prefix_index].nil? && /\s/.match(b[prefix_index])) || (b[prefix_index].nil? && /\s/.match(a[prefix_index]))

            if split_index
              inner_prefix = [ Node.TEXT(a[0..split_index] || a, node_first.document) ]
              if (a = a[(split_index + 1)..-1]) && a != ''
                node_children[0] = Node.TEXT(a, node_first.document)
              else
                node_children.shift
              end
              if (b = b[(split_index + 1)..-1]) && b != ''
                before_children[0] = Node.TEXT(b, node_first.document)
              else
                before_children.shift
              end
            else
              inner_prefix = []
            end

          else

            inner_prefix = []

          end

          node_last, before_last = node_children.last, before_children.last

          if node_last.kind_of?(Nokogiri::XML::Text) && before_last.kind_of?(Nokogiri::XML::Text)

            a, b = Node.to_text_string(node_last), Node.to_text_string(before_last)
            suffix_index = -1
            split_index = nil

            while a[suffix_index] && b[suffix_index] && a[suffix_index] == b[suffix_index]
              split_index = suffix_index if /\s/.match(a[suffix_index])
              suffix_index -= 1
            end
            split_index = suffix_index if (a[suffix_index].nil? && /\s/.match(b[suffix_index])) || (b[suffix_index].nil? && /\s/.match(a[suffix_index]))

            if split_index
              inner_suffix = [ Node.TEXT(a[split_index..-1] || a, node_first.document) ]
              if (a = a[0..(split_index - 1)]) && a != ''
                node_children[-1] = Node.TEXT(a, node_first.document)
              else
                node_children.pop
              end
              if (b = b[0..(split_index - 1)]) && b != ''
                before_children[-1] = Node.TEXT(b, node_first.document)
              else
                before_children.pop
              end
            else
              inner_suffix = []
            end

          else

            inner_suffix = []

          end
          while node_children.first && before_children.first && Node.digested(node_children.first) == Node.digested(before_children.first)
            inner_prefix = inner_prefix.push node_children.first
            node_children = node_children[1..-1]
            before_children = before_children[1..-1]
          end
          while node_children.last && before_children.last && Node.digested(node_children.last) == Node.digested(before_children.last)
            inner_suffix = inner_suffix.unshift node_children.last
            node_children = node_children[0..-2]
            before_children = before_children[0..-2]
          end
          outer_prefix = outer_prefix + inner_prefix
          outer_suffix = inner_suffix + outer_suffix
          if inner_prefix.empty? && inner_suffix.empty?
            return outer_prefix, node_children, before_children, outer_suffix
          else
            return strip_prefixes(outer_prefix, node_children, before_children, outer_suffix)
          end
        end

        def is_a_simple_text_container?(node)
          node.children.length == 1 && node.children.first.kind_of?(Nokogiri::XML::Text)
        end

        module_function :is_a_simple_text_container?

      end
    end
  end
end