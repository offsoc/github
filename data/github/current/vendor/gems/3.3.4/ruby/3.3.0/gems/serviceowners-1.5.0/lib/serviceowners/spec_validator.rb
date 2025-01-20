# typed: strict
# frozen_string_literal: true

module Serviceowners
  # A validator class responsible for checking a ServicePatterns instance
  class SpecValidator
    extend T::Sig

    UNMATCHED_PATTERNS_ERROR = <<~ERROR_MESSAGE
      The following patterns are specified in SERVICEOWNERS but there are
      no files added to the git repository that match them. Remove the patterns
      from SERVICEOWNERS or add matching files to git to resolve this error.
    ERROR_MESSAGE

    sig { params(service_patterns: ServicePatterns).void }
    def initialize(service_patterns)
      @service_patterns = service_patterns
      @service_mappings = T.let(service_patterns.service_mappings, ServiceMappings)
    end

    sig { params(file_index: T.nilable(FileIndex)).void }
    def validate!(file_index = nil)
      validate_unmatched_patterns!(file_index)
      validate_unused_review_groups!
      validate_unused_services!
      true
    end

    private

    sig { void }
    def validate_unused_services!
      unused_service = @service_mappings.services.detect do |service|
        @service_patterns.none? { |spec| spec.service == service }
      end
      raise Error, "Unused service '#{unused_service.name}'" unless unused_service.nil?
    end

    sig { void }
    def validate_unused_review_groups!
      unused_group = @service_mappings.review_group_names.detect do |group_name|
        team = @service_mappings.review_group_for(group_name)
        @service_patterns.none? { |spec| spec.review_groups_teams.include?(team) }
      end
      raise Error, "Unused review group '#{unused_group}'" unless unused_group.nil?
    end

    sig { params(file_index: T.nilable(FileIndex)).void }
    def validate_unmatched_patterns!(file_index)
      return if file_index.nil?

      unmatched_specs = @service_patterns.unmatched(file_index)
      return if unmatched_specs.empty?

      unmatched_text = unmatched_specs.map { |spec| spec.pattern.text }.join("\n")
      raise Error, "#{UNMATCHED_PATTERNS_ERROR}\n#{unmatched_text}"
    end
  end
end
