# typed: true
# frozen_string_literal: true
require_relative "custom_rule_helpers"

module ERBLint
  module Linters
    class TooltipHasRequiredAttributes < Linter
      include LinterRegistry
      include ERBLint::Linters::CustomRuleHelpers

      VALID_TYPE_VALUES = ["description", "label"].freeze

      MESSAGE = " Also, consider using the `Primer::Alpha::Tooltip` view component instead."
      FOR_MESSAGE = "<tool-tip> must have `for` set to the unique ID of the element it is attached to. #{MESSAGE}"
      DATA_TYPE_MESSAGE = "<tool-tip> must have `data-type` set to 'label' or 'description' to create either an `aria-labelledby` or `aria-describedby` association. #{MESSAGE}"

      def run(processed_source)
        tags(processed_source).each do |tag|
          next if tag.closing? || tag.name != "tool-tip"

          generate_offense(self.class, processed_source, tag, FOR_MESSAGE) unless possible_attribute_values(tag, "for").join.present?
          generate_offense(self.class, processed_source, tag, DATA_TYPE_MESSAGE) unless VALID_TYPE_VALUES.include?(possible_attribute_values(tag, "data-type").join)
        end
      end
    end
  end
end
