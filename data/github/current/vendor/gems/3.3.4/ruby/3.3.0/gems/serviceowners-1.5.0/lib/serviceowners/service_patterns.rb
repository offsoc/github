# typed: strict
# frozen_string_literal: true

require "forwardable"
require "parallel"

require_relative "pattern"
require_relative "pattern_spec"

module Serviceowners
  # The collection of PatternSpec objects as described in a mapping file
  # Example `SERVICEOWNERS`
  class ServicePatterns
    extend T::Sig
    extend T::Generic
    extend Forwardable

    include Enumerable

    Elem = type_member { { fixed: PatternSpec } }

    def_delegator :@specs, :each

    sig { returns(ServiceMappings) }
    attr_reader :service_mappings

    sig { params(service_mappings: ServiceMappings).void }
    # rubocop: todo Metrics/AbcSize
    def initialize(service_mappings)
      @service_mappings = service_mappings
      @patterns = T.let(Set.new, T::Set[Pattern])
      @specs = T.let([], T::Array[PatternSpec])
      @specs_by_object_id = T.let({}, T::Hash[Integer, PatternSpec])
      @review_groups_only_specs = T.let([], T::Array[PatternSpec])

      @direct_matches = T.let({}, T::Hash[String, PatternSpec])
      @indirect_matches = T.let([], T::Array[PatternSpec])
      @indirect_matches_by_prefix = T.let(Hash.new { |h, k| h[k] = [] }, T::Hash[String, T::Array[PatternSpec]])
      @match_cache = T.let({}, T::Hash[String, T.nilable(PatternSpec)])
    end
    # rubocop: enable Metrics/AbcSize

    sig { params(spec: PatternSpec).void }
    def add_spec(spec)
      return @review_groups_only_specs << spec if spec.review_groups_only?

      raise Error, "Duplicate SERVICEOWNERS pattern: #{spec.pattern}" unless @patterns.add?(spec.pattern)

      @specs << spec
      update_caches(spec)
    end

    sig { params(left_just: Integer).returns(String) }
    def to_codeowners(left_just = 100)
      map { |p| p.to_codeowners(left_just) }.compact.join("\n")
    end

    sig { params(path: String).returns(T.nilable(PatternSpec)) }
    def match(path)
      return @match_cache[path] if @match_cache.key?(path)

      spec = direct_match_for(path) || indirect_match_for(path)
      @match_cache[path] = spec
    end

    # Internal: Returning the spec itself from a subprocess is expensive as it is a complex object to serialize.
    # Instead, we return the object id and let the parent process look the spec up by that in a hash.
    sig { params(id: Integer).returns(T.nilable(PatternSpec)) }
    def spec_for_object_id(id)
      @specs_by_object_id[id]
    end

    sig { void }
    def prepare!
      sort!
      compile!
      freeze
    end

    sig { void }
    def sort!
      @specs.sort!
      @indirect_matches.sort!
      @indirect_matches_by_prefix.each_value(&:sort!)
    end

    # Internal: Compiles review-groups-only specs into the specs they apply to.
    sig { void }
    def compile!
      same_pattern_specs = []

      @review_groups_only_specs.each do |review_group_spec|
        @specs.each do |other_spec|
          other_spec.extend_review_groups!(review_group_spec)

          same_pattern_specs << review_group_spec if review_group_spec.pattern.text == other_spec.pattern.text
        end
      end

      # Prepend review-groups-only specs to the array for "catch-all" purposes, as CODEOWNERS favours the last match
      # and we want to ensure the least-specific matches are first
      catch_all_specs = @review_groups_only_specs - same_pattern_specs
      @specs = catch_all_specs.concat @specs
    end

    sig { void }
    def freeze
      super
      @specs.freeze
      @patterns.freeze
    end

    sig { returns(String) }
    def inspect
      @specs.inspect
    end

    sig { params(file_index: FileIndex).returns(T::Array[PatternSpec]) }
    def unmatched(file_index)
      file_index.preload_all_files!
      file_exists_list = Parallel.map(@specs) do |spec|
        file_index.any_file?(spec.pattern)
      end

      @specs.zip(file_exists_list).reject { |_, exists| exists }.map { |spec, _| spec }
    end

    private

    sig { params(path: String).returns(T.nilable(PatternSpec)) }
    def direct_match_for(path)
      @direct_matches[path]
    end

    sig { params(path: String).returns(String) }
    def prefix(path)
      T.must(path.split("/").first)
    end

    sig { params(path: String).returns(T.nilable(PatternSpec)) }
    def indirect_match_for(path)
      T.must(@indirect_matches_by_prefix[prefix(path)]).reverse_each do |spec|
        return spec if spec.matches?(path)
      end

      @indirect_matches.reverse_each do |spec|
        return spec if spec.matches?(path)
      end

      nil
    end

    sig { params(spec: PatternSpec).void }
    def update_caches(spec)
      @match_cache = {} unless @match_cache.empty?

      if spec.service
        if spec.pattern.file?
          @direct_matches[spec.pattern.text] = spec
        else
          @indirect_matches << spec
          T.must(@indirect_matches_by_prefix[prefix(spec.pattern.text)]) << spec
        end
      end

      @specs_by_object_id[spec.object_id] = spec # rubocop:disable Lint/HashCompareByIdentity
    end
  end
end
