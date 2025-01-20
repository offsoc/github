# frozen_string_literal: true

require "strscan"

require "codeowners/source_error"

class Codeowners::Parser
  BOM = /\uFEFF/
  TOO_MANY_STARS = /\*{3,}/

  attr_reader :lineno
  attr_reader :rules

  def parse(str, *)
    @lineno =  1
    @line_pos = 0
    @rules = []
    @errors = []
    @owners = {}

    @ss = StringScanner.new(str)
    @ss.skip(BOM)
    while !@ss.eos?
      _next_token
    end
    @rules.reverse!
    [@rules, @errors]
  rescue => error
    [
      [],
      [build_error("Fatal error", error.message, col: 1)]
    ]
  end
  alias scan_str parse

  private

  def next_token
    return if @ss.eos?

    # skips empty actions
    until token = _next_token or @ss.eos?; end
    token
  end

  OWNER_RE = /[A-Z0-9a-z\._'%\+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,6}|@[a-zA-Z0-9\-]+\/[a-zA-Z0-9_\-]+|@[a-zA-Z0-9\-\_]+/
  PATTERN_RE = /(?:[a-zA-Z0-9_\-\+\*\?\.\/@\(\)](?:\\ )*)+/

  def _next_owner_token
    col = current_column
    line = @lineno

    if (identifier = @ss.scan(OWNER_RE))
      owner = (@owners[identifier] ||= Codeowners::Owner.new(identifier))
      owner.source_locations << Codeowners::Owner::SourceLocation.new(line, col)
      owner
    end
  end

  def _next_token
    if @ss.skip(/\r?\n/)
      next_line
      return
    end

    if pattern = @ss.scan(PATTERN_RE)
      unless validate_pattern(pattern)
        skip_to_next_line
        return
      end

      @ss.skip(/[ \t]+/) # FIXME: apparently not required?

      owners = []
      while true
        owner = _next_owner_token
        owners << owner if owner

        if @ss.skip(/(?:#.*)?\r?\n/) || @ss.eos?
          record_rule(pattern, owners)
          next_line
          return
        elsif @ss.skip(/[ \t]+/)
          # likely more owners
        else
          record_error("Invalid owner")
          skip_to_next_line
          return
        end
      end
      # unreachable
    elsif @ss.skip(/#/)
      # comment line
      skip_to_next_line
    elsif @ss.skip(/[ \t]+/)
      # leading whitespace
    else
      record_error("Invalid pattern")
      skip_to_next_line
    end
  end

  def validate_pattern(pattern)
    if pattern == "/"
      record_error(
        "Warning",
        "the pattern `/` will never match any files - did you mean `*` instead?",
        col: current_column(@ss.pos - pattern.length),
      )
      false
    elsif pattern.match?(TOO_MANY_STARS)
      alternative = pattern.gsub(TOO_MANY_STARS, "**")
      record_error(
        "Invalid pattern",
        "did you mean `#{alternative}` instead?",
        col: current_column(@ss.pos - pattern.length),
      )
      false
    else
      true
    end
  end

  def record_rule(pattern, owners)
    pattern = Codeowners::Pattern.new(pattern)
    @rules << Codeowners::Rule.new(@lineno, pattern, owners.uniq)
  end

  def record_error(*args, **kwargs, &block)
    @errors << build_error(*args, **kwargs, &block)
  end

  def build_error(kind, suggestion = nil, col: nil)
    source = if defined?(@ss) && @ss
      @ss.string.lines[@lineno - 1]
    end

    Codeowners::SourceError.new(
      kind: kind,
      line: @lineno,
      column: col || current_column,
      source: source,
      suggestion: suggestion
    )
  end

  def skip_to_next_line
    @ss.skip_until(/\n/) || @ss.terminate
    next_line
  end

  def next_line
    @lineno += 1
    @line_pos = @ss.pos
  end

  def current_column(pos = @ss.pos)
    pos - @line_pos + 1
  end
end
