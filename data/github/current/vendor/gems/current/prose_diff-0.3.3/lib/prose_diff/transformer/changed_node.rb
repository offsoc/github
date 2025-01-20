module ProseDiff

  module Transformer

    class ChangedNode < Base

      def transform_node(after)

        if ProseDiff::Node.was_changed?(after) || ProseDiff::Node.was_added?(after) || ProseDiff::Node.was_removed?(after)
          # do nothing
        elsif after.children.any? do |child|
              %w{ins del}.include?(child.name.downcase) ||
              ProseDiff::Node.was_changed?(child) ||
              ProseDiff::Node.was_added?(child) ||
              ProseDiff::Node.was_removed?(child)
            end
          ProseDiff::Node.becomes_changed(after)
        end

      end
    end
  end
end