# typed: strict
# frozen_string_literal: true
require_relative "../custom_rule_helpers"
require_relative "../component_helpers"
require "nokogiri"

module ERBLint
  module Linters
    # This rule aims to flag when a link in a text block is missing the `Link--inTextBlock` CSS class to ensure a user's accessibility setting is respected.
    # This rule is on the conservative side to minimize false positives. If you suspect a false positive, feel free to add a lint disable.
    # Given the limits of static analysis, it is impossible for this rule to flag every link that needs an underline.
    # This rule, in combination with the Axe rule `link-in-text-block`, should catch the majority of links that require an underline.
    # Read more about the purpose of this rule at: https://thehub.github.com/news/2023-10-18-a-more-readable-github.
    class A11yUnderlineLinksInTextBlock < Linter
      extend T::Sig
      include LinterRegistry
      include ERBLint::Linters::CustomRuleHelpers

      LINK_UNDERLINE_CLASS = T.let("Link--inTextBlock".freeze, String)
      ALTERNATE_UNDERLINE_CLASS = T.let("text-underline".freeze, String) # Alternatively used
      NO_UNDERLINE_CLASS = T.let("no-underline".freeze, String)
      BTN_CSS_CLASS = T.let("btn".freeze, String) # Button styling, so we should not flag
      TEXT_BOLD_CLASS = T.let("text-bold".freeze, String) # Low confidence to flag
      MKTG_CLASS = T.let("underlined-mktg".freeze, String) # Low confidence to flag

      MESSAGE = T.let("Links in a text block should have the '#{LINK_UNDERLINE_CLASS}' CSS class. "\
        "This rule won't catch all instances so make sure that all links in a text block in your file have the underline class."\
        "Learn more at https://thehub.github.com/news/2023-10-18-a-more-readable-github.", String)

      sig { params(processed_source: ProcessedSource).void }
      def run(processed_source)
        all_nodes = processed_source.parser.ast.to_a
        flagged_so_far = Set.new
        opening_anchor_node = T.let(nil, T.untyped)
        opening_anchor_node_index = T.let(nil, T.untyped)
        inside_heading = T.let(false, T::Boolean)
        inside_table = T.let(false, T::Boolean)
        inside_list = T.let(false, T::Boolean)
        all_nodes.each_with_index do |node, index|
          if node.type == :tag
            tag_node = BetterHtml::Tree::Tag.from_node(node)
            if tag_node.name.match?(/h1|h2|h3|h4|h5|h6/)
              inside_heading = !tag_node.closing?
            end
            if tag_node.name == "table"
              inside_table = !tag_node.closing?
            end
            if tag_node.name == "ul"
              inside_list = !tag_node.closing?
            end
            # Conservatively skip when inside of a heading, list, or table.
            next if inside_heading || inside_list || inside_table
            classes = tag_node.attributes["class"]&.value
            # Flag HTML anchor links
            raise_offense = T.let(false, T::Boolean)
            icon_is_nested = T.let(false, T::Boolean)
            if tag_node.name == "a"
              if tag_node.closing? && opening_anchor_node
                nodes_between_anchor = all_nodes[opening_anchor_node_index + 1..index - 1]
                icon_is_nested = contains_icon?(nodes_between_anchor)
                # Check content of previous, adjacent node.
                if opening_anchor_node_index.positive?
                  prev_node = all_nodes[opening_anchor_node_index - 1]
                  if text_node?(prev_node) && !skippable_text?(prev_node.loc.source) && !icon_is_nested
                    raise_offense = true
                  end
                end
                # Check content of next adjacent node.
                next_node = all_nodes[index + 1]
                if text_node?(next_node) && !skippable_text?(next_node.loc.source) && !icon_is_nested
                  if !raise_offense && next_node.loc.source.strip == "."
                    raise_offense = false
                  else
                    raise_offense = true
                  end
                end
                if raise_offense
                  generate_offense(self.class, processed_source, opening_anchor_node, MESSAGE)
                end
                opening_anchor_node = nil
                opening_anchor_node_index = nil
              elsif !tag_node.closing? && !skippable_classes?(tag_node)
                opening_anchor_node = tag_node
                opening_anchor_node_index = index
              end
            end
          end

          # Flag `link_to` and `Primer::Beta::Link`.
          if node.type == :text && node.descendants(:code).to_a.present?
            next if inside_heading || inside_list || inside_table
            already_flagged = T.let(false, T::Boolean)
            # Filter out newline strings and comment nodes which add noise.
            filtered = node.children.select do |child_node|
              is_string = child_node.is_a?(String) && child_node.strip.empty?
              !(is_string || comment_node?(child_node))
            end
            do_count = 0
            inside_slot_heading = T.let(false, T::Boolean)
            filtered.each_with_index do |child_node, child_index|
              unless child_node.is_a?(String)
                child_source = child_node.loc.source
                ruby_ast = extract_erb_ruby_node(child_node)
                if child_source.match?(/.with_heading.*do/)
                  inside_slot_heading = true
                end
                if inside_slot_heading
                  do_count += 1 if child_source.match?(/ do | if | unless /)
                  do_count -= 1 if child_source.match?(/<% end %>/)
                  inside_slot_heading = false if do_count.zero?
                end
                if ((ruby_ast && ruby_ast.method_name == :link_to) || child_source.match?(/Primer::Beta::Link/)) &&
                  !(skippable_classes_or_args_on_erb?(child_source) || inside_slot_heading)
                  if child_index.positive?
                    prev_node = filtered[child_index - 1]
                    if prev_node.is_a?(String) && !skippable_text?(prev_node)
                      already_flagged = true
                      generate_offense(self.class, processed_source, BetterHtml::Tree::Tag.from_node(child_node), MESSAGE)
                    end
                  end
                  next_node = filtered[child_index + 1]
                  if !already_flagged && next_node.is_a?(String) && !skippable_text?(next_node)
                    unless next_node.strip === "."
                      generate_offense(self.class, processed_source, BetterHtml::Tree::Tag.from_node(child_node), MESSAGE)
                    end
                  end
                end
              end
              already_flagged = false
            end
          end
        end
      end

      # Partial autocorrect support for auto-fixing HTML anchor links.
      sig { params(_processed_source: ProcessedSource, offense: Offense).void }
      def autocorrect(_processed_source, offense)
        lambda do |corrector|
          offense_source = offense.source_range.source
          if offense_source.match?(/<a(.|\n)*class=(.|\n)*>/)
            link_with_class = offense_source.gsub(/class="/, "class=\"#{LINK_UNDERLINE_CLASS} ")
            corrector.replace(offense.source_range, link_with_class)
          elsif offense_source.match?(/<a(.|\n)*>/)
            link_with_class = offense_source.gsub(/<a/, "<a class=\"#{LINK_UNDERLINE_CLASS}\"")
            corrector.replace(offense.source_range, link_with_class)
          end
        end
      end

      private

      # Don't flag when:
      # * text adjacent to the links don't include alphanumeric characters or common puncuation (.!?,).
      # * text starts or ends with a slash because they tend to be breadcrumbs.
      sig { params(text: String).returns(T::Boolean) }
      def skippable_text?(text)
        stripped_text = text.strip
        plaintext = Nokogiri::HTML(stripped_text).text
        plaintext.empty? || plaintext.starts_with?("/") || plaintext.end_with?("/") || !plaintext.match?(/^.*[a-zA-Z,.!?].*$/)
      end

      sig { params(node: T::untyped).returns(T::Boolean) }
      def text_node?(node)
        node && node.type == :text && node.descendants(:erb).to_a.empty?
      end

      sig { params(node: T::untyped).returns(T::Boolean) }
      def comment_node?(node)
        !node.is_a?(String) && node.descendants(:indicator).to_a.present? && node.descendants(:indicator).first.loc.source == "#"
      end

      # Don't flag HTML links with the given classes.
      sig { params(tag_node: BetterHtml::Tree::Tag).returns(T::Boolean) }
      def skippable_classes?(tag_node)
        has_class(tag_node, NO_UNDERLINE_CLASS) ||
        has_class(tag_node, LINK_UNDERLINE_CLASS) ||
        has_class(tag_node, ALTERNATE_UNDERLINE_CLASS) ||
        has_class(tag_node, BTN_CSS_CLASS) ||
        has_class(tag_node, TEXT_BOLD_CLASS) ||
        has_class(tag_node, MKTG_CLASS)
      end

      # Don't flag when link_to or Primer::Beta::Link source contains the given classes or system args, or is in a block sytnax
      sig { params(source: String).returns(T::Boolean) }
      def skippable_classes_or_args_on_erb?(source)
        source.match?(/#{LINK_UNDERLINE_CLASS}|#{ALTERNATE_UNDERLINE_CLASS}|#{BTN_CSS_CLASS}|#{TEXT_BOLD_CLASS}|#{MKTG_CLASS}|#{NO_UNDERLINE_CLASS}/) ||
        source.match?(/do %>/) || # Don't support blocks for now.
        source.match?(/underline:|font_weight: :bold|font_family: :mono|text: :bold/)
      end

      sig { params(nodes_between_anchor: T::Array[T::untyped]).returns(T::Boolean) }
      def contains_icon?(nodes_between_anchor)
        # Determine if anchor contains icon.
        nodes_between_anchor.each do |node|
          if node.type == :text && node.descendants(:code).to_a.present?
            if node.loc.source.match?(/avatar|octicon/i)
              return true
            end
          end
        end
        false
      end
    end
  end
end
