# typed: true
# frozen_string_literal: true
require_relative "custom_rule_helpers"

module ERBLint
  module Linters
    class DropdownDividerRole < Linter
      include LinterRegistry
      include ERBLint::Linters::CustomRuleHelpers

      DIVIDER_CLASS_NAME = "dropdown-divider"

      def run(processed_source)
        tags(processed_source).each do |tag|
          next if tag.closing?
          next if !has_class(tag, DIVIDER_CLASS_NAME)

          actual_role = tag.attributes["role"]&.value
          if actual_role != "none"
            message = "The '#{DIVIDER_CLASS_NAME}' class must have role=\"none\" so that it's not announced by screen readers."
            generate_offense(self.class, processed_source, tag, message)
          end
        end
      end
    end
  end
end
