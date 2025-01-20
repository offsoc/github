module ProseDiff

  module Transformer

    class Wrap < Base

      DONT_WRAP = ["article", "section", "div", "li", "br", "span", "text", "del", "ol", "ul", "li", "ins",
                   "caption", "thead", "tbody", "tr", "td", "th"]

      def default_options
        {
          removed: { only: [], except: DONT_WRAP, with: 'del', decorate: %w{input} },
          added:   { only: [], except: DONT_WRAP, with: 'ins', decorate: %w{input} },
          changed: { only: %w{p blockquote pre h1 h2 h3 h4 h5 h6 hr ol ul}, with: 'div' }
        }
      end

      def transform_document(document)
        ANALYSES.each do |analysis|
          options_for_this_analysis = options[analysis] || {}
          with_name_for_this_analysis = options_for_this_analysis['with'] || options_for_this_analysis[:with]
          node_names_for_this_analysis = Transformer.computed_list(options_for_this_analysis)
          names_to_decorate = (options_for_this_analysis['decorate'] || options_for_this_analysis[:decorate] || [])

          if with_name_for_this_analysis && !node_names_for_this_analysis.empty?
            query_for_this_analysis = Transformer.where_analysis_is analysis, *node_names_for_this_analysis
            document.xpath(query_for_this_analysis).each do |node|
              Nokogiri::XML::Node.new(with_name_for_this_analysis, document).tap do |wrapper|
                wrapper['data-github-analysis'] = node['data-github-analysis']
                if names_to_decorate.include?(node.name)
                  clazzes = (node['class'] || '').split(' ').map { |clazz| "wraps-#{clazz}" }
                  clazzes << "wraps-#{node.name}"
                  wrapper['class'] = clazzes.sort.join(" ")
                end
                node.replace(wrapper)
                wrapper << node
              end
            end
          end
        end
      end
    end
  end
end

