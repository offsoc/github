# frozen_string_literal: true

require "set"

module Codeowners
  module Matcher
    class GraphVisualizer
      def self.write_dot(graph, file = $stdout)
        new(graph).write_dot(file)
      end

      def initialize(graph)
        @graph = graph
      end

      def write_dot(file = $stdout)
        file.puts "digraph {"

        all_nodes = walk_graph do |transition_from, transition_to, label, type|
          style = type == :free ? "dotted" : "solid"
          file.puts(
            "#{transition_from.object_id} -> #{transition_to.object_id} "\
            "[label = #{label.inspect}, style = #{style.inspect}]"
          )
        end

        all_nodes.each do |node|
          label = node_label(node)
          peripheries = node.rule ? 2 : 1
          file.puts(
            "#{node.object_id} "\
            "[label = #{label.inspect}, peripheries = #{peripheries}]"
          )
        end

        file.puts "}"
      end

      private

      def walk_graph
        nodes = Set[@graph.root]
        seen_nodes = Set.new

        while nodes.any?
          next_nodes = Set.new
          nodes.each do |node|
            seen_nodes << node

            node.transitions.each do |label, target|
              yield node, target, label, :regular
              next_nodes << target unless seen_nodes.include?(target)
            end
            node.free_transitions.each do |label, target|
              yield node, target, label, :free
              next_nodes << target unless seen_nodes.include?(target)
            end
          end
          nodes = next_nodes
        end

        seen_nodes
      end

      def node_label(node)
        if node == @graph.root
          "start"
        elsif node.rule
          node.rule.line
        else
          ""
        end
      end
    end
  end
end


if $0 == __FILE__
  require_relative "../../codeowners"

  # Print the graph of rules in a CODEOWNERS file in the graphviz dot format.
  # This can be piped through one of the graphviz commands to produce an image.
  #
  # Example usage:
  #
  #     cat CODEOWNERS \
  #       | ruby -Ilib lib/codeowners/matcher/graph_visualizer.rb \
  #       | dot -Tpng -o CODEOWNERS.png
  #
  # See the graphviz documentation for more options:
  #       https://graphviz.org/doc/info/command.html

  source = $stdin.read
  owners = Codeowners::File.new(source)
  graph = Codeowners::Matcher.build_graph(owners.rules)
  Codeowners::Matcher::GraphVisualizer.write_dot(graph, $stdout)
end
