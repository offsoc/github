module ProseDiff

  module Transformer

    class Css < Base

      def default_options
        {
          removed:   { only: %w{div li tr td th ol ul}, with: 'removed' },
          added:     { only: %w{div li tr td th ol ul}, with: 'added' },
          changed:   { only: [], except: %w{p blockquote pre h1 h2 h3 h4 h5 h6 hr ol ul}, with: 'changed' },
          unchanged: { only: [], with: nil }
        }
      end

      def transform_document(document)
        ANALYSES.each do |analysis|
          options_for_this_analysis = options[analysis] || {}
          with_name_for_this_analysis = options_for_this_analysis['with'] || options_for_this_analysis[:with]
          node_names_for_this_analysis = Transformer.computed_list(options_for_this_analysis)
          query_for_this_analysis = Transformer.where_analysis_is(analysis, *node_names_for_this_analysis)
          if with_name_for_this_analysis && !node_names_for_this_analysis.empty?
            document.xpath(query_for_this_analysis).each do |node|
              add_class(node, with_name_for_this_analysis)
            end
          end
          all_analysis_query = Transformer.where_analysis_is(analysis)
          document.xpath(all_analysis_query).each do |node|
            node.remove_attribute('data-github-analysis')
          end
        end
      end
    end
  end
end
