module ProseDiff

  module Transformer

    class Vicinity < Base

      def default_options
        {
          removed:   { only: ProseDiff::Node::TOPLEVEL, parented_by: %w{article section body}, with: 'vicinity' },
          added:     { only: ProseDiff::Node::TOPLEVEL, parented_by: %w{article section body}, with: 'vicinity'  },
          changed:   { only: ProseDiff::Node::TOPLEVEL, parented_by: %w{article section body}, with: 'vicinity'  },
          unchanged: { only: [], with: nil },
          widows_and_orphans: 'allowed'
        }
      end
      
      def isHeading(node)
        node && %w{h1 h2 h3 h4 h5 h6}.include?(node.name)
      end

      def transform_document(document)
        widows_and_orphans = option? "widows_and_orphans"
        ANALYSES.each do |analysis|
          options_for_this_analysis = options[analysis] || {}
          parented_by_for_this_analysis = options_for_this_analysis['parented_by'] || options_for_this_analysis[:parented_by]
          with_name_for_this_analysis = options_for_this_analysis['with'] || options_for_this_analysis[:with]
          node_names_for_this_analysis = Transformer.computed_list(options_for_this_analysis)
          if with_name_for_this_analysis && !node_names_for_this_analysis.empty?
            query_for_this_analysis = where_parented_by_and_analyses_are(parented_by_for_this_analysis, analysis, *node_names_for_this_analysis)
            if analysis == 'removed'
              query_for_this_analysis = query_for_this_analysis + '|' + where_parented_by_and_analyses_are(parented_by_for_this_analysis, nil, 'del')
            elsif analysis == 'added'
              query_for_this_analysis = query_for_this_analysis + '|' + where_parented_by_and_analyses_are(parented_by_for_this_analysis, nil, 'ins')
            end
            document.xpath(query_for_this_analysis).each do |node|
              # preceding elements in the vicinity
              neighbour = node
              begin
                neighbour = neighbour.previous
              end until neighbour.nil? || node_names_for_this_analysis.include?(neighbour.name)
              if neighbour
                add_class(neighbour, with_name_for_this_analysis)
                unless widows_and_orphans || isHeading(neighbour)
                  begin
                    neighbour = neighbour.previous
                  end until neighbour.nil? || node_names_for_this_analysis.include?(neighbour.name)
                  add_class(neighbour, with_name_for_this_analysis) if isHeading(neighbour)
                end
              end
              # successor elements in the vicinity
              neighbour = node
              begin
                neighbour = neighbour.next
                add_class(neighbour, with_name_for_this_analysis) if neighbour && node_names_for_this_analysis.include?(neighbour.name)
              end until neighbour.nil? || (node_names_for_this_analysis.include?(neighbour.name) && (widows_and_orphans || !isHeading(neighbour)))
              add_class(neighbour, with_name_for_this_analysis) if neighbour
            end
          end
        end
      end

      private

      def where_parented_by_and_analyses_are(parented_by, analyses, *names)
        parented_by = arrayize(parented_by)
        analyses = arrayize(analyses)
        attr_query = if analyses.nil? || analyses.empty?
                       ''
                     else
                       '[' + analyses.map { |analysis| %Q{@data-github-analysis='#{analysis}'} }.join(' or ') + ']'
                     end
        names = ['*'] if names.empty?
        parented_by.map { |parent_name| names.map { |it| %Q{//#{parent_name}/#{it}#{attr_query}} }.join('|') }.join('|')
      end

      def arrayize(str_or_arr)
        if str_or_arr.is_a?(String)
          str_or_arr.split(',').map(&:strip).map { |_| _.split(' ') }.flatten.compact
        else
          str_or_arr
        end
      end
    end
  end
end
