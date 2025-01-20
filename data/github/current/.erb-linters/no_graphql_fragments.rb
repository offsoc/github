# frozen_string_literal: true
# typed: true
require_relative "custom_rule_helpers"

module ERBLint
  module Linters
    class NoGraphqlFragments < Linter
      include LinterRegistry
      include ERBLint::Linters::CustomRuleHelpers

      MESSAGE = "<%graphql fragments should not be used in views."

      def run(processed_source)
        processed_source.ast.descendants(:erb).each do |erb_node|
          indicator, _, code_node = *erb_node

          next unless indicator.nil?

          code = code_node.children&.first&.split("\n")&.first
          if code == "graphql"
            tag = BetterHtml::Tree::Tag.from_node(code_node)
            generate_offense(self.class, processed_source, tag)
          end
        end
      end
    end
  end
end
