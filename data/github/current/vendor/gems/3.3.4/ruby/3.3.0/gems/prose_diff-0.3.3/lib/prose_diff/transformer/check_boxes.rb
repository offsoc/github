module ProseDiff
  module Transformer

    # run after wrap!
    class CheckBoxes < Base

      def transform_document(document)
        document.css('li,ins,del').each do |task_list_item|
          children = task_list_item.children.reduce([]) do |acc, child|
            acc << child
            if child.name == 'input' && child['type'] == 'checkbox'
              acc << Nokogiri::XML::Node.new('label', task_list_item.document)
            end
            acc
          end
          task_list_item.children = Nokogiri::XML::NodeSet.new(task_list_item.document, children)
        end
      end
    end
  end
end
