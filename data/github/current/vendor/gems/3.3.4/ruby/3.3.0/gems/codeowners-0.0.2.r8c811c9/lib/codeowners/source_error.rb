# frozen_string_literal: true

module Codeowners
  class SourceError
    def self.unknown_owner(owner:, source_location:, source:, suggestion: nil)
      SourceError.new(
        kind: "Unknown owner",
        line: source_location.line,
        column: source_location.column,
        end_column: source_location.column + owner.identifier.length - 1,
        source: source,
        suggestion: suggestion,
      )
    end

    attr_reader :kind, :line, :column, :end_column, :source, :suggestion

    def initialize(kind:, line:, column:, source:, suggestion:, end_column: nil)
      @kind = kind
      @line = line
      @column = column
      @end_column = end_column
      @source = source || ""
      @suggestion = suggestion
    end

    def message
      padding = " " * (column - 1)
      formatted_suggestion = suggestion.nil? ? "" : " #{suggestion}"
      <<~MESSAGE.strip
        #{kind} on line #{line}:#{formatted_suggestion}

          #{source.rstrip}
          #{padding}^
      MESSAGE
    end
    alias to_s message
  end
end
