module ProseDiff
  class Node
    module Proxy
      class Ol

        include LevenshteinDistanceBehaviour, CanOnlyCorrespondToTheSameTagBehaviour, ListBehaviour, BaseBehaviour

        def diff_children(node, before, options)

          node_children, before_children = numbered_children_of(node), numbered_children_of(before)

          children = ProseDiff::Diff.diff_node_set(node_children, before_children, options)

          node.children = Nokogiri::XML::NodeSet.new node.document, children

          node

        end
        
        def children_of(node)
          numbered_children_of(node)
        end

        private

        def numbered_children_of(ol)
          counter = ol['start']
          if counter.nil?
            counter = 1
          else
            counter = counter.to_i
          end
          numbered_children = ol.css('> li')
          numbered_children.each do |li|
            if li['value'].nil?
              li['value'] = counter
            else
              counter = li['value'].to_i
            end
            counter += 1
          end
          numbered_children
        end

      end
    end
  end
end
