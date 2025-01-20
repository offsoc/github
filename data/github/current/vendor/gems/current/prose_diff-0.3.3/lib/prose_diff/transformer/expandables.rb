module ProseDiff

  module Transformer

    class Expandables < Base

      def default_options
        {
          dont_collapse_clazzes: %w{vicinity added removed changed},
          dont_collapse_elements: %w{ins del},
          classes: %w{expandable unchanged},
          fully_operational: true
        }
      end

      # MUST follow vicinity
      def transform_document(document)
        fully_operational = (options[:fully_operational] || options['fully_operational']) || 'false'
        class_string = options['classes'].join(' ')
        return unless ['true', 'yes', '1'].include?(fully_operational.to_s)
        excluded_clazzes = options[:dont_collapse_clazzes] || options['dont_collapse_clazzes']
        excluded_elements = options[:dont_collapse_elements] || options['dont_collapse_elements']
        parents = document.css('section')
        parents = document.css('article') if parents.empty?
        parents = document.css('body') if parents.empty?
        parents.each do |parent|
          blocklist = parent.children.to_a
          currentFoldables = Nokogiri::XML::NodeSet.new(parent.document, [])
          updated_blocks = []
          while firstBlock = blocklist.shift
            clazzes = (firstBlock['class'] || '').split(' ')
            if excluded_elements.include?(firstBlock.name) || clazzes.any? { |clazz| excluded_clazzes.include?(clazz) }
              if !currentFoldables.empty?
                div = Nokogiri::XML::Node.new('div', firstBlock.document)
                div['class'] = class_string
                div << currentFoldables
                updated_blocks.push div
                currentFoldables = Nokogiri::XML::NodeSet.new(parent.document, [])
              end
              updated_blocks.push firstBlock
            else
              currentFoldables.push(firstBlock)
            end
          end
          if !currentFoldables.empty?
            div = Nokogiri::XML::Node.new('div', parent.document)
            div['class'] = "expandable unchanged"
            div << currentFoldables
            updated_blocks.push div
            currentFoldables = nil
          end
          Node.replace_children(parent, updated_blocks)
        end
      end

    end
  end
end
