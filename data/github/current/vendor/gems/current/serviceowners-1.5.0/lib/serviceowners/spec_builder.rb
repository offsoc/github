# typed: strict
# frozen_string_literal: true

require_relative "pattern"
require_relative "error"
require_relative "pattern_spec"

module Serviceowners
  # A builder class responsible for generating a ServicePatterns instance
  class SpecBuilder
    extend T::Sig

    SERVICE_DEFINITION_REGEX = T.let(/\A(?<_>:(?<service>[\w-]+))?(?<reviewer_groups>(?<group>\.\w+)*)\z/,
                                     Regexp)
    NO_REVIEW_GROUP_NAME = "no_review"

    sig { params(service_mappings: ServiceMappings).void }
    def initialize(service_mappings)
      @service_mappings = service_mappings
      @specs = T.let([], T::Array[PatternSpec])
    end

    sig { params(path: String).void }
    def add_path(path)
      File.directory?(path) ? add_directory(path) : add_file(path)
    end

    sig { params(path: String).void }
    def add_file(path)
      add_content(File.read(path))
    end

    sig { params(path: String).void }
    def add_directory(path)
      Dir.children(path).map do |child_path|
        add_path(File.join(path, child_path))
      end
    end

    sig { params(content: String).void }
    def add_content(content)
      content.split("\n").each { |line| add_line(line) }
    end

    sig { returns(ServicePatterns) }
    def to_service_patterns
      service_patterns = ServicePatterns.new(@service_mappings)
      @specs.each { |spec| service_patterns.add_spec(spec) }

      service_patterns.prepare!

      service_patterns
    end

    private

    sig { params(line: String).void }
    def add_line(line)
      line = line.strip
      return if line.empty?
      return if line.start_with?("#")

      words = line.split
      raise Error, "Invalid SERVICEOWNERS line: #{line}" if words.length != 2

      pattern_text, service_text = *words

      @specs << build_spec(T.must(pattern_text), T.must(service_text))
    end

    sig { params(pattern_text: String, service_text: String).returns(PatternSpec) }
    def build_spec(pattern_text, service_text) # rubocop:todo Metrics/MethodLength
      pattern = Pattern.new(pattern_text)
      service_match_data = service_text.match(SERVICE_DEFINITION_REGEX)
      raise Error, "Invalid service definition '#{service_text}'" unless service_match_data

      service_name = service_match_data[:service]
      if service_name
        service = @service_mappings.service_for(service_name)
        raise Serviceowners::Error, "Service '#{service_name}' is not defined in service mappings file" if service.nil?
      end

      review_group_names = T.cast(service_match_data[:reviewer_groups], String).split(".").reject do |name|
        name.strip.empty?
      end
      build_pattern_spec(pattern, service, review_group_names)
    end

    sig do
      params(pattern: Pattern, service: T.nilable(Service), review_group_names: T::Array[String]).returns(PatternSpec)
    end
    def build_pattern_spec(pattern, service, review_group_names)
      if review_group_names.include?(NO_REVIEW_GROUP_NAME)
        PatternSpec.new(pattern, service, no_reviews: true)
      else
        review_groups = review_group_names.map do |name|
          group = @service_mappings.review_group_for(name)
          raise Error, "No team or review group defined for #{name}!" unless group

          [name, group]
        end
        PatternSpec.new(pattern, service, review_groups:)
      end
    end
  end
end
