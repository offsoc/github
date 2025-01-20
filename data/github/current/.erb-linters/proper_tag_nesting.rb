# typed: true
# frozen_string_literal: true
require_relative "custom_rule_helpers"

module ERBLint
  module Linters
    class ProperTagNesting < Linter
      include LinterRegistry
      include ERBLint::Linters::CustomRuleHelpers

      SELF_CLOSING_TAGS = %w(!doctype area base br col embed hr img input link meta param source track wbr)
      IGNORE_TAGS = %w(svg)

      def run(processed_source)
        stack = T.let([], T::Array[String])

        tags(processed_source).each do |tag|
          match = tag.name.match(/\A([-\w]+)/)
          tag_name = match ? match[0] : tag.name

          if IGNORE_TAGS.include?(tag_name)
            if tag.closing?
              stack.pop
            else
              stack.push(tag_name)
            end
          elsif stack.last && IGNORE_TAGS.include?(stack.last)
            # do nothing
          elsif tag.closing?
            if SELF_CLOSING_TAGS.include?(tag_name)
              generate_offense(self.class, processed_source, tag, "Void elements should be written as <#{tag_name}>")
              stack.pop
            elsif stack.size == 0
              generate_offense(self.class, processed_source, tag, "Orphaned </#{tag_name}> has no matching <#{tag_name}>")
            else
              if stack.last == tag_name
                stack.pop
              else
                message = "Expected </#{stack.last}>, but found </#{tag_name}> (stack: #{stack.join(' > ')})"
                generate_offense(self.class, processed_source, tag, message)
              end
            end
          else
            unless SELF_CLOSING_TAGS.include?(tag_name)
              stack.push(tag_name)
            end
          end
        end
      end
    end
  end
end
