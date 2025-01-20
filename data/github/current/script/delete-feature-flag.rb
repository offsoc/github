#!/usr/bin/env ruby
#/ Usage: script/delete-feature-flag <feature-flag-name>
# frozen_string_literal: true

require "rubocop"
require "rubocop-ast"

class FeatureFlagTerminator
  def initialize(feature_flag)
    @feature_flag = feature_flag

    @contains_enabled_regexp = %r{
      GitHub\.flipper\[:#{feature_flag}\].enabled\?
      |\w+.?user_feature_enabled\?[\(\s]:#{feature_flag}\)?
      |feature_enabled_globally_or_for_current_user\?[\(\s]?:#{feature_flag}\)?
      |feature_enabled_for_user_or_current_visitor\?[\(\s]feature_name:\s?:#{feature_flag}\)?
      |feature_enabled_globally_or_for_user\?[\(\s]feature_name:\s?:#{feature_flag}\)?
      |feature_preview_enabled\?\(:#{feature_flag}?
      |.*feature_enabled\?\(:#{feature_flag}?
    }x

    @starts_with_enabled_regexp = /^#{@contains_enabled_regexp}/
  end

  def delete_from_ruby_code(code)
    @lines_to_delete = []
    @lines_to_indent = []

    begin
      source = RuboCop::ProcessedSource.new(code, RUBY_VERSION.to_f)
    rescue ArgumentError => e
      raise e unless e.message.match? /RuboCop found unknown Ruby version/
      source = RuboCop::ProcessedSource.new(code, stable_ruby_version.to_f)
    end
    @rewriter = Parser::Source::TreeRewriter.new(source.buffer)

    source.ast.each_node do |node|
      if flag_enabled_node?(node)
        rewrite_flag_enabled_node(node)
      elsif action = toggle_node?(node)
        if action == "enable"
          delete_code(node.loc.expression)
        else
          @rewriter.replace(node.loc.expression, "# DELETED: #{node.source}")
        end
      end
    end

    format_output
  end

  def delete_from_erb_template(code)
    code.gsub(@contains_enabled_regexp, "true")
  end

  private

  def send_type?(node)
    node.send_type? || node.csend_type?
  end

  def flag_enabled_node?(node)
    return false unless send_type?(node) # quick check to avoid using regexps in every node
    @starts_with_enabled_regexp.match(node.source)
  end

  def rewrite_flag_enabled_node(node)
    parent = node.parent
    if (parent.and_type? || parent.or_type?) && parent.children.size == 2
      rewrite_flag_enabled_node_binary_bool_expression(node)
    elsif parent.if_type?
      if parent.if?
        rewrite_flag_enabled_if(node)
      elsif parent.unless?
        rewrite_flag_enabled_unless(node)
      end
    else
      @rewriter.replace(node.loc.expression, "true")
    end
  end

  def rewrite_flag_enabled_node_binary_bool_expression(node)
    parent = node.parent
    # For && or || expression with only two items, we want to only leave the other item
    other = parent.children.first == node ? parent.children.last : parent.children.first
    # If the expression was around (), we want to delete them too
    parent = parent.parent if parent.parent.begin_type?
    @rewriter.replace(parent.loc.expression, other.source)
  end

  def rewrite_flag_enabled_if(node)
    parent = node.parent
    # For an IF with just the FF check, we want to delete the expression and the ELSE
    delete_code(parent.loc.keyword, parent.children.first.loc.expression)

    if parent.loc.respond_to?(:else) && parent.loc.else
      delete_code(parent.loc.else, parent.loc.end)
      add_lines_to_indent(parent.loc.expression.line + 1, parent.loc.else.line - 1)
    elsif parent.loc.end
      delete_code(parent.loc.end)
      add_lines_to_indent(parent.loc.expression.line + 1, parent.loc.end.line - 1)
    end
  end

  def rewrite_flag_enabled_unless(node)
    parent = node.parent
    # For an UNLESS with just the FF check, we want to delete the expression and the first block
    if parent.loc.respond_to?(:else) && parent.loc.else
      delete_code(parent.loc.expression, parent.loc.else)
      delete_code(parent.loc.end)
      add_lines_to_indent(parent.loc.else.line + 1, parent.loc.end.line - 1)
    else
      delete_code(parent.loc.expression)
    end
  end

  def toggle_node?(node)
    return false unless send_type?(node) # quick check to avoid using regexps in every node
    regexes = [
      /^GitHub\.flipper\[:(?<flag>\w+)\].(?<action>enable|disable)/,
      /.*(?<action>enable|disable)_feature\(:(?<flag>\w+)\)/,
    ]
    match = regexes.lazy.filter_map { |regex| regex.match(node.source) }.first
    return false if match.nil?
    return match[:action] if match[:flag] == @feature_flag
    false
  end

  def delete_code(from, to = from)
    range = Parser::Source::Range.new(@rewriter.source_buffer, from.begin_pos, to.end_pos)
    @rewriter.replace(range, empty_lines(to.line - from.line))
    add_lines_to_delete(from.line, to.line)
  end

  def empty_lines(n)
    " \n" * n
  end

  def add_lines(arr, from, to)
    while from <= to
      arr.unshift(from)
      from += 1
    end
  end

  def add_lines_to_delete(from, to)
    add_lines(@lines_to_delete, from, to)
  end

  def add_lines_to_indent(from, to)
    add_lines(@lines_to_indent, from, to)
  end

  def format_output
    lines = @rewriter.process.split("\n")
    lines << ""
    @lines_to_indent.each do |line|
      lines[line - 1] = lines[line - 1].delete_prefix "  "
    end
    @lines_to_delete.each do |line|
      previous_line = lines[line - 1]
      lines.delete_at(line - 1) if previous_line&.strip&.empty?
    end
    lines.join("\n")
  end

  def stable_ruby_version
    /^(?<major>\d+)\.(?<minor>\d+)\./ =~ RUBY_VERSION
    if RUBY_DESCRIPTION.match? /dev/
      if minor.to_i != 0
        minor = (minor.to_i - 1).to_s
        "#{major}.#{minor}"
      else
        raise NotImplementedError
        # It's not possible to predict what will be the last supported ruby 3.X minor version
        # before ruby gets the next major upgrade to 4.X
        # if you hit this error feel free to delete the `raise`,
        # hardcode the most recent minor 3.X version and uncomment the lines below:
        # major = (major.to_i - 1).to_s
        # minor = "?"
      end
    else
      RUBY_VERSION
    end
  end
end

if __FILE__ == $0
  feature_flag = ARGV.shift

  patterns = [/:#{feature_flag}/]
  dirs = %w[test app config jobs lib packages]

  terminator = FeatureFlagTerminator.new(feature_flag)

  pattern_args = patterns.flat_map { |pattern| ["-e", pattern.respond_to?(:source) ? pattern.source : pattern] }
  args = %w[
    --files-with-matches
    --no-index
    --extended-regexp
    --word-regexp
  ]
  cmd = ["git", "grep", *args, *pattern_args, "--", *dirs]

  paths = IO.popen(cmd).read.split("\n")
  paths.each do |path|
    puts "Processing #{path}"
    code = File.open(path).read
    if path.end_with? ".rb"
      File.write(path, terminator.delete_from_ruby_code(code))
    elsif path.end_with? ".erb"
      File.write(path, terminator.delete_from_erb_template(code))
    else
      puts "Unsupported file format #{path}"
    end
  end
end
