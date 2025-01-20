# typed: true
# frozen_string_literal: true

require_relative "custom_rule_helpers"

module ERBLint
  module Linters
    class BooleanAttributes < Linter
      include LinterRegistry
      include ERBLint::Linters::CustomRuleHelpers

      BOOLEANS = %w[
        autofocus
        checked
        disabled
        hidden
        open
        readonly
        required
        allowfullscreen
        multiple
        selected
        formNoValidate
        async
        defer
      ]

      def run(processed_source)
        tags(processed_source).each do |tag|
          next if tag.closing?
          BOOLEANS.each do |name|
            if attr = tag.attributes[name]
              unless attr.value_node.nil?
                message = "Boolean `#{name}` attribute should not have a value assigned."
                generate_offense(self.class, processed_source, tag, message)
              end
            end
          end
        end
      end
    end
  end
end
