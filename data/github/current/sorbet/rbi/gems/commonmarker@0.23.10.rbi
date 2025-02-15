# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `commonmarker` gem.
# Please instead update this file by running `bin/tapioca gem commonmarker`.

# source://commonmarker//lib/commonmarker/config.rb#3
module CommonMarker
  class << self
    def extensions; end

    # Public: Parses a Markdown string into a `document` node.
    #
    # string - {String} to be parsed
    # option - A {Symbol} or {Array of Symbol}s indicating the parse options
    # extensions - An {Array of Symbol}s indicating the extensions to use
    #
    # Returns the `document` node.
    #
    # @raise [TypeError]
    #
    # source://commonmarker//lib/commonmarker.rb#37
    def render_doc(text, options = T.unsafe(nil), extensions = T.unsafe(nil)); end

    # Public:  Parses a Markdown string into an HTML string.
    #
    # text - A {String} of text
    # option - Either a {Symbol} or {Array of Symbol}s indicating the render options
    # extensions - An {Array of Symbol}s indicating the extensions to use
    #
    # Returns a {String} of converted HTML.
    #
    # @raise [TypeError]
    #
    # source://commonmarker//lib/commonmarker.rb#23
    def render_html(text, options = T.unsafe(nil), extensions = T.unsafe(nil)); end
  end
end

# For Ruby::Enum, these must be classes, not modules
#
# source://commonmarker//lib/commonmarker/config.rb#5
module CommonMarker::Config
  class << self
    # source://commonmarker//lib/commonmarker/config.rb#37
    def process_options(option, type); end
  end
end

# See https://github.com/github/cmark-gfm/blob/master/src/cmark-gfm.h#L673
#
# source://commonmarker//lib/commonmarker/config.rb#7
CommonMarker::Config::OPTS = T.let(T.unsafe(nil), Hash)

# source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#4
class CommonMarker::HtmlRenderer < ::CommonMarker::Renderer
  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#77
  def blockquote(node); end

  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#159
  def code(node); end

  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#91
  def code_block(node); end

  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#5
  def document(_); end

  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#128
  def emph(_); end

  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#223
  def footnote_definition(_); end

  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#219
  def footnote_reference(node); end

  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#10
  def header(node); end

  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#85
  def hrule(node); end

  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#110
  def html(node); end

  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#146
  def image(node); end

  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#120
  def inline_html(node); end

  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#165
  def linebreak(_node); end

  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#140
  def link(node); end

  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#33
  def list(node); end

  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#57
  def list_item(node); end

  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#17
  def paragraph(node); end

  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#169
  def softbreak(_); end

  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#215
  def strikethrough(_); end

  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#132
  def strong(node); end

  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#179
  def table(node); end

  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#204
  def table_cell(node); end

  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#187
  def table_header(node); end

  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#195
  def table_row(node); end

  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#66
  def tasklist(node); end

  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#155
  def text(node); end

  private

  # @return [Boolean]
  #
  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#252
  def checked?(node); end

  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#239
  def out_footnote_backref; end

  # @return [Boolean]
  #
  # source://commonmarker//lib/commonmarker/renderer/html_renderer.rb#248
  def tasklist?(node); end
end

# source://commonmarker//lib/commonmarker/node/inspect.rb#6
class CommonMarker::Node
  include ::Prelude::Enumerator
  include ::Enumerable
  include ::CommonMarker::Node::Inspect

  def _render_commonmark(*_arg0); end
  def _render_html(_arg0, _arg1); end
  def _render_plaintext(*_arg0); end
  def _render_xml(_arg0); end
  def append_child(_arg0); end
  def delete; end

  # Public: Iterate over the children (if any) of the current pointer.
  #
  # source://commonmarker//lib/commonmarker/node.rb#66
  def each; end

  # Deprecated: Please use `each` instead
  #
  # source://commonmarker//lib/commonmarker/node.rb#78
  def each_child(&block); end

  def fence_info; end
  def fence_info=(_arg0); end
  def first_child; end
  def header_level; end
  def header_level=(_arg0); end
  def html_escape_href(_arg0); end
  def html_escape_html(_arg0); end
  def insert_after(_arg0); end
  def insert_before(_arg0); end
  def last_child; end
  def list_start; end
  def list_start=(_arg0); end
  def list_tight; end
  def list_tight=(_arg0); end
  def list_type; end
  def list_type=(_arg0); end
  def next; end
  def parent; end
  def prepend_child(_arg0); end
  def previous; end
  def sourcepos; end
  def string_content; end
  def string_content=(_arg0); end
  def table_alignments; end
  def tasklist_item_checked=(_arg0); end
  def tasklist_item_checked?; end
  def tasklist_state; end
  def title; end
  def title=(_arg0); end

  # Public: Convert the node to a CommonMark string.
  #
  # options - A {Symbol} or {Array of Symbol}s indicating the render options
  # width - Column to wrap the output at
  #
  # Returns a {String}.
  #
  # source://commonmarker//lib/commonmarker/node.rb#49
  def to_commonmark(options = T.unsafe(nil), width = T.unsafe(nil)); end

  # Public: Convert the node to an HTML string.
  #
  # options - A {Symbol} or {Array of Symbol}s indicating the render options
  # extensions - An {Array of Symbol}s indicating the extensions to use
  #
  # Returns a {String}.
  #
  # source://commonmarker//lib/commonmarker/node.rb#28
  def to_html(options = T.unsafe(nil), extensions = T.unsafe(nil)); end

  # Public: Convert the node to a plain text string.
  #
  # options - A {Symbol} or {Array of Symbol}s indicating the render options
  # width - Column to wrap the output at
  #
  # Returns a {String}.
  #
  # source://commonmarker//lib/commonmarker/node.rb#60
  def to_plaintext(options = T.unsafe(nil), width = T.unsafe(nil)); end

  # Public: Convert the node to an XML string.
  #
  # options - A {Symbol} or {Array of Symbol}s indicating the render options
  #
  # Returns a {String}.
  #
  # source://commonmarker//lib/commonmarker/node.rb#38
  def to_xml(options = T.unsafe(nil)); end

  def type; end
  def type_string; end
  def url; end
  def url=(_arg0); end

  # Public: An iterator that "walks the tree," descending into children recursively.
  #
  # blk - A {Proc} representing the action to take for each child
  #
  # @yield [_self]
  # @yieldparam _self [CommonMarker::Node] the object that the method was called on
  #
  # source://commonmarker//lib/commonmarker/node.rb#13
  def walk(&block); end

  class << self
    def markdown_to_html(_arg0, _arg1, _arg2); end
    def markdown_to_xml(_arg0, _arg1, _arg2); end
    def new(_arg0); end
    def parse_document(_arg0, _arg1, _arg2, _arg3); end
  end
end

# source://commonmarker//lib/commonmarker/node/inspect.rb#7
module CommonMarker::Node::Inspect
  # source://commonmarker//lib/commonmarker/node/inspect.rb#10
  def inspect; end

  # @param printer [PrettyPrint] pp
  #
  # source://commonmarker//lib/commonmarker/node/inspect.rb#15
  def pretty_print(printer); end
end

# source://commonmarker//lib/commonmarker/node/inspect.rb#8
CommonMarker::Node::Inspect::PP_INDENT_SIZE = T.let(T.unsafe(nil), Integer)

class CommonMarker::NodeError < ::StandardError; end

# source://commonmarker//lib/commonmarker/renderer.rb#7
class CommonMarker::Renderer
  # @return [Renderer] a new instance of Renderer
  #
  # source://commonmarker//lib/commonmarker/renderer.rb#10
  def initialize(options: T.unsafe(nil), extensions: T.unsafe(nil)); end

  # source://commonmarker//lib/commonmarker/renderer.rb#76
  def block; end

  # source://commonmarker//lib/commonmarker/renderer.rb#68
  def blocksep; end

  # source://commonmarker//lib/commonmarker/renderer.rb#56
  def code_block(node); end

  # source://commonmarker//lib/commonmarker/renderer.rb#82
  def container(starter, ender); end

  # source://commonmarker//lib/commonmarker/renderer.rb#72
  def containersep; end

  # source://commonmarker//lib/commonmarker/renderer.rb#62
  def cr; end

  # source://commonmarker//lib/commonmarker/renderer.rb#52
  def document(_node); end

  # Returns the value of attribute in_plain.
  #
  # source://commonmarker//lib/commonmarker/renderer.rb#8
  def in_plain; end

  # Sets the attribute in_plain
  #
  # @param value the value to set the attribute in_plain to.
  #
  # source://commonmarker//lib/commonmarker/renderer.rb#8
  def in_plain=(_arg0); end

  # Returns the value of attribute in_tight.
  #
  # source://commonmarker//lib/commonmarker/renderer.rb#8
  def in_tight; end

  # Sets the attribute in_tight
  #
  # @param value the value to set the attribute in_tight to.
  #
  # source://commonmarker//lib/commonmarker/renderer.rb#8
  def in_tight=(_arg0); end

  # source://commonmarker//lib/commonmarker/renderer.rb#20
  def out(*args); end

  # source://commonmarker//lib/commonmarker/renderer.rb#88
  def plain; end

  # source://commonmarker//lib/commonmarker/renderer.rb#60
  def reference_def(_node); end

  # source://commonmarker//lib/commonmarker/renderer.rb#35
  def render(node); end

  # Returns the value of attribute warnings.
  #
  # source://commonmarker//lib/commonmarker/renderer.rb#8
  def warnings; end

  # Sets the attribute warnings
  #
  # @param value the value to set the attribute warnings to.
  #
  # source://commonmarker//lib/commonmarker/renderer.rb#8
  def warnings=(_arg0); end

  private

  # source://commonmarker//lib/commonmarker/renderer.rb#97
  def escape_href(str); end

  # source://commonmarker//lib/commonmarker/renderer.rb#101
  def escape_html(str); end

  # @return [Boolean]
  #
  # source://commonmarker//lib/commonmarker/renderer.rb#131
  def option_enabled?(opt); end

  # source://commonmarker//lib/commonmarker/renderer.rb#123
  def sourcepos(node); end

  # source://commonmarker//lib/commonmarker/renderer.rb#105
  def tagfilter(str); end
end

# source://commonmarker//lib/commonmarker/version.rb#4
CommonMarker::VERSION = T.let(T.unsafe(nil), String)
