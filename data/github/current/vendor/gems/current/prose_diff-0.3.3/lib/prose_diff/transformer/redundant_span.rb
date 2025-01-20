module ProseDiff

  module Transformer

    class RedundantSpan < Base

      def transform_node(node)

        node.css('span').select { |span| ProseDiff::Node.is_uncomplicated?(span) }.each do |uncomplicated_span|
          uncomplicated_span.replace(uncomplicated_span.children)
        end

      end
    end
  end
end
