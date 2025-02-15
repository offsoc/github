# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `goomba` gem.
# Please instead update this file by running `bin/tapioca gem goomba`.

# source://goomba//lib/goomba/sanitizer.rb#1
module Goomba; end

# source://goomba//lib/goomba/version.rb#3
Goomba::CACHE_VERSION = T.let(T.unsafe(nil), String)

# source://goomba//lib/goomba.rb#54
class Goomba::CommentNode < ::Goomba::Node
  def text; end
  def text_content; end
end

# source://goomba//lib/goomba.rb#12
class Goomba::Document
  # Returns the value of attribute __stats__.
  #
  # source://goomba//lib/goomba.rb#13
  def __stats__; end

  def name_map; end
  def name_set; end
  def root; end
  def select(_arg0); end

  # source://goomba//lib/goomba.rb#15
  def to_html(filters: T.unsafe(nil)); end

  class << self
    def new(*_arg0); end
  end
end

# source://goomba//lib/goomba.rb#20
class Goomba::DocumentFragment
  # Returns the value of attribute __stats__.
  #
  # source://goomba//lib/goomba.rb#25
  def __stats__; end

  # source://goomba//lib/goomba.rb#21
  def children; end

  def children!; end
  def name_map; end
  def name_set; end
  def select(_arg0); end

  # source://goomba//lib/goomba.rb#27
  def to_html(filters: T.unsafe(nil)); end

  class << self
    def new(*_arg0); end
  end
end

# source://goomba//lib/goomba.rb#58
class Goomba::ElementNode < ::Goomba::Node
  def [](_arg0); end
  def []=(_arg0, _arg1); end
  def attributes; end

  # source://goomba//lib/goomba.rb#62
  def children; end

  def children!; end
  def inner_html; end

  # Returns the value of attribute tag.
  #
  # source://goomba//lib/goomba.rb#59
  def name; end

  def remove_attribute(_arg0); end
  def select(_arg0); end

  # Returns the value of attribute tag.
  #
  # source://goomba//lib/goomba.rb#59
  def tag; end

  def text_content; end
  def to_html; end
  def to_s; end
end

# source://goomba//lib/goomba.rb#32
class Goomba::Node
  def ==(_arg0); end
  def =~(_arg0); end

  # Returns the value of attribute document.
  #
  # source://goomba//lib/goomba.rb#33
  def document; end

  def eql?(_arg0); end

  # @return [Boolean]
  #
  # source://goomba//lib/goomba.rb#43
  def first_child?; end

  # @return [Boolean]
  #
  # source://goomba//lib/goomba.rb#39
  def grandparent_is?(t); end

  def hash; end
  def index_within_parent; end
  def last_child?; end
  def matches(_arg0); end
  def next_sibling; end
  def nth_ancestor_is?(_arg0, _arg1); end
  def parent; end

  # @return [Boolean]
  #
  # source://goomba//lib/goomba.rb#35
  def parent_is?(t); end

  def previous_sibling; end
end

# source://goomba//lib/goomba/sanitizer.rb#2
class Goomba::Sanitizer
  # @return [Sanitizer] a new instance of Sanitizer
  #
  # source://goomba//lib/goomba/sanitizer.rb#3
  def initialize; end

  # source://goomba//lib/goomba/sanitizer.rb#45
  def allow(*elements); end

  # source://goomba//lib/goomba/sanitizer.rb#55
  def allow_attribute(element, *attr); end

  # source://goomba//lib/goomba/sanitizer.rb#71
  def allow_class(element, *klass); end

  # source://goomba//lib/goomba/sanitizer.rb#99
  def allow_comments!; end

  def allow_comments=(_arg0); end

  # source://goomba//lib/goomba/sanitizer.rb#45
  def allow_element(*elements); end

  # source://goomba//lib/goomba/sanitizer.rb#77
  def allow_protocol(element, attr, protos); end

  def allowed_attributes; end
  def allowed_comments; end

  # source://goomba//lib/goomba/sanitizer.rb#41
  def allowed_elements; end

  # source://goomba//lib/goomba/sanitizer.rb#50
  def disallow(*elements); end

  # source://goomba//lib/goomba/sanitizer.rb#67
  def disallow_attribute(element, *attr); end

  # source://goomba//lib/goomba/sanitizer.rb#103
  def disallow_comments!; end

  # source://goomba//lib/goomba/sanitizer.rb#50
  def disallow_element(*elements); end

  def element_flags; end
  def get_limit_nesting; end
  def limit_nesting(_arg0, _arg1); end
  def name_prefix; end
  def name_prefix=(_arg0); end

  # source://goomba//lib/goomba/sanitizer.rb#107
  def prefix_attribute_names(prefix); end

  # source://goomba//lib/goomba/sanitizer.rb#87
  def remove_contents(*elements); end

  # source://goomba//lib/goomba/sanitizer.rb#59
  def require_any_attributes(element, *attr); end

  def set_all_flags(_arg0, _arg1); end
  def set_allowed_attribute(_arg0, _arg1, _arg2); end
  def set_allowed_class(_arg0, _arg1, _arg2); end
  def set_allowed_protocols(_arg0, _arg1, _arg2); end
  def set_flag(_arg0, _arg1, _arg2); end
  def set_required_attribute(_arg0, _arg1, _arg2); end

  # source://goomba//lib/goomba/sanitizer.rb#111
  def to_h; end

  # source://goomba//lib/goomba/sanitizer.rb#95
  def wrap_with_whitespace(*elements); end

  class << self
    # source://goomba//lib/goomba/sanitizer.rb#35
    def define(&block); end

    # source://goomba//lib/goomba/sanitizer.rb#8
    def from_hash(h); end

    def new; end
  end
end

Goomba::Sanitizer::ALLOW = T.let(T.unsafe(nil), Integer)
Goomba::Sanitizer::MAX_ATTR_VALUE_LENGTH = T.let(T.unsafe(nil), Integer)
Goomba::Sanitizer::REMOVE_CONTENTS = T.let(T.unsafe(nil), Integer)
Goomba::Sanitizer::WRAP_WHITESPACE = T.let(T.unsafe(nil), Integer)

# source://goomba//lib/goomba.rb#6
class Goomba::Selector
  def _native_code; end
  def analyze_matches; end
  def jit!; end

  # Returns the value of attribute match_selector.
  #
  # source://goomba//lib/goomba.rb#7
  def match_selector; end

  # Returns the value of attribute reject_selector.
  #
  # source://goomba//lib/goomba.rb#7
  def reject_selector; end

  class << self
    def can_jit?; end
    def new(_arg0); end
  end
end

class Goomba::Selector::ParseError < ::StandardError; end

# source://goomba//lib/goomba.rb#9
Goomba::Selector::Text = T.let(T.unsafe(nil), Goomba::Selector)

class Goomba::Serializer
  def to_html; end

  class << self
    def new(_arg0, _arg1); end
  end
end

# source://goomba//lib/goomba.rb#48
class Goomba::TextNode < ::Goomba::Node
  def html; end
  def inner_html; end
  def text; end
  def text_content; end
  def to_html; end
  def to_s; end
end

# source://goomba//lib/goomba/version.rb#2
Goomba::VERSION = T.let(T.unsafe(nil), String)
