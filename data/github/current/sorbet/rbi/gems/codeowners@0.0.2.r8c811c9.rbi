# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `codeowners` gem.
# Please instead update this file by running `bin/tapioca gem codeowners`.

# source://codeowners//lib/codeowners/version.rb#2
module Codeowners; end

# source://codeowners//lib/codeowners.rb#15
class Codeowners::File
  # @return [File] a new instance of File
  #
  # source://codeowners//lib/codeowners.rb#18
  def initialize(contents, owner_resolver: T.unsafe(nil), parser_class: T.unsafe(nil), parser_options: T.unsafe(nil)); end

  # source://codeowners//lib/codeowners.rb#50
  def build_empty_result; end

  # Returns the value of attribute contents.
  #
  # source://codeowners//lib/codeowners.rb#16
  def contents; end

  # Returns the value of attribute errors.
  #
  # source://codeowners//lib/codeowners.rb#16
  def errors; end

  # source://codeowners//lib/codeowners.rb#34
  def for(*paths); end

  # source://codeowners//lib/codeowners.rb#34
  def for_legacy(*paths); end

  # source://codeowners//lib/codeowners.rb#45
  def for_with_graph(*paths); end

  # source://codeowners//lib/codeowners.rb#40
  def for_with_tree(*paths); end

  # source://codeowners//lib/codeowners.rb#29
  def match(*paths, matcher: T.unsafe(nil)); end

  # source://codeowners//lib/codeowners.rb#54
  def owner_errors; end

  # Returns the value of attribute rules.
  #
  # source://codeowners//lib/codeowners.rb#16
  def rules; end

  private

  # source://codeowners//lib/codeowners.rb#81
  def parse_contents; end
end

# source://codeowners//lib/codeowners/matcher/linear.rb#4
module Codeowners::Matcher
  class << self
    # source://codeowners//lib/codeowners/matcher.rb#13
    def build_graph(rules); end

    # source://codeowners//lib/codeowners/matcher.rb#17
    def visualize_graph(graph, file = T.unsafe(nil)); end
  end
end

# source://codeowners//lib/codeowners/matcher/graph.rb#7
class Codeowners::Matcher::Graph
  # @return [Graph] a new instance of Graph
  #
  # source://codeowners//lib/codeowners/matcher/graph.rb#10
  def initialize(root = T.unsafe(nil)); end

  # source://codeowners//lib/codeowners/matcher/graph.rb#32
  def best_rule(path); end

  # source://codeowners//lib/codeowners/matcher/graph.rb#18
  def clear_cache; end

  # source://codeowners//lib/codeowners/matcher/graph.rb#22
  def for(paths); end

  # @return [Boolean]
  #
  # source://codeowners//lib/codeowners/matcher/graph.rb#56
  def match?(pattern_fragment, path_fragment); end

  # source://codeowners//lib/codeowners/matcher/graph.rb#36
  def matching_rules(path); end

  # Returns the value of attribute root.
  #
  # source://codeowners//lib/codeowners/matcher/graph.rb#8
  def root; end

  # Sets the attribute root
  #
  # @param value the value to set the attribute root to.
  #
  # source://codeowners//lib/codeowners/matcher/graph.rb#8
  def root=(_arg0); end

  # source://codeowners//lib/codeowners/matcher/graph.rb#41
  def traverse(parts); end

  private

  # source://codeowners//lib/codeowners/matcher/graph.rb#67
  def build_regexp(pattern); end

  # source://codeowners//lib/codeowners/matcher/graph.rb#62
  def step(nodes, part); end
end

# source://codeowners//lib/codeowners/matcher/graph_builder.rb#8
class Codeowners::Matcher::GraphBuilder
  # @return [GraphBuilder] a new instance of GraphBuilder
  #
  # source://codeowners//lib/codeowners/matcher/graph_builder.rb#23
  def initialize; end

  # source://codeowners//lib/codeowners/matcher/graph_builder.rb#29
  def add_rule(rule); end

  # source://codeowners//lib/codeowners/matcher/graph_builder.rb#53
  def finalize; end

  private

  # source://codeowners//lib/codeowners/matcher/graph_builder.rb#73
  def add_transition(nodes, part); end

  # source://codeowners//lib/codeowners/matcher/graph_builder.rb#87
  def build_transition(nodes, part); end

  # source://codeowners//lib/codeowners/matcher/graph_builder.rb#59
  def normalize_pattern(pattern); end

  class << self
    # @yield [builder]
    #
    # source://codeowners//lib/codeowners/matcher/graph_builder.rb#17
    def build; end

    # source://codeowners//lib/codeowners/matcher/graph_builder.rb#9
    def from_rules(rules); end
  end
end

# source://codeowners//lib/codeowners/matcher/graph_visualizer.rb#7
class Codeowners::Matcher::GraphVisualizer
  # @return [GraphVisualizer] a new instance of GraphVisualizer
  #
  # source://codeowners//lib/codeowners/matcher/graph_visualizer.rb#12
  def initialize(graph); end

  # source://codeowners//lib/codeowners/matcher/graph_visualizer.rb#16
  def write_dot(file = T.unsafe(nil)); end

  private

  # source://codeowners//lib/codeowners/matcher/graph_visualizer.rb#65
  def node_label(node); end

  # source://codeowners//lib/codeowners/matcher/graph_visualizer.rb#41
  def walk_graph; end

  class << self
    # source://codeowners//lib/codeowners/matcher/graph_visualizer.rb#8
    def write_dot(graph, file = T.unsafe(nil)); end
  end
end

# source://codeowners//lib/codeowners/matcher/linear.rb#5
class Codeowners::Matcher::Linear
  # @return [Linear] a new instance of Linear
  #
  # source://codeowners//lib/codeowners/matcher/linear.rb#8
  def initialize(rules, owner_resolver); end

  # source://codeowners//lib/codeowners/matcher/linear.rb#13
  def match(*paths); end

  # Returns the value of attribute rules.
  #
  # source://codeowners//lib/codeowners/matcher/linear.rb#6
  def rules; end
end

# source://codeowners//lib/codeowners/matcher/node.rb#7
class Codeowners::Matcher::Node
  # @return [Node] a new instance of Node
  #
  # source://codeowners//lib/codeowners/matcher/node.rb#13
  def initialize(graph = T.unsafe(nil)); end

  # source://codeowners//lib/codeowners/matcher/node.rb#61
  def add_free_transition(label, target); end

  # source://codeowners//lib/codeowners/matcher/node.rb#42
  def add_fuzzy_transition(pattern_fragment, target); end

  # source://codeowners//lib/codeowners/matcher/node.rb#52
  def add_literal_transition(pattern_fragment, target); end

  # source://codeowners//lib/codeowners/matcher/node.rb#33
  def add_unconditional_transition(pattern_fragment, target); end

  # source://codeowners//lib/codeowners/matcher/node.rb#24
  def follow_transitions(path_fragment); end

  # Returns the value of attribute free_transitions.
  #
  # source://codeowners//lib/codeowners/matcher/node.rb#10
  def free_transitions; end

  # Returns the value of attribute graph.
  #
  # source://codeowners//lib/codeowners/matcher/node.rb#8
  def graph; end

  # Sets the attribute graph
  #
  # @param value the value to set the attribute graph to.
  #
  # source://codeowners//lib/codeowners/matcher/node.rb#8
  def graph=(_arg0); end

  # Returns the value of attribute reachable_by_free_transitions.
  #
  # source://codeowners//lib/codeowners/matcher/node.rb#11
  def reachable_by_free_transitions; end

  # Returns the value of attribute rule.
  #
  # source://codeowners//lib/codeowners/matcher/node.rb#8
  def rule; end

  # Sets the attribute rule
  #
  # @param value the value to set the attribute rule to.
  #
  # source://codeowners//lib/codeowners/matcher/node.rb#8
  def rule=(_arg0); end

  # Returns the value of attribute transitions.
  #
  # source://codeowners//lib/codeowners/matcher/node.rb#9
  def transitions; end
end

# source://codeowners//lib/codeowners/matcher/path_tree.rb#5
class Codeowners::Matcher::PathTree
  # @return [PathTree] a new instance of PathTree
  #
  # source://codeowners//lib/codeowners/matcher/path_tree.rb#8
  def initialize(rules, owner_resolver); end

  # source://codeowners//lib/codeowners/matcher/path_tree.rb#13
  def match(*paths); end

  # Returns the value of attribute rules.
  #
  # source://codeowners//lib/codeowners/matcher/path_tree.rb#6
  def rules; end
end

# source://codeowners//lib/codeowners/matcher/result.rb#7
class Codeowners::Matcher::Result
  # @return [Result] a new instance of Result
  #
  # source://codeowners//lib/codeowners/matcher/result.rb#11
  def initialize(owner_resolver); end

  # source://codeowners//lib/codeowners/matcher/result.rb#16
  def [](path); end

  # source://codeowners//lib/codeowners/matcher/result.rb#20
  def []=(path, rule); end

  # source://codeowners//lib/codeowners/matcher/result.rb#38
  def owners_by_rule; end

  # source://codeowners//lib/codeowners/matcher/result.rb#63
  def owners_for_path(path); end

  # source://codeowners//lib/codeowners/matcher/result.rb#50
  def paths_for_owner(owner_identifier); end

  # source://codeowners//lib/codeowners/matcher/result.rb#25
  def rules_by_owner; end

  # Returns the value of attribute rules_by_path.
  #
  # source://codeowners//lib/codeowners/matcher/result.rb#9
  def rules_by_path; end

  private

  # Returns the value of attribute owner_resolver.
  #
  # source://codeowners//lib/codeowners/matcher/result.rb#76
  def owner_resolver; end

  # source://codeowners//lib/codeowners/matcher/result.rb#78
  def resolve_many(owner_identifiers); end
end

# source://codeowners//lib/codeowners/matcher/rule_graph.rb#5
class Codeowners::Matcher::RuleGraph
  # @return [RuleGraph] a new instance of RuleGraph
  #
  # source://codeowners//lib/codeowners/matcher/rule_graph.rb#8
  def initialize(rules, owner_resolver); end

  # source://codeowners//lib/codeowners/matcher/rule_graph.rb#13
  def match(*paths); end

  # Returns the value of attribute rules.
  #
  # source://codeowners//lib/codeowners/matcher/rule_graph.rb#6
  def rules; end
end

# This is a revision of the original parser to support a number of new cases:
#
# * Allow almost all characters in a path, and establish a pattern for character escapes.
# * ReDOS prevention via limitation of wildcard characters.
# * Disallow NUL bytes explicitly.
#
# source://codeowners//lib/codeowners/multibyte_parser.rb#13
class Codeowners::MultibyteParser
  # source://codeowners//lib/codeowners/multibyte_parser.rb#36
  def parse(str, options = T.unsafe(nil)); end

  # Returns the value of attribute rules.
  #
  # source://codeowners//lib/codeowners/multibyte_parser.rb#34
  def rules; end

  # source://codeowners//lib/codeowners/multibyte_parser.rb#36
  def scan_str(str, options = T.unsafe(nil)); end

  protected

  # source://codeowners//lib/codeowners/multibyte_parser.rb#217
  def build_error(kind, suggestion = T.unsafe(nil), column: T.unsafe(nil)); end

  # source://codeowners//lib/codeowners/multibyte_parser.rb#229
  def column_for_pattern(pattern, position, expression); end

  # source://codeowners//lib/codeowners/multibyte_parser.rb#193
  def continue_to_next_line; end

  # source://codeowners//lib/codeowners/multibyte_parser.rb#208
  def current_column(pos = T.unsafe(nil)); end

  # source://codeowners//lib/codeowners/multibyte_parser.rb#233
  def lines; end

  # source://codeowners//lib/codeowners/multibyte_parser.rb#212
  def record_error(*args, **kwargs, &block); end

  # source://codeowners//lib/codeowners/multibyte_parser.rb#203
  def record_rule(pattern, owners); end

  # source://codeowners//lib/codeowners/multibyte_parser.rb#189
  def wildcard_limit; end

  private

  # source://codeowners//lib/codeowners/multibyte_parser.rb#181
  def parse_owner(identifier); end

  # source://codeowners//lib/codeowners/multibyte_parser.rb#129
  def parse_pattern(pattern); end

  # source://codeowners//lib/codeowners/multibyte_parser.rb#66
  def process_line; end
end

# source://codeowners//lib/codeowners/multibyte_parser.rb#14
Codeowners::MultibyteParser::BOM = T.let(T.unsafe(nil), Regexp)

# source://codeowners//lib/codeowners/multibyte_parser.rb#19
Codeowners::MultibyteParser::END_OF_LINE = T.let(T.unsafe(nil), Regexp)

# source://codeowners//lib/codeowners/multibyte_parser.rb#18
Codeowners::MultibyteParser::NEW_LINE = T.let(T.unsafe(nil), Regexp)

# source://codeowners//lib/codeowners/multibyte_parser.rb#17
Codeowners::MultibyteParser::NULL_BYTE = T.let(T.unsafe(nil), String)

# source://codeowners//lib/codeowners/multibyte_parser.rb#28
Codeowners::MultibyteParser::OWNER_FORMAT = T.let(T.unsafe(nil), Regexp)

# source://codeowners//lib/codeowners/multibyte_parser.rb#24
Codeowners::MultibyteParser::PATTERN_PARTIAL_FORMAT = T.let(T.unsafe(nil), Regexp)

# source://codeowners//lib/codeowners/multibyte_parser.rb#23
Codeowners::MultibyteParser::PATTERN_TERMINATOR = T.let(T.unsafe(nil), Regexp)

# source://codeowners//lib/codeowners/multibyte_parser.rb#15
Codeowners::MultibyteParser::TOO_MANY_STARS = T.let(T.unsafe(nil), Regexp)

# source://codeowners//lib/codeowners/multibyte_parser.rb#21
Codeowners::MultibyteParser::UNESCAPED_BRACKET = T.let(T.unsafe(nil), Regexp)

# source://codeowners//lib/codeowners/multibyte_parser.rb#20
Codeowners::MultibyteParser::UNESCAPED_SLASH = T.let(T.unsafe(nil), Regexp)

# source://codeowners//lib/codeowners/multibyte_parser.rb#22
Codeowners::MultibyteParser::WHITESPACE = T.let(T.unsafe(nil), Regexp)

# source://codeowners//lib/codeowners/multibyte_parser.rb#16
Codeowners::MultibyteParser::WILDCARD_LIMIT = T.let(T.unsafe(nil), Integer)

# source://codeowners//lib/codeowners/owner.rb#3
class Codeowners::Owner
  include ::Comparable

  # @return [Owner] a new instance of Owner
  #
  # source://codeowners//lib/codeowners/owner.rb#15
  def initialize(identifier); end

  # source://codeowners//lib/codeowners/owner.rb#36
  def <=>(other); end

  # @return [Boolean]
  #
  # source://codeowners//lib/codeowners/owner.rb#20
  def email?; end

  # @return [Boolean]
  #
  # source://codeowners//lib/codeowners/owner.rb#40
  def eql?(other); end

  # source://codeowners//lib/codeowners/owner.rb#44
  def hash; end

  # Returns the value of attribute identifier.
  #
  # source://codeowners//lib/codeowners/owner.rb#13
  def identifier; end

  # Returns the value of attribute source_locations.
  #
  # source://codeowners//lib/codeowners/owner.rb#13
  def source_locations; end

  # @return [Boolean]
  #
  # source://codeowners//lib/codeowners/owner.rb#28
  def teamname?; end

  # source://codeowners//lib/codeowners/owner.rb#32
  def to_s; end

  # @return [Boolean]
  #
  # source://codeowners//lib/codeowners/owner.rb#24
  def username?; end
end

# source://codeowners//lib/codeowners/owner.rb#8
Codeowners::Owner::EMAIL = T.let(T.unsafe(nil), Regexp)

# source://codeowners//lib/codeowners/owner.rb#6
class Codeowners::Owner::SourceLocation < ::Struct
  # Returns the value of attribute column
  #
  # @return [Object] the current value of column
  def column; end

  # Sets the attribute column
  #
  # @param value [Object] the value to set the attribute column to.
  # @return [Object] the newly set value
  def column=(_); end

  # Returns the value of attribute line
  #
  # @return [Object] the current value of line
  def line; end

  # Sets the attribute line
  #
  # @param value [Object] the value to set the attribute line to.
  # @return [Object] the newly set value
  def line=(_); end

  class << self
    def [](*_arg0); end
    def inspect; end
    def keyword_init?; end
    def members; end
    def new(*_arg0); end
  end
end

# source://codeowners//lib/codeowners/owner.rb#11
Codeowners::Owner::TEAMNAME = T.let(T.unsafe(nil), Regexp)

# TODO Use same regexes we do in dotcom
#
# source://codeowners//lib/codeowners/owner.rb#10
Codeowners::Owner::USERNAME = T.let(T.unsafe(nil), Regexp)

# source://codeowners//lib/codeowners/owner_resolver.rb#5
class Codeowners::OwnerResolver
  # @return [OwnerResolver] a new instance of OwnerResolver
  #
  # source://codeowners//lib/codeowners/owner_resolver.rb#6
  def initialize; end

  # source://codeowners//lib/codeowners/owner_resolver.rb#10
  def register_owners(owners_list); end

  # The resolve method is here so that subclasses of OwnerResolver can override this method.
  # An example give would be of an implementation where a resolved owner is an active record object.
  #
  # source://codeowners//lib/codeowners/owner_resolver.rb#18
  def resolve(owner_identifier); end

  # source://codeowners//lib/codeowners/owner_resolver.rb#22
  def resolve_many(owner_identifiers); end

  # Subclasses should override this method to provide more context-specific
  # information.
  #
  # source://codeowners//lib/codeowners/owner_resolver.rb#28
  def suggestion_for_unresolved_owner(_owner); end
end

# source://codeowners//lib/codeowners/parser.rb#7
class Codeowners::Parser
  # Returns the value of attribute lineno.
  #
  # source://codeowners//lib/codeowners/parser.rb#11
  def lineno; end

  # source://codeowners//lib/codeowners/parser.rb#14
  def parse(str, *_arg1); end

  # Returns the value of attribute rules.
  #
  # source://codeowners//lib/codeowners/parser.rb#12
  def rules; end

  # source://codeowners//lib/codeowners/parser.rb#14
  def scan_str(str, *_arg1); end

  private

  # source://codeowners//lib/codeowners/parser.rb#49
  def _next_owner_token; end

  # source://codeowners//lib/codeowners/parser.rb#60
  def _next_token; end

  # source://codeowners//lib/codeowners/parser.rb#133
  def build_error(kind, suggestion = T.unsafe(nil), col: T.unsafe(nil)); end

  # source://codeowners//lib/codeowners/parser.rb#157
  def current_column(pos = T.unsafe(nil)); end

  # source://codeowners//lib/codeowners/parser.rb#152
  def next_line; end

  # source://codeowners//lib/codeowners/parser.rb#38
  def next_token; end

  # source://codeowners//lib/codeowners/parser.rb#129
  def record_error(*args, **kwargs, &block); end

  # source://codeowners//lib/codeowners/parser.rb#124
  def record_rule(pattern, owners); end

  # source://codeowners//lib/codeowners/parser.rb#147
  def skip_to_next_line; end

  # source://codeowners//lib/codeowners/parser.rb#103
  def validate_pattern(pattern); end
end

# source://codeowners//lib/codeowners/parser.rb#8
Codeowners::Parser::BOM = T.let(T.unsafe(nil), Regexp)

# source://codeowners//lib/codeowners/parser.rb#46
Codeowners::Parser::OWNER_RE = T.let(T.unsafe(nil), Regexp)

# source://codeowners//lib/codeowners/parser.rb#47
Codeowners::Parser::PATTERN_RE = T.let(T.unsafe(nil), Regexp)

# source://codeowners//lib/codeowners/parser.rb#9
Codeowners::Parser::TOO_MANY_STARS = T.let(T.unsafe(nil), Regexp)

# source://codeowners//lib/codeowners/pattern.rb#5
class Codeowners::Pattern
  # @return [Pattern] a new instance of Pattern
  #
  # source://codeowners//lib/codeowners/pattern.rb#8
  def initialize(pattern); end

  # @return [Boolean]
  #
  # source://codeowners//lib/codeowners/pattern.rb#12
  def match?(path); end

  # Returns the value of attribute pattern.
  #
  # source://codeowners//lib/codeowners/pattern.rb#6
  def pattern; end

  # source://codeowners//lib/codeowners/pattern.rb#21
  def to_s; end
end

# source://codeowners//lib/codeowners/rule.rb#3
class Codeowners::Rule
  # @return [Rule] a new instance of Rule
  #
  # source://codeowners//lib/codeowners/rule.rb#6
  def initialize(line, pattern, owners); end

  # source://codeowners//lib/codeowners/rule.rb#20
  def <=>(other); end

  # source://codeowners//lib/codeowners/rule.rb#12
  def ==(other); end

  # @return [Boolean]
  #
  # source://codeowners//lib/codeowners/rule.rb#24
  def eql?(other); end

  # source://codeowners//lib/codeowners/rule.rb#28
  def hash; end

  # Returns the value of attribute line.
  #
  # source://codeowners//lib/codeowners/rule.rb#4
  def line; end

  # Returns the value of attribute owners.
  #
  # source://codeowners//lib/codeowners/rule.rb#4
  def owners; end

  # Returns the value of attribute pattern.
  #
  # source://codeowners//lib/codeowners/rule.rb#4
  def pattern; end
end

# source://codeowners//lib/codeowners/source_error.rb#4
class Codeowners::SourceError
  # @return [SourceError] a new instance of SourceError
  #
  # source://codeowners//lib/codeowners/source_error.rb#18
  def initialize(kind:, line:, column:, source:, suggestion:, end_column: T.unsafe(nil)); end

  # Returns the value of attribute column.
  #
  # source://codeowners//lib/codeowners/source_error.rb#16
  def column; end

  # Returns the value of attribute end_column.
  #
  # source://codeowners//lib/codeowners/source_error.rb#16
  def end_column; end

  # Returns the value of attribute kind.
  #
  # source://codeowners//lib/codeowners/source_error.rb#16
  def kind; end

  # Returns the value of attribute line.
  #
  # source://codeowners//lib/codeowners/source_error.rb#16
  def line; end

  # source://codeowners//lib/codeowners/source_error.rb#27
  def message; end

  # Returns the value of attribute source.
  #
  # source://codeowners//lib/codeowners/source_error.rb#16
  def source; end

  # Returns the value of attribute suggestion.
  #
  # source://codeowners//lib/codeowners/source_error.rb#16
  def suggestion; end

  # source://codeowners//lib/codeowners/source_error.rb#27
  def to_s; end

  class << self
    # source://codeowners//lib/codeowners/source_error.rb#5
    def unknown_owner(owner:, source_location:, source:, suggestion: T.unsafe(nil)); end
  end
end

# source://codeowners//lib/codeowners/tree.rb#6
class Codeowners::Tree
  # @return [Tree] a new instance of Tree
  #
  # source://codeowners//lib/codeowners/tree.rb#73
  def initialize; end

  # source://codeowners//lib/codeowners/tree.rb#79
  def insert(path); end

  # source://codeowners//lib/codeowners/tree.rb#94
  def match(input); end

  protected

  # source://codeowners//lib/codeowners/tree.rb#140
  def match_filename(input); end

  # source://codeowners//lib/codeowners/tree.rb#121
  def match_path(segments); end
end

# Regexp to check whether a string contains a special glob or escape character
#
# source://codeowners//lib/codeowners/tree.rb#8
Codeowners::Tree::GLOB_OR_ESCAPE_CHECK = T.let(T.unsafe(nil), Regexp)

# A single node in the tree.
#
# source://codeowners//lib/codeowners/tree.rb#11
class Codeowners::Tree::Node
  # @return [Node] a new instance of Node
  #
  # source://codeowners//lib/codeowners/tree.rb#15
  def initialize; end

  # Returns the value of attribute children.
  #
  # source://codeowners//lib/codeowners/tree.rb#13
  def children; end

  # @yield [value]
  #
  # source://codeowners//lib/codeowners/tree.rb#60
  def each_value; end

  # source://codeowners//lib/codeowners/tree.rb#20
  def insert(segment); end

  # source://codeowners//lib/codeowners/tree.rb#24
  def lookup(segment); end

  # source://codeowners//lib/codeowners/tree.rb#28
  def match(segments, pos); end

  # Returns the value of attribute value.
  #
  # source://codeowners//lib/codeowners/tree.rb#12
  def value; end

  # Sets the attribute value
  #
  # @param value the value to set the attribute value to.
  #
  # source://codeowners//lib/codeowners/tree.rb#12
  def value=(_arg0); end
end

# source://codeowners//lib/codeowners/version.rb#3
Codeowners::VERSION = T.let(T.unsafe(nil), String)
