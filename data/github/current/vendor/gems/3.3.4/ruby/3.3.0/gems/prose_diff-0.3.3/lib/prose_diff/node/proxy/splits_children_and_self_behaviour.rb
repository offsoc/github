module ProseDiff
  class Node

    module Proxy

      module SplitsChildrenAndSelfBehaviour

        def split(node)

          split_kidz = node.children.reduce([]) do |acc, child|
            grandchildren = Node.split(child)
            new_siblings = grandchildren.map do |sibling|
              node.dup.tap do |container|
                container.children = sibling.dup
              end
            end
            acc.concat(new_siblings)
          end.flatten

          if split_kidz.size < 2
            ProseDiff::Node.NodeSet(node)
          else
            ProseDiff::Node.NodeSet(split_kidz)
          end
        end

        def unsplit(node, other_node)

          if node.name == other_node.name && analysis(node) == analysis(other_node)
            if node.children.empty?
              Nokogiri::XML::NodeSet.new(node.document, [other_node])
            elsif other_node.children.empty?
              Nokogiri::XML::NodeSet.new(node.document, [node])
            else
              x, y = node.children[0..-2], ProseDiff::Node.unsplit_all(node.children.last, other_node.children)
              Nokogiri::XML::NodeSet.new(node.document, [
                ProseDiff::Node.replace_children(
                  node.dup,
                  Nokogiri::XML::NodeSet.new(node.document, x + y)
                )
              ])
            end
          else
            super(node, other_node)
          end

        end

        module_function :unsplit

      end
    end
  end
end
