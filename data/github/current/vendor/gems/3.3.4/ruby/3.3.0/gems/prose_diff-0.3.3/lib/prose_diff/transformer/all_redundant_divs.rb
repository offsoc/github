module ProseDiff

  module Transformer

    class AllRedundantDivs < Base

      def transform_document(document)

        while (divs_to_replace = document.css('div').select { |div| ProseDiff::Node.is_uncomplicated?(div) }).length > 0

          divs_to_replace.each do |uncomplicated_div|
            uncomplicated_div.replace(uncomplicated_div.children)
          end

        end

      end
    end
  end
end
