# typed: true
# frozen_string_literal: true

require "parallel"

require_relative "internal/class_parser"
require_relative "metrics"

module Serviceowners
  # This class manages the association between paths and the services that they belong to
  # according to the rules in the provided service_patterns object.
  class PathData
    def initialize(paths, service_patterns)
      @paths = paths
      @service_patterns = service_patterns
    end

    attr_reader :paths, :service_patterns

    # Deprecated: Builds a "best guess" map of classes to paths. It's just a guess because Ruby
    # allows us to reopen classes as many times as we like so some of our classes are defined in
    # dozens of files with varying serviceowners.
    def build_class_cache
      class_service_pairs = Parallel.flat_map(paths) do |path|
        next unless (spec = service_patterns.match(path))

        parser = Serviceowners::Internal::ClassParser.new(path)
        parser.parse.map { |name| [name, spec.service.name] }
      end

      # At this point, `class_service_pairs` is an array of tuples of [class_name, service_name].
      # First we compact it to remove all the `nil` values (no assigned service for class, etc).
      # Second, we reverse it so that mappings declared later in the list come first. This is so
      # that more specific mappings caused by re-opening a class are overridden by the generally
      # more accurate mappings with shorter paths.
      # The `to_h` method, when it encounters duplicate keys (classes defined in multiple files)
      # will just keep on overwriting the value for the given key each time it encounters it.
      # Finally, we just want to sort the hash so the keys are in ascending alphabetical order.
      # This turns it back into an array of tuples so we again call `to_h` but with no concern
      # for duplicates.
      class_service_pairs.compact.reverse.to_h.sort.to_h
    end

    def build_path_cache
      cache = Hash.new { |h, k| h[k] = [] }
      path_specs.each_pair do |path, spec|
        next if spec.nil?

        service_name = spec.service.name.to_s
        cache[service_name] << path
      end

      cache
    end

    def path_specs
      return @path_specs if defined?(@path_specs)

      object_ids = Parallel.flat_map(paths) do |path|
        service_patterns.match(path)&.object_id
      end

      specs = object_ids.map { |id| id.nil? ? nil : service_patterns.spec_for_object_id(id) }
      @path_specs = paths.zip(specs).to_h
    end

    def metrics
      return @metrics if defined?(@metrics)

      metrics_by_service = Hash.new { |h, k| h[k] = Metrics.new(k) }
      path_specs.each_pair do |path, spec|
        metrics_by_service[spec&.service].push_path(path)
      end

      @metrics = metrics_by_service.values
    end
  end
end
