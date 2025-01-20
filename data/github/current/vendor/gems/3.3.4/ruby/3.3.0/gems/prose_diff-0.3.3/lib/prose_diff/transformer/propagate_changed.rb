module ProseDiff

  module Transformer

    class PropagateChanged < Base

      FIXED = lambda do |node|
        if ProseDiff::Node.was_unchanged?(node)
          node.children.each &FIXED
          if node.children.any? { |it| ProseDiff::Node.was_changed?(it) } || node.children.any? { |it| ProseDiff::Node.other_changed?(it) }
            ProseDiff::Node.becomes_changed(node)
          end
        end
      end

      def transform_document(document)
        document.at('//body').children.each(&FIXED)
      end
    end
  end
end