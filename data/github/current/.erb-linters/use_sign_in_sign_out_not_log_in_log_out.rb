# typed: true
# frozen_string_literal: true
require_relative "custom_rule_helpers"

module ERBLint
  module Linters
    class UseSignInSignOutNotLogInLogOut < Linter
      include LinterRegistry
      include ERBLint::Linters::CustomRuleHelpers

      INVALID_STRING_REGEX = /(\blog in\b)|(\blog out\b)/
      MESSAGE = "Use sign in, sign out not log in, log out"

      def run(processed_source)
        lines = processed_source.file_content.split("\n", -1)
        document_pos = 0
        lines.each do |line|
          if INVALID_STRING_REGEX.match?(line.downcase)
            add_offense(
              processed_source.to_source_range(document_pos...(document_pos)),
              MESSAGE
            )
          end
          document_pos += line.length + 1
        end
      end
    end
  end
end
