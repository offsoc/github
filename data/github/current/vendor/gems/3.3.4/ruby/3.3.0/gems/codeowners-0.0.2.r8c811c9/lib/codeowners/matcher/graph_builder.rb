# frozen_string_literal: true

require_relative "graph"
require_relative "node"

module Codeowners
  module Matcher
    class GraphBuilder
      def self.from_rules(rules)
        build do |graph|
          rules.reverse_each do |rule|
            graph.add_rule(rule)
          end
        end
      end

      def self.build
        builder = new
        yield builder
        builder.finalize
      end

      def initialize
        @root = Node.new
        @graph = Graph.new(@root)
        @root.graph = @graph
      end

      def add_rule(rule)
        normalized_pattern = normalize_pattern(rule.pattern.to_s)
        parts = normalized_pattern.split("/")

        final_nodes = parts.inject([@root]) do |current_nodes, part|
          add_transition(current_nodes, part)
        end

        matching_node = final_nodes.first
        matching_node.rule = rule

        # In most cases, a rule can match a directory and therefore match
        # anything nested under that directory. The one exception is a rule
        # ending in `/*`, which will only match a file at that specific level.
        #
        # We also exclude patterns ending in `/**` here, since they are already
        # explicitly open-ended.
        unless normalized_pattern.end_with?("/*", "/**")
          matching_node.add_unconditional_transition("open-ended-rule", matching_node)
        end

        self
      end

      def finalize
        @graph
      end

      private

      def normalize_pattern(pattern)
        if !pattern[0..-2].include?("/")
          pattern = "**/#{pattern}"
        elsif pattern.start_with?("/")
          pattern = pattern[1..-1]
        end

        if pattern.end_with?("/")
          "#{pattern}**"
        else
          pattern
        end
      end

      def add_transition(nodes, part)
        existing = nodes.each_with_object([]) do |node, acc|
          transition = node.transitions[part] and acc << transition
          free_transition = node.free_transitions[part] and acc << free_transition
        end


        if existing.any?
          existing
        else
          build_transition(nodes, part)
        end
      end

      def build_transition(nodes, part)
        target = Node.new(@graph)

        if part == "**"
          extra = Node.new(@graph)
          nodes.each do |node|
            node.add_unconditional_transition(part, target)
            node.add_free_transition(part, extra)
          end
          target.add_unconditional_transition(part, target)
          return [target, extra]
        elsif part == "*"
          nodes.each do |node|
            node.add_unconditional_transition(part, target)
          end
        elsif part.include?("*") || part.include?("?") || part.include?("\\")
          nodes.each do |node|
            node.add_fuzzy_transition(part, target)
          end
        else
          nodes.each do |node|
            node.add_literal_transition(part, target)
          end
        end

        [target]
      end
    end
  end
end
