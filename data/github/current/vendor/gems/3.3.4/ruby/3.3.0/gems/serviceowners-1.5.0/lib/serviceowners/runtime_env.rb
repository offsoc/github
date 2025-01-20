# typed: true
# frozen_string_literal: true

require "yaml"

require_relative "path_data"
require_relative "path_status"
require_relative "spec_builder"

module Serviceowners
  # Contains all user-configurable properties used in serviceowner evaluation.
  class RuntimeEnv
    extend T::Sig

    DEFAULT_MAPPINGS_PATH = "config/service-mappings.yaml"
    DEFAULT_PATTERNS_PATH = "SERVICEOWNERS"

    PUBLIC_ATTRIBUTES = %i[mappings_path patterns_path base_ref class_cache path_status_lines
                           paths skip_modified validate_mappings validate_patterns].freeze

    def initialize(config = {})
      PUBLIC_ATTRIBUTES.each do |sym|
        instance_variable_set("@#{sym}", config[sym]) if config.key?(sym)
      end

      @mappings_path = DEFAULT_MAPPINGS_PATH unless defined?(@mappings_path)
      @patterns_path = DEFAULT_PATTERNS_PATH unless defined?(@patterns_path)
      @base_ref = "origin/main" unless defined?(@base_ref)
    end

    attr_reader :mappings_path, :patterns_path

    def service_mappings
      return @service_mappings if defined?(@service_mappings)

      data = self.class.load_yaml(@mappings_path)
      @service_mappings = ServiceMappings.new(data)
    end

    sig { params(path: String).returns(T.nilable(T::Hash[Symbol, T.untyped])) }
    def self.load_yaml(path)
      YAML.safe_load(File.read(path), symbolize_names: true) # rubocop:disable Style/YAMLFileRead
    end

    def service_patterns
      return @service_patterns if defined?(@service_patterns)

      spec_builder = SpecBuilder.new(service_mappings)
      spec_builder.add_path(patterns_path.to_s)

      @service_patterns = spec_builder.to_service_patterns
    end

    def validate_mappings?
      return @validate_mappings if defined?(@validate_mappings)

      @validate_mappings = changed_paths.empty? || path_changed?(mappings_path)
    end

    def validate_patterns?
      return @validate_patterns if defined?(@validate_patterns)

      @validate_patterns = validate_mappings? || changed_paths.empty? || path_changed?(patterns_path)
    end

    def skip_modified?
      @skip_modified ||= false
    end

    def changed_paths
      @changed_paths ||= path_status_lines.map { |line| Serviceowners::PathStatus.new(line) }
    end

    def class_cache
      return @class_cache if defined?(@class_cache)

      @class_cache = PathData.new(paths, service_patterns).build_class_cache
    end

    def path_status_lines
      return @path_status_lines if defined?(@path_status_lines)
      raise Error, "Neither path_status_lines nor base_ref specified!" unless @base_ref

      io = IO.popen(
        ["git", "-c", "core.quotepath=off", "diff", "--name-status", "--merge-base", @base_ref, "HEAD"],
        err: "/dev/null",
        encoding: Encoding::ASCII_8BIT
      )
      @path_status_lines = io.read.split("\n")
    end

    def paths
      return @paths if defined?(@paths)

      io = IO.popen(["git", "-c", "core.quotepath=off", "ls-files"], encoding: Encoding::ASCII_8BIT)
      @paths = io.read.split("\n")
    end

    def path_changed?(path)
      # This pattern could be vulnerable to glob injection if a path includes special characters
      # such as *?{}. The risks involved are quite low however, so it should be safe at least
      # for the current use-cases of this method.
      path_match = "#{path}{,/**}"
      !!changed_paths.detect { |ps| File.fnmatch(path_match, ps.path, File::FNM_EXTGLOB) }
    end
  end
end
