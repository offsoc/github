# typed: true
# frozen_string_literal: true
require_relative "custom_rule_helpers"

module ERBLint
  module Linters
    class RequiredAttribute < Linter
      include LinterRegistry
      include ERBLint::Linters::CustomRuleHelpers

      def run(processed_source)
        tags(processed_source).each do |tag|
          next unless !tag.closing? &&
            tag.name == "input" &&
            tag.attributes["type"]&.value == "hidden" &&
            !tag.attributes["required"].nil?

          generate_offense \
            self.class,
            processed_source,
            tag,
            "[required] constraint is not valid on input[type=hidden]."
        end
      end
    end
  end
end
