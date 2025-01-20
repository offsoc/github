# typed: true
# frozen_string_literal: true

module ERBLint
  module Linters
    class NoCurrentUserLogin < Linter
      include LinterRegistry
      include ERBLint::Linters::CustomRuleHelpers

      MESSAGE = "`current_user` should explicitly call `display_login`: `current_user.display_login`. In dotcom, there is no difference between `login` and `display_login`. Check out the docs for more details: https://github.com/github/proxima/blob/main/docs/tenancy/namespacing.md"

      def run(processed_source)
        processed_source.ast.descendants(:erb).each do |erb_node|
          _, _, code_node = *erb_node

          code = code_node.children&.first&.strip

          if code == "current_user"
            tag = BetterHtml::Tree::Tag.from_node(code_node)
            generate_offense(self.class, processed_source, tag)
          end
        end
      end

      def autocorrect(_processed_source, offense)
        lambda do |corrector|
          corrector.replace(offense.source_range, " current_user.display_login ")
        end
      end
    end
  end
end
