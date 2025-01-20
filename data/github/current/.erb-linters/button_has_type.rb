# typed: true
# frozen_string_literal: true
require_relative "custom_rule_helpers"

module ERBLint
  module Linters
    class ButtonHasType < Linter
      include LinterRegistry
      include ERBLint::Linters::CustomRuleHelpers

      VALID_BUTTON_TYPES = %w(button submit reset)
      MESSAGE = "Buttons should have a valid type set. Use type=submit for form submission, otherwise use type=button."

      def run(processed_source)
        tags(processed_source).each do |tag|
          next if tag.name != "button"
          next if tag.closing?
          next if (possible_attribute_values(tag, "type") & VALID_BUTTON_TYPES).any?

          generate_offense(self.class, processed_source, tag)
        end
      end
    end
  end
end
