# typed: true
# frozen_string_literal: true
require_relative "custom_rule_helpers"

module ERBLint
  module Linters
    # see: https://github.com/philipwalton/flexbugs#flexbug-9
    class FlexbugNumberNine < Linter
      include LinterRegistry
      include ERBLint::Linters::CustomRuleHelpers

      FLEXBUG_ELEMENTS = %w(summary fieldset)
      FLEX_CLASS = "d-flex"
      OTHER_FLEX_CLASSES = /\Aflex-(items|justify)-/

      def run(processed_source)
        tags(processed_source).each do |tag|
          next if tag.closing?
          next unless FLEXBUG_ELEMENTS.include?(tag.name)
          next unless has_class(tag, FLEX_CLASS)

          classes = [FLEX_CLASS] + tag.attributes["class"].value.split(" ").select { |klass| klass.match?(OTHER_FLEX_CLASSES) }
          message = "<#{tag.name}> with `display: flex` may behave strangely in some browsers. Please move the classes `#{classes.join('`, `')}` to a nested <div>"
          generate_offense(self.class, processed_source, tag, message)
        end
      end
    end
  end
end
