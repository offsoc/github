# encoding: utf-8

module ProseDiff
  class Node
    module Proxy
      class Pre

        include LevenshteinDistanceBehaviour, CanOnlyCorrespondToTheSameTagBehaviour, UnsplittableBehaviour, BaseBehaviour

        def appear_to_correspond?(node, other_node)
          return false unless valid_and_compatible?(node, other_node)

          corresponds = have_same_identification?(node, other_node)
          return corresponds unless corresponds.nil?

          is_comparable_text?(node, other_node)
        end

        SAME_TEXT = lambda { |x, y| x.inner_text == y.inner_text }

        HTML_TO_USE_REGEX = /\a(?<body>.+)\n(?<suffix><\/(ins|del)>)?\z/

        def diff_children(node, before, options)

          # FIXME: Special case for changing styles without any inner_text change in the entire <pre> block
          raise "do not diff a pre with anything except itself" unless before.name == 'pre'

          direct_parent_node, direct_parent_before = to_be_split(node), to_be_split(before)

          node_nodes  = split_children_helper(direct_parent_node)
          before_nodes = split_children_helper(direct_parent_before)

          html = ProseDiff::LCS.fold_diff(SAME_TEXT, node_nodes, before_nodes, '') do |acc, after, before|
            if after.nil?
              acc << "<del>#{before.inner_html}\n</del>"
            elsif before.nil?
              acc << "<ins>#{after.inner_html}\n</ins>"
            else
              acc << after.inner_html + "\n"
            end
            acc
          end

          matchdata = HTML_TO_USE_REGEX.match(html)

          if matchdata.nil?
            direct_parent_node.inner_html = html
          else
            direct_parent_node.inner_html = matchdata['body']  + (matchdata['suffix'] || '')
          end

          becomes_changed(node) # if has_changed = true

          node

        end

        private

        def to_be_split(node)
          if node.children.length == 1 && node.children.first.name == 'code'
            node.children.first
          else
            node
          end
        end

        def split_children_helper(node)
          node_html = node.inner_html
          lines = node_html.split(/\n/).map do |line_html|
            ProseDiff::Node.LINE(line_html, node.document)
          end
        end

      end
    end
  end
end
