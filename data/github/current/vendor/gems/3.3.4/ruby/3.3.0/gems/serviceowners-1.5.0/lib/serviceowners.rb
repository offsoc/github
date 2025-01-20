# typed: strict
# frozen_string_literal: true

require "sorbet-runtime"
require "serviceowners/path_data"
require "serviceowners/error"
require "serviceowners/file_index"
require "serviceowners/path_change_error"
require "serviceowners/runtime_env"
require "serviceowners/service_mappings"
require "serviceowners/service_patterns"
require "serviceowners/spec_validator"
require "serviceowners/version"

require "serviceowners/type_aliases"

module Serviceowners
  # Primary entrypoint
  class Main
    extend Forwardable
    extend T::Sig

    sig { params(runtime_env: RuntimeEnv).void }
    def initialize(runtime_env: RuntimeEnv.new)
      @file_index = T.let(nil, T.nilable(FileIndex))
      @path_data = T.let(nil, T.nilable(PathData))
      @runtime_env = T.let(runtime_env, RuntimeEnv)
    end

    def_delegators :@runtime_env, :service_mappings, :service_patterns

    sig { params(path: String).returns(T.nilable(PatternSpec)) }
    def spec_for_path(path)
      service_patterns.match(path)
    end

    sig { params(klass: String).returns(T.nilable(Service)) }
    def service_for_class(klass)
      service_name = @runtime_env.class_cache[klass]

      return if service_name.nil?

      service_mappings.service_for(service_name)
    end

    sig { void }
    def validate!
      SpecValidator.new(service_patterns).validate!(file_index) if @runtime_env.validate_patterns?
      service_mappings.validate! if @runtime_env.validate_mappings?
    end

    sig { params(left_just: Integer).returns(String) }
    def to_codeowners(left_just = 100)
      service_patterns.to_codeowners(left_just)
    end

    sig { returns(T::Hash[String, T.untyped]) }
    def to_ownership
      service_ownership = service_mappings.services.map(&:to_ownership)

      { "version" => 1, "ownership" => service_ownership }
    end

    sig { returns(T::Hash[String, T.untyped]) }
    def to_service_links
      service_links = service_mappings.services.flat_map(&:to_service_links)

      { "version" => 1, "links" => service_links }
    end

    sig { returns(T::Array[Service]) }
    def services
      service_mappings.services
    end

    sig { returns(T::Array[String]) }
    def paths
      file_index.files
    end

    sig { returns(PathData) }
    def path_data
      @path_data ||= PathData.new(paths, service_patterns)
    end

    sig { returns(T::Boolean) }
    def validate_local_changes!
      path_errors = find_missing_services_and_paths
      return true if path_errors.empty?

      raise Serviceowners::PathChangeError, path_errors
    end

    sig { returns(FileIndex) }
    def file_index
      @file_index ||= FileIndex.new(@runtime_env.paths)
    end

    private

    sig { returns(T::Array[String]) }
    def find_missing_services_and_paths
      path_errors = @runtime_env.changed_paths.each_with_object([]) do |path_status, errors|
        next if @runtime_env.skip_modified? && path_status.modified?

        errors << path_status.error_message(service_patterns, file_index)
      end
      path_errors.compact
    end
  end
end
