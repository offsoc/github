require "codeowners"
require "minitest/spec"
require "minitest/autorun"

class FakeParser
  def scan_str(*)
    return [[:test], [:oops]]
  end
end

class SelectiveResolver
  def initialize(acceptable_identifiers:)
    @acceptable_identifiers = acceptable_identifiers
  end

  def register_owners(_)
  end

  def resolve(owner_identifier)
    if @acceptable_identifiers.include?(owner_identifier)
      owner_identifier
    end
  end

  def suggestion_for_unresolved_owner(_)
  end
end

class SuggestingResolver
  def initialize(&block)
    @block = block
  end

  def register_owners(_)
  end

  def resolve(_)
    nil
  end

  def suggestion_for_unresolved_owner(owner)
    @block.call(owner)
  end
end

describe Codeowners::File do
  it "uses the given parser implementation" do
    file = Codeowners::File.new("* @monalisa\n", parser_class: FakeParser)

    assert_equal [:test], file.rules
    assert_equal [:oops], file.errors
  end

  [Codeowners::Parser, Codeowners::MultibyteParser].each do |parser_class|
    describe parser_class.to_s do
      it "parses the file contents" do
        file = Codeowners::File.new("* @monalisa\n", parser_class: parser_class)

        assert_empty file.errors
        assert_equal 1, file.rules.length
        rule = file.rules.first
        assert_equal 1, rule.line
        assert_equal "*", rule.pattern.to_s
        assert_equal ["@monalisa"], rule.owners.map(&:identifier)
      end

      it "returns the same Result from build_empty_result" do
        file = Codeowners::File.new("* @monalisa\n", parser_class: parser_class)

        result_one = file.match("README.md")

        result_two = file.build_empty_result

        assert_equal result_one.class, result_two.class
      end

      describe "#owner_errors" do
        it "returns errors for any owners who cannot be resolved" do
          resolver = SelectiveResolver.new(acceptable_identifiers: "@known")
          file = Codeowners::File.new(<<~CODEOWNERS, owner_resolver: resolver, parser_class: parser_class)
            yes/* @known
            no/*  @unknown
          CODEOWNERS

          errors = file.owner_errors

          assert_equal 1, errors.size
          error = errors.first
          assert_equal "Unknown owner", error.kind
          assert_equal 2, error.line
          assert_equal 7, error.column
          assert_equal 14, error.end_column
          assert_equal "no/*  @unknown\n", error.source
        end

        it "returns multiple errors for the same line" do
          resolver = SelectiveResolver.new(acceptable_identifiers: "@known")
          file = Codeowners::File.new(<<~CODEOWNERS, owner_resolver: resolver, parser_class: parser_class)
            * @nope @unknown
          CODEOWNERS

          errors = file.owner_errors

          assert_equal 2, errors.size
          first_error, second_error = errors.sort_by(&:column)

          assert_equal "Unknown owner", first_error.kind
          assert_equal 1, first_error.line
          assert_equal 3, first_error.column
          assert_equal 7, first_error.end_column
          assert_equal "* @nope @unknown\n", first_error.source

          assert_equal "Unknown owner", second_error.kind
          assert_equal 1, second_error.line
          assert_equal 9, second_error.column
          assert_equal 16, second_error.end_column
          assert_equal "* @nope @unknown\n", second_error.source
        end

        it "returns one error per user location" do
          resolver = SelectiveResolver.new(acceptable_identifiers: "@known")
          file = Codeowners::File.new(<<~CODEOWNERS, owner_resolver: resolver, parser_class: parser_class)
            yes/* @known
            no/*  @unknown
            nah/*  @unknown
          CODEOWNERS

          errors = file.owner_errors

          assert_equal 2, errors.size
          first_error, second_error = errors.sort_by(&:line)

          assert_equal "Unknown owner", first_error.kind
          assert_equal 2, first_error.line
          assert_equal 7, first_error.column
          assert_equal 14, first_error.end_column
          assert_equal "no/*  @unknown\n", first_error.source

          assert_equal "Unknown owner", second_error.kind
          assert_equal 3, second_error.line
          assert_equal 8, second_error.column
          assert_equal 15, second_error.end_column
          assert_equal "nah/*  @unknown\n", second_error.source
        end

        it "uses an error suggestion from the owner resolver" do
          resolver = SuggestingResolver.new do |owner|
            "make sure #{owner.identifier} is real and stuff"
          end
          file = Codeowners::File.new(<<~CODEOWNERS, owner_resolver: resolver, parser_class: parser_class)
            * @unknown
          CODEOWNERS

          errors = file.owner_errors

          assert_equal 1, errors.size
          assert_equal "make sure @unknown is real and stuff", errors.first.suggestion
        end

        it "does not raise for patterns with unusual characters" do
          resolver = SelectiveResolver.new(acceptable_identifiers: "@known")
          file = Codeowners::File.new(<<~CODEOWNERS, owner_resolver: resolver, parser_class: parser_class)
            /pattern has-spaces-starts-with-slash-and-has[brackets]-and-*
            with-\[escaped\]brackets
          CODEOWNERS

          file.match(
            ["who/cares"],
            matcher: Codeowners::Matcher::PathTree
          )
        end
      end
    end
  end
end
