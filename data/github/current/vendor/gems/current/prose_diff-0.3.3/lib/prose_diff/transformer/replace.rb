module ProseDiff

  module Transformer

    class Replace < Base

      def default_options
        {
          removed: { only: %w{span}, with: 'del' },
          added:   { only: %w{span}, with: 'ins' }
        }
      end

      def transform_document(document)
        ANALYSES.each do |analysis|
          options_for_this_analysis = options[analysis] || {}
          with_name_for_this_analysis = options_for_this_analysis['with'] || options_for_this_analysis[:with]
          node_names_for_this_analysis = Transformer.computed_list(options_for_this_analysis)

          if with_name_for_this_analysis && !node_names_for_this_analysis.empty?
            query_for_this_analysis = Transformer.where_analysis_is analysis, *node_names_for_this_analysis
            document.xpath(query_for_this_analysis).each do |node|
              node.name = with_name_for_this_analysis
            end
          end
        end
      end
    end
  end
end
