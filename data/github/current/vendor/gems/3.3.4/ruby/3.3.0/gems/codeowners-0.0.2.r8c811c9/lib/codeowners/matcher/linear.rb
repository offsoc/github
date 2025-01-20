# frozen_string_literal: true

module Codeowners
  module Matcher
    class Linear
      attr_reader :rules

      def initialize(rules, owner_resolver)
        @rules = rules
        @owner_resolver = owner_resolver
      end

      def match(*paths)
        paths.flatten.each_with_object(Result.new(@owner_resolver)) do |path, result|
          next unless match = rules.find { |r| r.pattern.match?(path) }

          result[path] = match
        end
      end
    end
  end
end
