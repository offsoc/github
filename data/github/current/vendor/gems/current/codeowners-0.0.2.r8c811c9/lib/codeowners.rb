# frozen_string_literal: true
require "codeowners/version"
require "codeowners/pattern"
require "codeowners/owner"
require "codeowners/owner_resolver"
require "codeowners/rule"
require "codeowners/parser"
require "codeowners/multibyte_parser"
require "codeowners/source_error"
require "codeowners/tree"
require "codeowners/matcher"
require "codeowners/matcher/result"

module Codeowners
  class File
    attr_reader :contents, :rules, :errors

    def initialize(contents,
                   owner_resolver: Codeowners::OwnerResolver.new,
                   parser_class: Codeowners::MultibyteParser,
                   parser_options: {})
      @contents = contents
      @owner_resolver = owner_resolver
      @parser_class = parser_class
      @parser_options = parser_options
      @rules, @errors = parse_contents
    end

    def match(*paths, matcher: Matcher::Linear)
      matcher = matcher.new(rules, @owner_resolver)
      matcher.match(paths.flatten)
    end

    def for(*paths)
      result = match(*paths, matcher: Matcher::Linear)
      result.rules_by_owner
    end
    alias for_legacy for

    def for_with_tree(*paths)
      result = match(*paths, matcher: Matcher::PathTree)
      result.rules_by_owner
    end

    def for_with_graph(*paths)
      result = match(*paths, matcher: Matcher::RuleGraph)
      result.rules_by_owner
    end

    def build_empty_result
      Matcher::Result.new(@owner_resolver)
    end

    def owner_errors
      return @owner_errors if defined?(@owner_errors)

      rules.each do |rule|
        @owner_resolver.register_owners(rule.owners)
      end
      checked_owners = Set.new
      lines = @contents.lines
      @owner_errors = rules.lazy.flat_map(&:owners).each_with_object([]) do |owner, errors|
        next if checked_owners.include?(owner.identifier)
        checked_owners << owner.identifier

        next if @owner_resolver.resolve(owner.identifier)

        owner.source_locations.each do |source_location|
          errors << SourceError.unknown_owner(
            owner: owner,
            source_location: source_location,
            source: lines[source_location.line - 1],
            suggestion: @owner_resolver.suggestion_for_unresolved_owner(owner),
          )
        end
      end
    end

    private

    def parse_contents
      @parser_class.new.scan_str(contents, @parser_options)
    end
  end
end
