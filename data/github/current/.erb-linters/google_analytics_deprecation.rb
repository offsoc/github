# typed: true
# frozen_string_literal: true
require_relative "custom_rule_helpers"

module ERBLint
  module Linters
    class GoogleAnalyticsDeprecation < Linter
      include LinterRegistry
      include ERBLint::Linters::CustomRuleHelpers

      GA_ATTRIBUTE_PATTERNS = [
        /\bdata-field\b/,
        /\bdata-ga\b/,
      ].freeze

      GA_CLASSES = [
        "js-octo-ga-id-input",
        "js-signup-source",
        "js-enterprise-trial-ga-id",
      ].freeze

      GA_RUBY_PATTERN = /(\bdata_|\b)ga_\w+\b/.freeze

      MESSAGE = <<~MESSAGE
        It looks like you added a new line that references our legacy Google
        Analytics implementation. Google Analytics is now deprecated.

        If you'd like to add GA-style events tracking, you may want to add a generic
        analytics event see this doc for more details:

        https://thehub.github.com/engineering/products-and-services/dotcom/generic-analytics-events/

        Happy migrating! ✨
      MESSAGE

      def run(processed_source)
        tags(processed_source).each do |tag|
          next if tag.closing?

          GA_CLASSES.each do |ga_class|
            record_offense(processed_source, tag) if has_class(tag, ga_class)
          end

          GA_ATTRIBUTE_PATTERNS.each do |pattern|
            has_match = tag.attributes.each.any? { |attr| attr.name&.match?(pattern) }
            record_offense(processed_source, tag) if has_match
          end
        end

        erb_nodes(processed_source).each do |node|
          code = extract_ruby_from_erb_node(node)

          record_offense(processed_source, node) if code.match?(GA_RUBY_PATTERN)
        end

        is_counter_correct?(processed_source)
      end

      private

      def erb_nodes(processed_source)
        processed_source.parser.ast.descendants(:erb)
      end

      def extract_ruby_from_erb_node(erb_node)
        return unless erb_node.type == :erb

        _, _, code_node = *erb_node

        code_node.loc.source.strip
      end

      def record_offense(processed_source, node)
        offense = [MESSAGE, node.loc.source].join("\n")

        add_offense(processed_source.to_source_range(node.loc), offense)
      end
    end
  end
end
