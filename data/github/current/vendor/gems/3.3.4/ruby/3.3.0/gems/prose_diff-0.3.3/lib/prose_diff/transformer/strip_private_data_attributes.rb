module ProseDiff

  module Transformer

    class StripPrivateDataAttributes < Base

      def default_options
        {
          only: []
        }
      end

      def transform_document(document)
        node_names = Transformer.computed_list(options)
        if !node_names.empty?
          query = Transformer.where_name_is *node_names
          document.xpath(query).each do |node|
            unnatural_keys = node.keys.select { |k| k.match(ProseDiff::Node::RE) && k != "data-github-wrapped-text" }
            # puts unnatural_keys.inspect
            unnatural_keys.each do |key|
              node.remove_attribute(key)
            end
          end
        end
      end
    end
  end
end
