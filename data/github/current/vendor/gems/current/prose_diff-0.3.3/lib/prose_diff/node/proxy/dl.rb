module ProseDiff
  class Node
    module Proxy
      class Dl

        include CanOnlyCorrespondToTheSameTagBehaviour, BaseBehaviour

        # TODO: valid should check whether all elements are

        def diff_children(node, before, options)

          node_chunks, before_chunks = chunk(node), chunk(before)

          children = ProseDiff::LCS.fold_diff(
            lambda { |a, b|
              LevenshteinDistanceBehaviour.is_comparable_text?(
                a.first.inner_text,
                b.first.inner_text
              ) || LevenshteinDistanceBehaviour.is_comparable_text?(
                a.map(&:inner_text).join,
                b.map(&:inner_text).join
              )
            },
            node_chunks,
            before_chunks,
            []
          ) do |out, after_chunk, before_chunk|
            if after_chunk.nil?
              out.concat before_chunk.map { |before_node| becomes_added(before_node) }.to_a
            elsif before_chunk.nil?
              out.concat after_chunk.map  { |after_node| becomes_removed(after_node) }.to_a
            else
              out.concat ProseDiff::Diff.diff_node_set(after_chunk, before_chunk, options).to_a
            end
          end

          node.children = Nokogiri::XML::NodeSet.new node.document, children

          node

        end

        # Two DLs are comparable if the text of their dts are comparable. dds don't count
        def have_comparable_text?(node, other_node)
          node_text = node.css('dt').to_a.map(&:inner_text).join
          other_node_text = other_node.css('dt').to_a.map(&:inner_text).join
          is_comparable_text?(node_text, other_node_text) || begin
            node_text = node.children.to_a.map(&:inner_text).join
            other_node_text = other_node.children.to_a.map(&:inner_text).join
            is_comparable_text?(node_text, other_node_text)
          end
        end

        private

        def chunk(node)
          children_a = node.children.to_a
          children_a.reduce([]) do |acc, child|
            if child.name == 'dt' || acc.empty?
              acc << [ child ]
            else
              acc.last << child
              acc
            end
          end
        end

      end
    end
  end
end
