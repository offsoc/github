# typed: true
# frozen_string_literal: true
require "json"
require_relative "custom_rule_helpers"
require_relative "component_helpers"

module ERBLint
  module Linters
    # This linter checks for hardcoded strings in HTML tags (though some are ignored. See NON_TEXT_TAGS below.)
    # This is useful for finding strings that should be translated.
    # Much code is lifted from https://github.com/Shopify/erb-lint/blob/main/lib/erb_lint/linters/hard_coded_string.rb
    # If autocorrecting is enabled, this linter will
    # - add a counter at the top of the file with the total number of violations
    # TODO
    # - attempts to wrap strings with no special characters
    # - attempts to wrap strings with interpolation
    # - detects attributes that should be translated (e.g. aria-label)
    class I18nHardcodedStringCounter < Linter
      include LinterRegistry
      include ERBLint::Linters::CustomRuleHelpers
      include ERBLint::Linters::ComponentHelpers

      NON_TEXT_TAGS = Set.new(%w[script style xmp iframe noembed noframes listing])
      NON_TEXT_CHARS = Set.new([
        "&nbsp;",
        "&amp;",
        "&lt;",
        "&gt;",
        "&quot;",
        "&copy;",
        "&reg;",
        "&trade;",
        "&hellip;",
        "&mdash;",
        "&bull;",
        "&ldquo;",
        "&rdquo;",
        "&lsquo;",
        "&rsquo;",
        "&larr;",
        "&rarr;",
        "&darr;",
        "&uarr;",
        "&ensp;",
        "&emsp;",
        "&thinsp;",
        "&times;",
      ])

      class ConfigSchema < LinterConfig
        property :ignore_tags, accepts: array_of?(String), default: -> { NON_TEXT_TAGS.to_a }
        property :ignore_characters, accepts: array_of?(String), default: -> { NON_TEXT_CHARS.to_a }
        property :ignore_files, accepts: array_of?(String), default: -> { [] }
      end
      self.config_schema = ConfigSchema

      def run(processed_source)
        path = processed_source.filename

        return if path_matches(path, @config.ignore_files)

        offenses = hardcoded_strings(processed_source)
        offenses.compact.each do |text_node, string|
          parent_tag = node_parent_tag(processed_source, text_node)
          msg = "#{self.class}:#{parent_tag&.name || 'unknown'}\n#{string.strip}"
          add_offense(
            processed_source.to_source_range(text_node.loc),
            msg
          )
        end

        is_counter_correct?(processed_source)
      end

      def hardcoded_strings(processed_source)
        text_nodes(processed_source).each_with_object([]) do |text_node, offenses|
          next if should_ignore?(processed_source, text_node)
          text_node.to_a.select { |n| should_include?(n) }.each do |potential_offense|
            offenses << [text_node, potential_offense] if should_translate?(potential_offense)
          end
        end
      end

      def autocorrect(processed_source, offense)
        return unless offense.context

        lambda do |corrector|
          if processed_source.file_content.include?("erblint:counter I18nHardcodedStringCounter")
            # update the counter if exists
            corrector.replace(offense.source_range, offense.context)
          else
            # add comment with counter if none
            corrector.insert_before(processed_source.source_buffer.source_range, "#{offense.context}\n")
          end
        end
      end

      def text_nodes(processed_source)
        processed_source.parser.ast.descendants(:text)
      end

      def node_parent_tag(processed_source, text_node)
        ast = processed_source.parser.ast.to_a
        index = ast.find_index(text_node)

        parent_node = ast[index - 1]

        if parent_node.type == :tag
          BetterHtml::Tree::Tag.from_node(parent_node)
        end
      end

      def should_ignore?(processed_source, text_node)
        parent_tag = node_parent_tag(processed_source, text_node)

        if parent_tag
          NON_TEXT_TAGS.include?(parent_tag.name) && !parent_tag.closing?
        end
      end

      def should_include?(inner_node)
        if inner_node.is_a?(String)
          inner_node.strip.empty? ? false : inner_node
        else
          false
        end
      end

      def should_translate?(str)
        string = str.gsub(/\s*/, "")

        # since there are probably lots of strings with special characters
        # interspersed, it might be worth calling out a manual fix here
        string.length > 1 && !NON_TEXT_CHARS.include?(string)
      end

      def path_matches(path, globs)
        globs.any? { |glob| File.fnmatch("#{Dir.pwd}/#{glob}", path) }
      end
    end
  end
end
