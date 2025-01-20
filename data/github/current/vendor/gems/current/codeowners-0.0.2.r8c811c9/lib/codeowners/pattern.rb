# frozen_string_literal: true
require "pathspec/gitignorespec"

module Codeowners
  class Pattern
    attr_reader :pattern

    def initialize(pattern)
      @pattern = pattern.to_s
    end

    def match?(path)
      unless defined?(@regex)
        spec = PathSpec::GitIgnoreSpec.new(@pattern)
        @regex = spec.instance_variable_get(:@regex)
      end

      @regex.match?(path) if @regex
    end

    def to_s
      pattern
    end
  end
end
