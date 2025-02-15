# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `erblint-github` gem.
# Please instead update this file by running `bin/tapioca gem erblint-github`.

# source://erblint-github//lib/erblint-github/linters/custom_helpers.rb#6
module ERBLint; end

# source://erblint-github//lib/erblint-github/linters/custom_helpers.rb#7
module ERBLint::Linters; end

# source://erblint-github//lib/erblint-github/linters/custom_helpers.rb#8
module ERBLint::Linters::CustomHelpers
  # Map possible values from condition
  #
  # source://erblint-github//lib/erblint-github/linters/custom_helpers.rb#64
  def basic_conditional_code_check(code); end

  # @return [Boolean]
  #
  # source://erblint-github//lib/erblint-github/linters/custom_helpers.rb#30
  def counter_correct?(processed_source); end

  # @return [Boolean]
  #
  # source://erblint-github//lib/erblint-github/linters/custom_helpers.rb#77
  def focusable?(tag); end

  # source://erblint-github//lib/erblint-github/linters/custom_helpers.rb#11
  def generate_offense(klass, processed_source, tag, message = T.unsafe(nil), replacement = T.unsafe(nil)); end

  # source://erblint-github//lib/erblint-github/linters/custom_helpers.rb#18
  def generate_offense_from_source_range(klass, source_range, message = T.unsafe(nil), replacement = T.unsafe(nil)); end

  # source://erblint-github//lib/erblint-github/linters/custom_helpers.rb#25
  def possible_attribute_values(tag, attr_name); end

  # source://erblint-github//lib/erblint-github/linters/custom_helpers.rb#73
  def simple_class_name; end

  # source://erblint-github//lib/erblint-github/linters/custom_helpers.rb#69
  def tags(processed_source); end
end

# source://erblint-github//lib/erblint-github/linters/custom_helpers.rb#9
ERBLint::Linters::CustomHelpers::INTERACTIVE_ELEMENTS = T.let(T.unsafe(nil), Array)

# source://erblint-github//lib/erblint-github/linters/github/accessibility/aria_label_is_well_formatted.rb#7
module ERBLint::Linters::GitHub; end

# source://erblint-github//lib/erblint-github/linters/github/accessibility/aria_label_is_well_formatted.rb#8
module ERBLint::Linters::GitHub::Accessibility; end

# source://erblint-github//lib/erblint-github/linters/github/accessibility/aria_label_is_well_formatted.rb#9
class ERBLint::Linters::GitHub::Accessibility::AriaLabelIsWellFormatted < ::ERBLint::Linter
  include ::ERBLint::Linters::CustomHelpers
  include ::ERBLint::LinterRegistry

  # source://erblint-github//lib/erblint-github/linters/github/accessibility/aria_label_is_well_formatted.rb#21
  def run(processed_source); end
end

# source://erblint-github//lib/erblint-github/linters/github/accessibility/aria_label_is_well_formatted.rb#15
class ERBLint::Linters::GitHub::Accessibility::AriaLabelIsWellFormatted::ConfigSchema < ::ERBLint::LinterConfig; end

# source://erblint-github//lib/erblint-github/linters/github/accessibility/aria_label_is_well_formatted.rb#13
ERBLint::Linters::GitHub::Accessibility::AriaLabelIsWellFormatted::MESSAGE = T.let(T.unsafe(nil), String)

# source://erblint-github//lib/erblint-github/linters/github/accessibility/avoid_both_disabled_and_aria_disabled.rb#9
class ERBLint::Linters::GitHub::Accessibility::AvoidBothDisabledAndAriaDisabled < ::ERBLint::Linter
  include ::ERBLint::Linters::CustomHelpers
  include ::ERBLint::LinterRegistry

  # source://erblint-github//lib/erblint-github/linters/github/accessibility/avoid_both_disabled_and_aria_disabled.rb#16
  def run(processed_source); end
end

# source://erblint-github//lib/erblint-github/linters/github/accessibility/avoid_both_disabled_and_aria_disabled.rb#13
ERBLint::Linters::GitHub::Accessibility::AvoidBothDisabledAndAriaDisabled::ELEMENTS_WITH_NATIVE_DISABLED_ATTRIBUTE_SUPPORT = T.let(T.unsafe(nil), Array)

# source://erblint-github//lib/erblint-github/linters/github/accessibility/avoid_both_disabled_and_aria_disabled.rb#14
ERBLint::Linters::GitHub::Accessibility::AvoidBothDisabledAndAriaDisabled::MESSAGE = T.let(T.unsafe(nil), String)

# source://erblint-github//lib/erblint-github/linters/github/accessibility/avoid_generic_link_text.rb#9
class ERBLint::Linters::GitHub::Accessibility::AvoidGenericLinkText < ::ERBLint::Linter
  include ::ERBLint::Linters::CustomHelpers
  include ::ERBLint::LinterRegistry

  # source://erblint-github//lib/erblint-github/linters/github/accessibility/avoid_generic_link_text.rb#25
  def run(processed_source); end

  private

  # @return [Boolean]
  #
  # source://erblint-github//lib/erblint-github/linters/github/accessibility/avoid_generic_link_text.rb#105
  def banned_text?(text); end

  # source://erblint-github//lib/erblint-github/linters/github/accessibility/avoid_generic_link_text.rb#113
  def extract_ruby_node(source); end

  # @return [Boolean]
  #
  # source://erblint-github//lib/erblint-github/linters/github/accessibility/avoid_generic_link_text.rb#119
  def link_tag?(tag_node); end

  # Downcase and strip punctuation and extra whitespaces.
  #
  # source://erblint-github//lib/erblint-github/linters/github/accessibility/avoid_generic_link_text.rb#101
  def stripped_text(text); end

  # @return [Boolean]
  #
  # source://erblint-github//lib/erblint-github/linters/github/accessibility/avoid_generic_link_text.rb#123
  def tag_type?(node); end

  # @return [Boolean]
  #
  # source://erblint-github//lib/erblint-github/linters/github/accessibility/avoid_generic_link_text.rb#109
  def valid_accessible_name?(aria_label, text); end
end

# source://erblint-github//lib/erblint-github/linters/github/accessibility/avoid_generic_link_text.rb#21
ERBLint::Linters::GitHub::Accessibility::AvoidGenericLinkText::ARIA_LABEL_ATTRIBUTES = T.let(T.unsafe(nil), Array)

# source://erblint-github//lib/erblint-github/linters/github/accessibility/avoid_generic_link_text.rb#13
ERBLint::Linters::GitHub::Accessibility::AvoidGenericLinkText::BANNED_GENERIC_TEXT = T.let(T.unsafe(nil), Array)

# source://erblint-github//lib/erblint-github/linters/github/accessibility/avoid_generic_link_text.rb#23
ERBLint::Linters::GitHub::Accessibility::AvoidGenericLinkText::MESSAGE = T.let(T.unsafe(nil), String)

# source://erblint-github//lib/erblint-github/linters/github/accessibility/disabled_attribute.rb#9
class ERBLint::Linters::GitHub::Accessibility::DisabledAttribute < ::ERBLint::Linter
  include ::ERBLint::Linters::CustomHelpers
  include ::ERBLint::LinterRegistry

  # source://erblint-github//lib/erblint-github/linters/github/accessibility/disabled_attribute.rb#16
  def run(processed_source); end
end

# source://erblint-github//lib/erblint-github/linters/github/accessibility/disabled_attribute.rb#14
ERBLint::Linters::GitHub::Accessibility::DisabledAttribute::MESSAGE = T.let(T.unsafe(nil), String)

# source://erblint-github//lib/erblint-github/linters/github/accessibility/disabled_attribute.rb#13
ERBLint::Linters::GitHub::Accessibility::DisabledAttribute::VALID_DISABLED_TAGS = T.let(T.unsafe(nil), Array)

# source://erblint-github//lib/erblint-github/linters/github/accessibility/iframe_has_title.rb#9
class ERBLint::Linters::GitHub::Accessibility::IframeHasTitle < ::ERBLint::Linter
  include ::ERBLint::Linters::CustomHelpers
  include ::ERBLint::LinterRegistry

  # source://erblint-github//lib/erblint-github/linters/github/accessibility/iframe_has_title.rb#16
  def run(processed_source); end

  private

  # @return [Boolean]
  #
  # source://erblint-github//lib/erblint-github/linters/github/accessibility/iframe_has_title.rb#29
  def aria_hidden?(tag); end
end

# source://erblint-github//lib/erblint-github/linters/github/accessibility/iframe_has_title.rb#13
ERBLint::Linters::GitHub::Accessibility::IframeHasTitle::MESSAGE = T.let(T.unsafe(nil), String)

# source://erblint-github//lib/erblint-github/linters/github/accessibility/image_has_alt.rb#9
class ERBLint::Linters::GitHub::Accessibility::ImageHasAlt < ::ERBLint::Linter
  include ::ERBLint::Linters::CustomHelpers
  include ::ERBLint::LinterRegistry

  # source://erblint-github//lib/erblint-github/linters/github/accessibility/image_has_alt.rb#15
  def run(processed_source); end
end

# source://erblint-github//lib/erblint-github/linters/github/accessibility/image_has_alt.rb#13
ERBLint::Linters::GitHub::Accessibility::ImageHasAlt::MESSAGE = T.let(T.unsafe(nil), String)

# source://erblint-github//lib/erblint-github/linters/github/accessibility/link_has_href.rb#9
class ERBLint::Linters::GitHub::Accessibility::LinkHasHref < ::ERBLint::Linter
  include ::ERBLint::Linters::CustomHelpers
  include ::ERBLint::LinterRegistry

  # source://erblint-github//lib/erblint-github/linters/github/accessibility/link_has_href.rb#15
  def run(processed_source); end
end

# source://erblint-github//lib/erblint-github/linters/github/accessibility/link_has_href.rb#13
ERBLint::Linters::GitHub::Accessibility::LinkHasHref::MESSAGE = T.let(T.unsafe(nil), String)

# source://erblint-github//lib/erblint-github/linters/github/accessibility/navigation_has_label.rb#9
class ERBLint::Linters::GitHub::Accessibility::NavigationHasLabel < ::ERBLint::Linter
  include ::ERBLint::Linters::CustomHelpers
  include ::ERBLint::LinterRegistry

  # source://erblint-github//lib/erblint-github/linters/github/accessibility/navigation_has_label.rb#15
  def run(processed_source); end
end

# source://erblint-github//lib/erblint-github/linters/github/accessibility/navigation_has_label.rb#13
ERBLint::Linters::GitHub::Accessibility::NavigationHasLabel::MESSAGE = T.let(T.unsafe(nil), String)

# source://erblint-github//lib/erblint-github/linters/github/accessibility/nested_interactive_elements.rb#9
class ERBLint::Linters::GitHub::Accessibility::NestedInteractiveElements < ::ERBLint::Linter
  include ::ERBLint::Linters::CustomHelpers
  include ::ERBLint::LinterRegistry

  # source://erblint-github//lib/erblint-github/linters/github/accessibility/nested_interactive_elements.rb#15
  def run(processed_source); end
end

# source://erblint-github//lib/erblint-github/linters/github/accessibility/nested_interactive_elements.rb#13
ERBLint::Linters::GitHub::Accessibility::NestedInteractiveElements::MESSAGE = T.let(T.unsafe(nil), String)

# source://erblint-github//lib/erblint-github/linters/github/accessibility/no_aria_hidden_on_focusable.rb#9
class ERBLint::Linters::GitHub::Accessibility::NoAriaHiddenOnFocusable < ::ERBLint::Linter
  include ::ERBLint::Linters::CustomHelpers
  include ::ERBLint::LinterRegistry

  # source://erblint-github//lib/erblint-github/linters/github/accessibility/no_aria_hidden_on_focusable.rb#15
  def run(processed_source); end
end

# source://erblint-github//lib/erblint-github/linters/github/accessibility/no_aria_hidden_on_focusable.rb#13
ERBLint::Linters::GitHub::Accessibility::NoAriaHiddenOnFocusable::MESSAGE = T.let(T.unsafe(nil), String)

# source://erblint-github//lib/erblint-github/linters/github/accessibility/no_aria_label_misuse.rb#9
class ERBLint::Linters::GitHub::Accessibility::NoAriaLabelMisuse < ::ERBLint::Linter
  include ::ERBLint::Linters::CustomHelpers
  include ::ERBLint::LinterRegistry

  # source://erblint-github//lib/erblint-github/linters/github/accessibility/no_aria_label_misuse.rb#21
  def run(processed_source); end
end

# source://erblint-github//lib/erblint-github/linters/github/accessibility/no_aria_label_misuse.rb#13
ERBLint::Linters::GitHub::Accessibility::NoAriaLabelMisuse::GENERIC_ELEMENTS = T.let(T.unsafe(nil), Array)

# source://erblint-github//lib/erblint-github/linters/github/accessibility/no_aria_label_misuse.rb#19
ERBLint::Linters::GitHub::Accessibility::NoAriaLabelMisuse::MESSAGE = T.let(T.unsafe(nil), String)

# source://erblint-github//lib/erblint-github/linters/github/accessibility/no_aria_label_misuse.rb#14
ERBLint::Linters::GitHub::Accessibility::NoAriaLabelMisuse::NAME_RESTRICTED_ELEMENTS = T.let(T.unsafe(nil), Array)

# https://w3c.github.io/aria/#namefromprohibited
#
# source://erblint-github//lib/erblint-github/linters/github/accessibility/no_aria_label_misuse.rb#17
ERBLint::Linters::GitHub::Accessibility::NoAriaLabelMisuse::ROLES_WHICH_CANNOT_BE_NAMED = T.let(T.unsafe(nil), Array)

# source://erblint-github//lib/erblint-github/linters/github/accessibility/no_positive_tab_index.rb#9
class ERBLint::Linters::GitHub::Accessibility::NoPositiveTabIndex < ::ERBLint::Linter
  include ::ERBLint::Linters::CustomHelpers
  include ::ERBLint::LinterRegistry

  # source://erblint-github//lib/erblint-github/linters/github/accessibility/no_positive_tab_index.rb#15
  def run(processed_source); end
end

# source://erblint-github//lib/erblint-github/linters/github/accessibility/no_positive_tab_index.rb#13
ERBLint::Linters::GitHub::Accessibility::NoPositiveTabIndex::MESSAGE = T.let(T.unsafe(nil), String)

# source://erblint-github//lib/erblint-github/linters/github/accessibility/no_redundant_image_alt.rb#9
class ERBLint::Linters::GitHub::Accessibility::NoRedundantImageAlt < ::ERBLint::Linter
  include ::ERBLint::Linters::CustomHelpers
  include ::ERBLint::LinterRegistry

  # source://erblint-github//lib/erblint-github/linters/github/accessibility/no_redundant_image_alt.rb#16
  def run(processed_source); end
end

# source://erblint-github//lib/erblint-github/linters/github/accessibility/no_redundant_image_alt.rb#13
ERBLint::Linters::GitHub::Accessibility::NoRedundantImageAlt::MESSAGE = T.let(T.unsafe(nil), String)

# source://erblint-github//lib/erblint-github/linters/github/accessibility/no_redundant_image_alt.rb#14
ERBLint::Linters::GitHub::Accessibility::NoRedundantImageAlt::REDUNDANT_ALT_WORDS = T.let(T.unsafe(nil), Array)

# source://erblint-github//lib/erblint-github/linters/github/accessibility/no_title_attribute.rb#9
class ERBLint::Linters::GitHub::Accessibility::NoTitleAttribute < ::ERBLint::Linter
  include ::ERBLint::Linters::CustomHelpers
  include ::ERBLint::LinterRegistry

  # source://erblint-github//lib/erblint-github/linters/github/accessibility/no_title_attribute.rb#15
  def run(processed_source); end
end

# source://erblint-github//lib/erblint-github/linters/github/accessibility/no_title_attribute.rb#13
ERBLint::Linters::GitHub::Accessibility::NoTitleAttribute::MESSAGE = T.let(T.unsafe(nil), String)

# source://erblint-github//lib/erblint-github/linters/github/accessibility/no_visually_hidden_interactive_elements.rb#9
class ERBLint::Linters::GitHub::Accessibility::NoVisuallyHiddenInteractiveElements < ::ERBLint::Linter
  include ::ERBLint::Linters::CustomHelpers
  include ::ERBLint::LinterRegistry

  # source://erblint-github//lib/erblint-github/linters/github/accessibility/no_visually_hidden_interactive_elements.rb#16
  def run(processed_source); end
end

# source://erblint-github//lib/erblint-github/linters/github/accessibility/no_visually_hidden_interactive_elements.rb#12
ERBLint::Linters::GitHub::Accessibility::NoVisuallyHiddenInteractiveElements::INTERACTIVE_ELEMENTS = T.let(T.unsafe(nil), Array)

# source://erblint-github//lib/erblint-github/linters/github/accessibility/no_visually_hidden_interactive_elements.rb#14
ERBLint::Linters::GitHub::Accessibility::NoVisuallyHiddenInteractiveElements::MESSAGE = T.let(T.unsafe(nil), String)

# source://erblint-github//lib/erblint-github/linters/github/accessibility/svg_has_accessible_text.rb#9
class ERBLint::Linters::GitHub::Accessibility::SvgHasAccessibleText < ::ERBLint::Linter
  include ::ERBLint::Linters::CustomHelpers
  include ::ERBLint::LinterRegistry

  # source://erblint-github//lib/erblint-github/linters/github/accessibility/svg_has_accessible_text.rb#15
  def run(processed_source); end
end

# source://erblint-github//lib/erblint-github/linters/github/accessibility/svg_has_accessible_text.rb#13
ERBLint::Linters::GitHub::Accessibility::SvgHasAccessibleText::MESSAGE = T.let(T.unsafe(nil), String)
