# typed: strict
# frozen_string_literal: true
require_relative "../custom_rule_helpers"
require_relative "../component_helpers"

module ERBLint
  module Linters
    class A11yDetailsDialogMigration < Linter
      extend T::Sig
      include LinterRegistry
      include ERBLint::Linters::CustomRuleHelpers
      include ERBLint::Linters::ComponentHelpers

      MESSAGE = "The <details-dialog> and associated components are deprecated. "\
        "Use the latest Primer Dialog from https://primer.style/components/dialog/rails/latest instead"
      GITHUB_DIALOG_PATTERN = T.let(/render[\s\(]GitHub::DialogComponent/.freeze, Regexp)

      sig { params(processed_source: ProcessedSource).void }
      def run(processed_source)
        erb_nodes(processed_source).each do |node|
          code = extract_ruby_from_erb_node(node)
          generate_node_offense(self.class, processed_source, node, MESSAGE) if code.match?(GITHUB_DIALOG_PATTERN)
        end

        tags(processed_source).each do |tag|
          next if tag.name != "details-dialog"
          next if tag.closing?
          generate_offense(self.class, processed_source, tag, MESSAGE)
        end

        components(processed_source) do |tag, _kwargs, _classes|
          if tag.node.loc.source.match?(/tag: :"details-dialog"/)
            generate_offense(
              self.class,
              processed_source,
              tag,
              MESSAGE
            )
          end
        end
      end
    end
  end
end
