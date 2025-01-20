require "codeowners"
require "minitest/spec"
require "minitest/autorun"
require "shared_parser_test.rb"

describe Codeowners::Parser do
  include SharedParserTest
  before do
    @owners = <<~OWNERS
      # Global owners
      *                     user@example.com @global @global_user

      # Frontend
      *.js @org/js
      app/assets/**/*.deps @org/js

      # Docs
      README                @org/copy @org/copy
      /docs                 @org/copy
    OWNERS
  end

  it "parses" do
    @parser = Codeowners::Parser.new
    rules, errors = @parser.scan_str(@owners)

    assert_equal 5, rules.count
    assert_empty errors

    assert rule = rules.shift
    assert_equal 10, rule.line
    assert_equal "/docs", rule.pattern.to_s
    assert_equal ["@org/copy"], rule.owners.map(&:identifier)

    assert rule = rules.shift
    assert_equal 9, rule.line
    assert_equal "README", rule.pattern.to_s
    assert_equal ["@org/copy"], rule.owners.map(&:identifier)

    assert rule = rules.shift
    assert_equal 6, rule.line
    assert_equal "app/assets/**/*.deps", rule.pattern.to_s
    assert_equal ["@org/js"], rule.owners.map(&:identifier)

    assert rule = rules.shift
    assert_equal 5, rule.line
    assert_equal "*.js", rule.pattern.to_s
    assert_equal ["@org/js"], rule.owners.map(&:identifier)

    assert rule = rules.shift
    assert_equal 2, rule.line
    assert_equal "*", rule.pattern.to_s
    assert_equal ["user@example.com", "@global", "@global_user"], rule.owners.map(&:identifier)
  end

  it "records the source locations of owners" do
    @parser = Codeowners::Parser.new
    rules, _ = @parser.scan_str(@owners)

    owners_by_identifier = rules
      .flat_map(&:owners)
      .map { |owner| [owner.identifier, owner] }
      .to_h

    user_locations = owners_by_identifier["user@example.com"].source_locations
    assert_equal [2], user_locations.map(&:line)
    assert_equal [23], user_locations.map(&:column)

    org_locations = owners_by_identifier["@org/js"].source_locations
    assert_equal [5, 6], org_locations.map(&:line)
    assert_equal [6, 22], org_locations.map(&:column)
  end

  it "parses files without a trailing newline" do
    @parser = Codeowners::Parser.new
    rules, errors = @parser.scan_str("* @global")

    assert_equal 1, rules.count
    assert_empty errors
    assert_equal "*", rules.first.pattern.to_s
  end

  it "parses empty files" do
    @parser = Codeowners::Parser.new
    rules, errors = @parser.scan_str("")

    refute_nil rules
    assert_empty errors
    assert_equal 0, rules.count
  end

  it "parses comments correctly" do
    @parser = Codeowners::Parser.new
    rules, errors = @parser.scan_str(<<~CODEOWNERS)
      # This is a comment.

      # Below is a commented out rule
      #*  @owner

      *   @other-owner # This is a trailing comment
    CODEOWNERS

    refute_nil rules
    assert_empty errors
    assert_equal 1, rules.count
  end

  it "supports '@' symbols in file patterns" do
    @parser = Codeowners::Parser.new
    rules, errors = @parser.scan_str(<<~CODEOWNERS)
      applet@json/   @applet-owner
    CODEOWNERS

    refute_nil rules
    assert_empty errors
    assert_equal 1, rules.count
    assert_equal "applet@json/", rules.first.pattern.to_s
  end

  it "supports '+' symbols in file patterns" do
    @parser = Codeowners::Parser.new
    rules, errors = @parser.scan_str(<<~CODEOWNERS)
      ++foo     @owner
      foo+bar/  @owner
    CODEOWNERS

    refute_nil rules
    assert_empty errors
    assert_equal 2, rules.count
    assert_equal "foo+bar/", rules.shift.pattern.to_s
    assert_equal "++foo", rules.shift.pattern.to_s
  end

  it "supports escaped spaces in file patterns" do
    @parser = Codeowners::Parser.new
    rules, errors = @parser.scan_str(<<~'CODEOWNERS')
      foo\ bar     @owner
      foo\ bar/baz\ bam  @owner
    CODEOWNERS

    refute_nil rules
    assert_empty errors
    assert_equal 2, rules.count
    assert_equal 'foo\ bar/baz\ bam', rules.shift.pattern.to_s
    assert_equal 'foo\ bar', rules.shift.pattern.to_s
  end

  it "supports team names with underscores" do
    @parser = Codeowners::Parser.new
    rules, errors = @parser.scan_str(<<~CODEOWNERS)
      /docs     @org/team
      /app      @org/team_with_underscores
    CODEOWNERS
    refute_nil rules
    assert_empty errors
    assert_equal 2, rules.count

    assert rule = rules.shift
    assert_equal 2, rule.line
    assert_equal "/app", rule.pattern.to_s
    assert_equal ["@org/team_with_underscores"], rule.owners.map(&:identifier)

    assert rule = rules.shift
    assert_equal 1, rule.line
    assert_equal "/docs", rule.pattern.to_s
    assert_equal ["@org/team"], rule.owners.map(&:identifier)
  end

  it "supports user names with underscores" do
    @parser = Codeowners::Parser.new
    rules, errors = @parser.scan_str(<<~CODEOWNERS)
      /docs     @global
      /app      @global_user
    CODEOWNERS
    refute_nil rules
    assert_empty errors
    assert_equal 2, rules.count

    assert rule = rules.shift
    assert_equal 2, rule.line
    assert_equal "/app", rule.pattern.to_s
    assert_equal ["@global_user"], rule.owners.map(&:identifier)

    assert rule = rules.shift
    assert_equal 1, rule.line
    assert_equal "/docs", rule.pattern.to_s
    assert_equal ["@global"], rule.owners.map(&:identifier)
  end

  it "supports emails with single quote" do
    @parser = Codeowners::Parser.new

    assert_email_with_quote(@parser)
  end

  it "supports CRLF line endings" do
    @parser = Codeowners::Parser.new
    rules, errors = @parser.scan_str("foo @foo-team\r\nbar @bar-team")

    refute_nil rules
    assert_empty errors
    assert_equal 2, rules.count
    assert_equal "bar", rules.first.pattern.to_s
    assert_equal ["@bar-team"], rules.first.owners.map(&:identifier)
    assert_equal "foo", rules[1].pattern.to_s
    assert_equal ["@foo-team"], rules[1].owners.map(&:identifier)
  end

  it "supports no final newline" do
    @parser = Codeowners::Parser.new
    rules, errors = @parser.scan_str("foo @foo-team")

    refute_nil rules
    assert_empty errors
    assert_equal 1, rules.count
    rule = rules.first
    assert_equal "foo", rule.pattern.to_s
    assert_equal 1, rule.owners.count
    assert_equal "@foo-team", rule.owners.first.identifier
  end

  it "supports trailing comments with no final newline" do
    @parser = Codeowners::Parser.new
    rules, errors = @parser.scan_str("foo @foo-team\n\n# The end.")

    refute_nil rules
    assert_empty errors
    assert_equal 1, rules.count
  end

  it "supports trailing commented out rules with no final newline" do
    @parser = Codeowners::Parser.new
    rules, errors = @parser.scan_str("foo @foo-team\n\n# example @test")

    refute_nil rules
    assert_empty errors
    assert_equal 1, rules.count
  end

  it "supports input with a Unicode byte-order-mark" do
    @parser = Codeowners::Parser.new
    rules, errors = @parser.scan_str("\uFEFFfoo @foo-team\n")

    refute_nil rules
    assert_equal 1, rules.count
    assert_empty errors
    assert_equal "foo", rules.first.pattern.to_s
  end

  it "handles invalid owners" do
    @parser = Codeowners::Parser.new
    rules, errors = @parser.scan_str("foo ~~~~~")

    assert_empty rules
    assert_equal 1, errors.count
    assert_equal <<~ERROR.chomp, errors.first.to_s
      Invalid owner on line 1:

        foo ~~~~~
            ^
    ERROR

    assert_equal 1, errors.first.line
    assert_equal 5, errors.first.column
  end

  it "handles invalid patterns that contain illegal characters" do
    @parser = Codeowners::Parser.new
    rules, errors = @parser.scan_str("~~~~~ @foo")

    assert_empty rules
    assert_equal 1, errors.count
    assert_equal <<~ERROR.chomp, errors.first.to_s
      Invalid pattern on line 1:

        ~~~~~ @foo
        ^
    ERROR
    assert_equal 1, errors.first.line
    assert_equal 1, errors.first.column
  end

  it "handles invalid patterns that contain more than two consecutive * characters" do
    @parser = Codeowners::Parser.new
    rules, errors = @parser.scan_str("foo/*** @foo")

    assert_empty rules
    assert_equal 1, errors.count
    assert_equal <<~ERROR.chomp, errors.first.to_s
      Invalid pattern on line 1: did you mean `foo/**` instead?

        foo/*** @foo
        ^
    ERROR
    assert_equal 1, errors.first.line
    assert_equal 1, errors.first.column
  end

  it "handles the pattern /" do
    @parser = Codeowners::Parser.new
    rules, errors = @parser.scan_str("/ @foo")

    assert_empty rules
    assert_equal 1, errors.count
    assert_equal <<~ERROR.chomp, errors.first.to_s
      Warning on line 1: the pattern `/` will never match any files - did you mean `*` instead?

        / @foo
        ^
    ERROR
    assert_equal 1, errors.first.line
    assert_equal 1, errors.first.column
  end

  it "handles partly valid files" do
    @parser = Codeowners::Parser.new
    rules, errors = @parser.scan_str(<<~CODEOWNERS)
      foo ~~~~~
      foo.* @foo
      ~~~~ @foo
    CODEOWNERS

    assert_equal 1, rules.count
    assert_equal 2, errors.count
    assert_equal [1, 3], errors.map(&:line)
    assert_equal [5, 1], errors.map(&:column)
    assert_equal [2], rules.map(&:line)
  end

  it "handles exceptions" do
    @parser = Codeowners::Parser.new
    rules, errors = @parser.scan_str(42)

    assert_empty rules
    assert_equal 1, errors.count
  end
end
