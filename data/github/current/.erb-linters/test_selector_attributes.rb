# typed: true
# frozen_string_literal: true

require_relative "custom_rule_helpers"

module ERBLint
  module Linters
    class TestSelectorAttributes < Linter
      include LinterRegistry
      include ERBLint::Linters::CustomRuleHelpers

      ATTRIBUTE_NAME = "data-test-selector"
      MESSAGE = "Please use the `test_selector` helper instead of hard-coding the `#{ATTRIBUTE_NAME}` attribute."

      def run(processed_source)
        tags(processed_source).each do |tag|
          if attr = tag.attributes[ATTRIBUTE_NAME]
            generate_offense(self.class, processed_source, tag)
          end
        end
      end
    end
  end
end
