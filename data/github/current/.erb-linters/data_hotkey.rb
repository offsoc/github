# typed: true
# frozen_string_literal: true
require_relative "custom_rule_helpers"

module ERBLint
  module Linters
    class DataHotkey < Linter
      include LinterRegistry
      include ERBLint::Linters::CustomRuleHelpers

      ATTRIBUTE = "data-hotkey"

      MESSAGE = """Please use the `hotkeys_for` helper with data-hotkey https://thehub.github.com/engineering/development-and-ops/frontend-and-ui/keyboard-shortcuts""".freeze


      def run(processed_source)
        attributes(processed_source, ATTRIBUTE) do |hotkey|
          code = extract_erb_ruby_node(hotkey.value_node)
          next if code&.method_name == :hotkeys_for

          generate_offense(self.class, processed_source, hotkey)
        end
      end

    end
  end
end
