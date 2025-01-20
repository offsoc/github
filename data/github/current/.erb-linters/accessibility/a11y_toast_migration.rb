# typed: strict
# frozen_string_literal: true
require_relative "../custom_rule_helpers"

module ERBLint
  module Linters
    # Flag when the shared/toast partial is being used and recommend using the Primer Banner component.
    class A11yToastMigration < Linter
      extend T::Sig
      include LinterRegistry
      include ERBLint::Linters::CustomRuleHelpers

      MESSAGE = "The shared/toast partial is deprecated. "\
        "See https://primer.style/ui-patterns/notification-messaging for alternative patterns."
      TOAST_PARTIAL_PATTERN = /render partial: \"shared\/toast\"/

      sig { params(processed_source: ProcessedSource).void }
      def run(processed_source)
        processed_source.ast.descendants(:erb).each do |erb_node|
          _, _, code_node = *erb_node

          code = code_node.children&.first&.strip

          if code.match?(TOAST_PARTIAL_PATTERN)
            tag = BetterHtml::Tree::Tag.from_node(code_node)
            generate_offense(self.class, processed_source, tag, MESSAGE)
          end
        end
      end
    end
  end
end
