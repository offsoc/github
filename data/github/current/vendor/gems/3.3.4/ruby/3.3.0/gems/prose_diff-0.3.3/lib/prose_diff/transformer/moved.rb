module ProseDiff

  module Transformer

    class Moved < Base

      # Only wired to top-level at this time.
      def transform_document(document)
        transform_children document.css('body, article')
      end

      def digest(node)
        Digest::MD5.hexdigest( node.name + ProseDiff::Transformer::WhitespaceAgnostic.clean(node.inner_html) )[0,7]
      end

      def transform_children(*elements)
        elements.map(&:to_a).flatten.each do |element|
          before_orphans, after_orphans = {}, {}
          element.children.each do |after|
            if ProseDiff::Node.was_added?(after)
              digest = (after[Node::DIGEST] ||= digest(after))
              if before = before_orphans[digest]
                add_class(after, 'moved')
                add_class(after, 'moved-down')
                add_class(before, 'moved')
                add_class(before, 'moved-down')
                before_orphans[digest] = nil
              else
                after_orphans[digest] = after
              end
            elsif ProseDiff::Node.was_removed?(after)
              before = after
              digest = (before[Node::DIGEST] ||= digest(before))
              if after = after_orphans[digest]
                add_class(after, 'moved')
                add_class(after, 'moved-up')
                add_class(before, 'moved')
                add_class(before, 'moved-up')
                after_orphans[digest] = nil
              else
                before_orphans[digest] = before
              end
            end
          end
          before_orphans.each do |digest, before|
            if orphan = after_orphans[digest]
              add_class(before, 'moved')
              add_class(orphan, 'moved')
            end
          end
        end
      end

    end
  end
end