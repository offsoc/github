module ProseDiff

  module Transformer

    class ChangedClasses < Base

      DONT_WRAP = ["article", "section", "div", "li", "br", "span", "text", "del", "ol", "ul", "li", "ins",
                   "caption", "thead", "tbody", "tr", "td", "th"]

      def default_options
        {
          removed: { only: %w{li}, prefix: 'removed-' }
        }
      end

      def transform_document(document)
        options_for_removed = options['removed'] || options[:removed] || {}
        options_for_added = options['added'] || options[:added] || {}
        node_names_for_removed = Transformer.computed_list(options_for_removed)
        node_names_for_added = Transformer.computed_list(options_for_added)
        prefix_for_removed = options_for_removed['prefix'] || options_for_removed[:prefix] || 'removed-'
        prefix_for_added = options_for_added['prefix'] || options_for_added[:prefix] || 'added-'

        node_names = node_names_for_removed | node_names_for_added

        unless node_names.empty?
          document.xpath(query(*node_names)).each do |node|
            removed_clazzes = (node['data-github-removed-class'] || '').split(' ')
            if node_names_for_removed.include?(node.name) && !removed_clazzes.empty?
              clazzes = (node['class'] || '').split(' ')
              clazzes = clazzes + removed_clazzes.map { |clazz| prefix_for_removed + clazz }
              node['class'] = clazzes.sort.join(' ')
            end
            added_clazzes = (node['data-github-added-class'] || '').split(' ')
            if node_names_for_added.include?(node.name) && !added_clazzes.empty?
              clazzes = (node['class'] || '').split(' ')
              clazzes = clazzes + added_clazzes.map { |clazz| prefix_for_added + clazz }
              node['class'] = clazzes.sort.join(' ')
            end
          end
        end
      end

      def query(*names)
        names.map { |it| "//#{it}[@data-github-added-class != '' or @data-github-removed-class != '']" }.join('|')
      end
    end
  end
end

