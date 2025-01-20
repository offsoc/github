# frozen_string_literal: true

module Codeowners
  module Matcher
    class PathTree
      attr_reader :rules

      def initialize(rules, owner_resolver)
        @rules = rules
        @owner_resolver = owner_resolver
      end

      def match(*paths)
        result = Result.new(@owner_resolver)
        return result if paths.empty?

        tree = Tree.new
        paths.flatten.each do |path|
          tree.insert(path)
        end

        rules.each do |rule|
          matched_paths = tree.match(rule.pattern.to_s)

          matched_paths.each do |path|
            next if result[path]
            result[path] = rule
          end
        end

        result
      end
    end
  end
end
