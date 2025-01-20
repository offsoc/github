# typed: strict
# frozen_string_literal: true
require_relative "../custom_rule_helpers"

module ERBLint
  module Linters
    class A11yNoRogueRoleEqualsTooltip < Linter
      extend T::Sig
      include LinterRegistry
      include ERBLint::Linters::CustomRuleHelpers

      MESSAGE = "Never set `role='tooltip' and always use the Primer tooltip view component. "\
        "If you are getting axe errors or the `NoAriaLabelMisuse`linter error, setting "\
        "`role='tooltip'` may silence errors but DOES NOT address the core accessibility issue. "\
        "Learn more at: https://primer.style/design/accessibility/tooltip-alternatives."

      sig { params(processed_source: ProcessedSource).void }
      def run(processed_source)
        tags(processed_source).each do |tag|
          next if tag.closing?

          role = possible_attribute_values(tag, "role")
          next unless role.present? && role.join == "tooltip"

          generate_offense(self.class, processed_source, tag, MESSAGE)
        end
      end
    end
  end
end
