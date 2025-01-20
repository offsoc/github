# frozen_string_literal: true

require "set"

module Codeowners
  module Matcher
    class Graph
      attr_accessor :root

      def initialize(root = nil)
        @root = root
        @traverse_cache = {}
        @regexps = Hash.new do |hash, key|
          hash[key] = build_regexp(key)
        end
      end

      def clear_cache
        @traverse_cache.clear
      end

      def for(paths)
        paths.flatten.each_with_object({}) do |path, owner_to_rules|
          next unless match = best_rule(path)

          match.owners.each do |owner|
            (owner_to_rules[owner] ||= Set.new) << match
          end
        end
      end

      def best_rule(path)
        matching_rules(path).max_by(&:line)
      end

      def matching_rules(path)
        parts = path.split("/")
        traverse(parts).filter_map(&:rule)
      end

      def traverse(parts)
        if @traverse_cache.has_key?(parts)
          @traverse_cache[parts]
        elsif parts.empty?
          @root.reachable_by_free_transitions
        else
          prefix, last = parts[0..-2], parts[-1]
          prior_nodes = traverse(prefix)
          nodes = step(prior_nodes, last)

          @traverse_cache[parts] = nodes
          nodes
        end
      end

      def match?(pattern_fragment, path_fragment)
        path_fragment.match?(@regexps[pattern_fragment])
      end

      private

      def step(nodes, part)
        nodes = nodes.map { |s| s.follow_transitions(part) }.inject(:|) || Set.new
        nodes.map(&:reachable_by_free_transitions).inject(:|) || Set.new
      end

      def build_regexp(pattern)
        unescaped_pattern = pattern.gsub(/\\(.)/) { $1 }
        regexp_pattern = Regexp.escape(unescaped_pattern)
          .gsub(/\\\*(?:\\\*)?/, ".*")
          .gsub("\\?", ".")

        Regexp.new("\\A#{regexp_pattern}\\z")
      end
    end
  end
end
