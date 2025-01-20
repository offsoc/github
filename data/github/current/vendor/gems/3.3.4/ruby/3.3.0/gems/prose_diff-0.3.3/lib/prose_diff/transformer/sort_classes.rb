module ProseDiff

  module Transformer

    class SortClasses < Base

      def default_options
        {
          enable: 'false'
        }
      end

      def transform_document(document)

        unless options['enable'] == 'no' || options['enable'] == 'false'

          document.xpath("//*[@class!='']").each do |node|
            node['class'] = node['class'].split(' ').uniq.sort.join(' ')
          end

          document

        end

      end

    end
  end
end
