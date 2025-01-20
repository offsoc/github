# typed: strict
# frozen_string_literal: true

module Serviceowners
  # A pattern, service, and reviewer group list describing a
  # set of files owned by a service and reviewed by zero or more groups.
  class PatternSpec
    extend T::Sig

    sig do
      params(pattern: T.any(Pattern, String), service: T.nilable(Service), review_groups: T::Array[[String, Team]],
             no_reviews: T::Boolean).void
    end
    def initialize(pattern, service, review_groups: [], no_reviews: false)
      neither_service_or_reviewer_groups = service.nil? && review_groups.empty?
      raise ArgumentError, "service cannot be nil and reviewers groups empty" if neither_service_or_reviewer_groups

      pattern = Pattern.new(pattern) if pattern.is_a?(String)
      @pattern = T.let(pattern, Pattern)
      @service = service
      @review_groups = T.let(Set.new, T::Set[[String, Team]])
      @no_reviews = no_reviews

      review_groups.each { |name, team| add_group(name, team) }
    end

    sig { returns(Pattern) }
    attr_reader :pattern

    sig { returns(T.nilable(Service)) }
    attr_reader :service

    sig { returns(T::Set[[T.nilable(String), Team]]) }
    attr_reader :review_groups

    sig { returns(T::Boolean) }
    def no_reviews?
      @no_reviews
    end

    sig { returns(T::Boolean) }
    def review_groups_only?
      service.nil? && !review_groups.empty?
    end

    sig { params(other: T.untyped).returns(T.nilable(Integer)) }
    def <=>(other)
      return nil unless other.is_a?(PatternSpec)

      pattern <=> other.pattern
    end

    sig { params(ljust: Integer).returns(T.nilable(String)) }
    def to_codeowners(ljust = 80)
      # unowned services are skipped when generating CODEOWNERS
      return if service&.teams&.empty? && review_groups.empty?

      handles = no_reviews? ? "" : teams.map(&:handle).join(" ")
      "#{pattern.to_codeowners.ljust(ljust)} #{handles}".strip
    end

    sig { returns(T::Array[Team]) }
    def teams
      (Array(service&.teams) + review_groups_teams).uniq
    end

    sig { returns(T::Array[Team]) }
    def review_groups_teams
      @review_groups.map { |_, team| team }
    end

    sig { returns(T::Array[String]) }
    def review_groups_names
      @review_groups.map { |name, _| name }.compact
    end

    sig { params(path: String).returns(T::Boolean) }
    def matches?(path)
      pattern.matches?(path)
    end

    sig { returns(String) }
    def to_s
      s = pattern.to_s
      s += " :#{service&.name}" if service

      return "#{s} (no reviews)" if no_reviews?
      return "#{s} #{review_groups_teams.map(&:handle).join(".")}" unless review_groups_teams.empty?

      s
    end

    sig { returns(String) }
    def to_serviceowners
      prefix = "#{pattern} "
      prefix += ":#{service&.name}" if service
      group_handles = review_groups_names
      group_handles << "no_review" if no_reviews?
      suffix = group_handles.empty? ? "" : ".#{group_handles.join(".")}"

      "#{prefix}#{suffix}"
    end

    sig { params(spec: PatternSpec).void }
    def extend_review_groups!(spec)
      return if no_reviews?
      return unless spec.matches?(pattern.text)

      spec.review_groups.each do |group|
        review_groups << group
      end
    end

    alias inspect to_s

    private

    sig { params(name: String, team: Team).void }
    def add_group(name, team)
      service = self.service
      if service && (service.maintainers == team || service.additional_review_team == team)
        raise Error, "Redundant review group for #{pattern.text}"
      end

      @review_groups << [name, team]
    end
  end
end
