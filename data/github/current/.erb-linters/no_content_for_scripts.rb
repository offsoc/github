# typed: true
# frozen_string_literal: true
require_relative "custom_rule_helpers"

module ERBLint
  module Linters
    class NoContentForScripts < Linter
      include LinterRegistry
      include ERBLint::Linters::CustomRuleHelpers

      MESSAGE = "`content_for :scripts` is deprecated. Use `javascript_bundle` in your controller instead."

      def run(processed_source)
        processed_source.ast.descendants(:erb).each do |erb_node|
          _, _, code_node = *erb_node
          code = code_node.children.first.strip.gsub(/ do$/, "")

          ruby_ast = RuboCop::AST::ProcessedSource.new(code, RUBY_VERSION.to_f).ast

          next if ruby_ast.blank?
          next unless ruby_ast.type == :send && ruby_ast.method_name == :content_for
          next unless ruby_ast.arguments.first.value == :scripts

          tag = BetterHtml::Tree::Tag.from_node(code_node)
          generate_offense(self.class, processed_source, tag)
        end
      end
    end
  end
end
