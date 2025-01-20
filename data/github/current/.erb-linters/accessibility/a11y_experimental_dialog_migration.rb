# frozen_string_literal: true
require_relative "../custom_rule_helpers"

module ERBLint
  module Linters
    # Flag when `Primer::Experimental::Dialog` is being used and offer an alternative.
    class A11yExperimentalDialogMigration < Linter
      extend T::Sig
      include LinterRegistry
      include ERBLint::Linters::CustomRuleHelpers

      MIGRATE_FROM_EXPERIMENTAL_DIALOG = "Primer::Experimental::Dialog has been deprecated. Please instead use Primer::Alpha::Dialog" \
        " https://primer.style/design/components/dialog/rails/alpha"
      EXPERIMENTAL_DIALOG_RUBY_PATTERN = /Primer::Experimental::Dialog/.freeze

      def run(processed_source)
        erb_nodes(processed_source).each do |node|
          code = extract_ruby_from_erb_node(node)
          generate_node_offense(self.class, processed_source, node, MIGRATE_FROM_EXPERIMENTAL_DIALOG) if code.match?(EXPERIMENTAL_DIALOG_RUBY_PATTERN)
        end
      end
    end
  end
end
