module ProseDiff
  class Node

    module Proxy

      module SuperBlockBehaviour

        def appear_to_correspond?(node, other_node)
          other_node.name == node.name
        end

        def split_children(node)
          node.children.reject do |it|
            while it.kind_of?(Nokogiri::XML::Element) && it.children.length == 1
              it = it.children.first
            end
            y = it.kind_of?(Nokogiri::XML::Text) &&
              it.content.strip.empty?
            y
          end
        end

      end
    end
  end
end
