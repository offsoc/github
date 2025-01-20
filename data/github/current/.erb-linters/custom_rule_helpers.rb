# typed: true
# frozen_string_literal: true
require "json"
require "openssl"
require "sorbet-runtime"

module ERBLint
  module Linters
    module CustomRuleHelpers
      extend T::Sig
      extend T::Helpers
      requires_ancestor { Object }
      requires_ancestor { ERBLint::Linter }

      CWD_PREFIX = "#{Dir.pwd}/"

      sig { overridable.params(processed_source: ERBLint::ProcessedSource).void }
      def is_counter_correct?(processed_source)
        comment_node = T.let(nil, T.nilable(Parser::AST::Node))
        expected_count = T.let(0, Integer)
        rule_name = (self.class.name&.match(/:?:?(\w+)\Z/) || [])[1]
        offenses_count = @offenses.length

        processed_source.parser.ast.descendants(:erb).each do |node|
          indicator_node, _, code_node, _ = *node
          indicator = indicator_node&.loc&.source
          comment = code_node&.loc&.source&.strip

          if indicator == "#" && comment.start_with?("erblint:count") && comment.match(rule_name)
            comment_node = node
            expected_count = comment.match(/\s(\d+)\s?$/)[1].to_i
          end
        end

        if offenses_count == 0
          # have to adjust to get `\n` so we delete the whole line
          add_offense(processed_source.to_source_range(comment_node.loc.adjust(end_pos: 1)), "Unused erblint:count comment for #{rule_name}", "") if comment_node
          return
        end

        first_offense = @offenses[0]

        if comment_node.nil?
          add_offense(processed_source.to_source_range(first_offense.source_range), "#{rule_name}: If you must, add <%# erblint:counter #{rule_name} #{offenses_count} %> to bypass this check.", "<%# erblint:counter #{rule_name} #{offenses_count} %>")
        else
          clear_offenses
          if expected_count != offenses_count
            add_offense(processed_source.to_source_range(comment_node.loc), "Incorrect erblint:counter number for #{rule_name}. Expected: #{expected_count}, actual: #{offenses_count}.", "<%#  erblint:counter #{rule_name} #{offenses_count} %>")
          end
        end
      end

      sig { overridable.params(klass: T.class_of(ERBLint::Linter), processed_source: ERBLint::ProcessedSource, tag: T.any(::BetterHtml::Tree::Tag, ::BetterHtml::Tree::Attribute), message: T.nilable(String), replacement: T.nilable(String)).void }
      def generate_offense(klass, processed_source, tag, message = nil, replacement = nil)
        message ||= klass.const_get(:MESSAGE)
        offense = ["#{klass.name}:#{message}", tag.node.loc.source].join("\n")
        add_offense(processed_source.to_source_range(tag.loc), offense, replacement)
      end

      def generate_node_offense(klass, processed_source, node, message = nil)
        message ||= klass.const_get(:MESSAGE)
        offense = ["#{klass.name}:#{message}", node.loc.source].join("\n")
        add_offense(processed_source.to_source_range(node.loc), offense)
      end

      def possible_attribute_values(tag, attr_name)
        value = tag.attributes[attr_name]&.value || nil
        basic_conditional_code_check(value || "") || [value].compact
      end

      # Map possible values from condition
      def basic_conditional_code_check(code)
        conditional_match = code.match(/["'](.+)["']\sif|unless\s.+/) || code.match(/.+\s?\s["'](.+)["']\s:\s["'](.+)["']/)
        [conditional_match[1], conditional_match[2]].compact if conditional_match
      end

      sig { overridable.params(processed_source: ERBLint::ProcessedSource).returns(T::Array[::BetterHtml::Tree::Tag]) }
      def tags(processed_source)
        processed_source.parser.nodes_with_type(:tag).map { |tag_node| BetterHtml::Tree::Tag.from_node(tag_node) }
      end

      def attributes(processed_source, key)
        tags(processed_source).filter_map do |tag|
          next if tag.closing?
          value = tag.attributes[key]
          yield value if value.present?
        end
      end

      # basically element.classList.has(token)
      def has_class(tag, token)
        tokens = tag.attributes["class"]&.value&.split(" ")
        (tokens && tokens.include?(token)) || false
      end

      def erb_nodes(processed_source)
        processed_source.parser.ast.descendants(:erb)
      end

      def extract_erb_ruby_node(node)
        erb_node = node.type == :erb ? node : node.descendants(:erb).first
        indicator_node, _, code_node = *erb_node
        return nil unless indicator_node.present? && code_node.present?
        return nil if indicator_node.loc.source == "#" # Skip comments
        code = code_node.loc.source.strip
        begin
          BetterHtml::TestHelper::RubyNode.parse(code)
        rescue BetterHtml::TestHelper::RubyNode::ParseError
          nil
        end
      end

      def extract_ruby_from_erb_node(erb_node)
        return unless erb_node.type == :erb

        _, _, code_node = *erb_node
        code_node.loc.source.strip
      end
    end
  end
end
