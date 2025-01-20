# frozen_string_literal: true

require "strscan"

require "codeowners/source_error"

# This is a revision of the original parser to support a number of new cases:
#
# * Allow almost all characters in a path, and establish a pattern for character escapes.
# * ReDOS prevention via limitation of wildcard characters.
# * Disallow NUL bytes explicitly.
#
class Codeowners::MultibyteParser
  BOM = /\uFEFF/
  TOO_MANY_STARS = /\*{3,}/
  WILDCARD_LIMIT = 15
  NULL_BYTE = "\0"
  NEW_LINE = /\r?\n/
  END_OF_LINE = /#|#{NEW_LINE}/
  UNESCAPED_SLASH = /(?<!\\)\\[^ \\#\t\[\]]/
  UNESCAPED_BRACKET = /(?<!\\)\[|(?<!\\)\]/
  WHITESPACE = /[ \t]+/
  PATTERN_TERMINATOR = /\t| |\#|#{NEW_LINE}/
  PATTERN_PARTIAL_FORMAT = %r{
    #{PATTERN_TERMINATOR}|
    (?>!\\)\\(?!#{PATTERN_TERMINATOR}) # escaped non terminators
  }x
  OWNER_FORMAT = %r{
    [A-Z0-9a-z\._'%\+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,6}| # email
    @[a-zA-Z0-9\-]+\/[a-zA-Z0-9_\-]+| # org and user or group
    @[a-zA-Z0-9\-\_]+ # github login
  }x

  attr_reader :rules

  def parse(str, options = {})
    @line_number = 1
    @line_position = 0
    @rules = []
    @errors = []
    @owners = {}
    @options = options

    # In case we get a frozen string, we need to dupe it to be able to append a new line.
    str = str.dup if str.frozen?

    # Since we terminate on known characters, we need to ensure a newline at EOF.
    @ss = StringScanner.new(str)
    @ss.concat("\n")
    @ss.skip(BOM)

    process_line until @ss.eos?

    @rules.reverse!
    [@rules, @errors]
  rescue => error
    [
      [],
      [build_error("Fatal error", error.message, column: 1)]
    ]
  end
  alias scan_str parse

  private

  def process_line
    owners = []

    # Ignore leading whitespace.
    @ss.skip(WHITESPACE)

    # Git supports any file name natively supported by the file system. Because of this we can't know
    # for sure what types of file names aren't supported. Windows/Linux/Mac all have their own specific
    # disabled set.
    #
    # To deal with this we will search the string until we find the following terminators:
    #
    #  * new line (file pattern without owners)
    #  * unescaped space (file pattern with owners)
    #  * unescaped comment (line starting with #)
    match = +""

    while true
      # Capture until the first escapable character.
      partial = @ss.scan_until(PATTERN_PARTIAL_FORMAT)

      break unless partial

      match << partial

      # Since we hit a new line we can just automatically break.
      break if @ss.beginning_of_line?

      # If we have an incomplete amount of escape characters we can't continue.
      break if partial.count("\\") % 2 == 0
    end

    # If we can't parse the pattern we'll just skip the line.
    unless pattern = parse_pattern(match)
      continue_to_next_line
      return
    end

    # Move back one character because we're capturing the separator as part of our scan_until call.
    @ss.pos -= 1

    # Iteratively walk the rest of the line.
    while true
      if match = @ss.scan(OWNER_FORMAT)
        # We've captured a valid looking owner.
        owners << parse_owner(match.strip)
      elsif @ss.skip(END_OF_LINE) || @ss.eos?
        # We've reached the end of the line. Parse the data we have and continue.
        record_rule(pattern, owners.uniq)
        break
      elsif @ss.skip(WHITESPACE)
        # Skip over all whitespace and continue.
        next
      else
        # If we can't parse the owner we'll just skip the line.
        record_error("Invalid owner")
        break
      end
    end

    continue_to_next_line
  end

  def parse_pattern(pattern)
    return if pattern.nil?

    position = @ss.pos - pattern.bytesize
    pattern.chop!
    stripped_pattern = pattern.strip

    return if stripped_pattern.length == 0 || stripped_pattern.start_with?("#")

    if pattern == "/"
      record_error(
        "Warning",
        "the pattern `/` will never match any files - did you mean `*` instead?",
        column: current_column(position),
      )
    elsif pattern.match?(TOO_MANY_STARS)
      alternative = pattern.gsub(TOO_MANY_STARS, "**")
      record_error(
        "Invalid pattern",
        "did you mean `#{alternative}` instead?",
        column: column_for_pattern(pattern, position, TOO_MANY_STARS),
      )
    elsif pattern.include?(NULL_BYTE)
      record_error(
        "NUL character",
        "NUL characters are not allowed in patterns",
        column: column_for_pattern(pattern, position, NULL_BYTE),
      )
    elsif pattern.match?(UNESCAPED_SLASH)
      record_error(
        "Invalid pattern",
        "all `\\` characters must be escaped with another `\\` unless escaping: tab, space, #, [, ]",
        column: column_for_pattern(pattern, position, UNESCAPED_SLASH)
      )
    elsif pattern.match?(UNESCAPED_BRACKET)
      record_error(
        "Invalid pattern",
        "both `\[` and `\]` must be escaped with a `\\`",
        column: column_for_pattern(pattern, position, UNESCAPED_BRACKET)
      )
    elsif pattern.count("*") > wildcard_limit
      index = pattern.enum_for(:scan, /\*/).lazy.map { Regexp.last_match.begin(0) }.drop(wildcard_limit).first
      record_error(
        "Invalid pattern",
        "too many `*` characters, limit: #{wildcard_limit}",
        column: current_column(position) + index
      )
    else
      stripped_pattern
    end
  end

  def parse_owner(identifier)
    owner = (@owners[identifier] ||= Codeowners::Owner.new(identifier))
    owner.source_locations << Codeowners::Owner::SourceLocation.new(@line_number, current_column - identifier.bytesize)
    owner
  end

  protected

  def wildcard_limit
    @options[:wildcard_limit] || WILDCARD_LIMIT
  end

  def continue_to_next_line
    # Because we're delimiting on new lines, they can be captured by StringScanner. This behavior allows us to not skip lines by accident.
    unless @ss.beginning_of_line?
      @ss.skip_until(NEW_LINE) || @ss.terminate
    end

    @line_number += 1
    @line_position = @ss.pos
  end

  def record_rule(pattern, owners)
    pattern = Codeowners::Pattern.new(pattern)
    @rules << Codeowners::Rule.new(@line_number, pattern, owners.uniq)
  end

  def current_column(pos = @ss.pos)
    pos - @line_position + 1
  end

  def record_error(*args, **kwargs, &block)
    @errors << build_error(*args, **kwargs, &block)
    nil
  end

  def build_error(kind, suggestion = nil, column: nil)
    source = lines[@line_number - 1]

    Codeowners::SourceError.new(
      kind: kind,
      line: @line_number,
      column: column || current_column,
      source: source,
      suggestion: suggestion
    )
  end

  def column_for_pattern(pattern, position, expression)
    current_column(position + (pattern[0..pattern.index(expression)].bytesize) - 1)
  end

  def lines
    @lines ||= if defined?(@ss) && @ss
      @ss.string.lines
    else
      []
    end
  end
end
