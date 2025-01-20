module ProseDiff

  module Transformer

    class SimpleTextDiff < Base

      def transform_nodes(nodes)

        nodes.reduce([]) do |acc, after|

          if ProseDiff::Node.is_a_simple_text_container?(after)

            after_text, before_text = after.text, Node.before_text(after)

            if before_text && after_text != before_text

              prefix, del_text, ins_text, suffix = *LCS.smallest_contiguous_change(before_text, after_text)

              Node.replace_children(after,
                [].tap do |result|
                  result.push(  Node.TEXT(prefix) ) if prefix && prefix != ''
                  if del_text && del_text != ''
                    result.push( ProseDiff::Node.becomes_removed(Node.SPAN(del_text)) )
                  end
                  if ins_text && ins_text != ''
                    result.push( ProseDiff::Node.becomes_added(Node.SPAN(ins_text)) )
                  end
                  result.push( Node.TEXT(suffix) ) if suffix && suffix != ''
                end
              )

            end

            acc << after

          else
            acc << after
          end

        end

      end
    end
  end
end