# frozen_string_literal: true

module Codeowners
  module Matcher
    class RuleGraph
      attr_reader :rules

      def initialize(rules, owner_resolver)
        @owner_resolver = owner_resolver
        @rules = rules
      end

      def match(*paths)
        graph = Matcher.build_graph(rules)

        paths.flatten.each_with_object(Result.new(@owner_resolver)) do |path, result|
          next unless match = graph.best_rule(path)

          result[path] = match
        end
      end
    end
  end
end
