# typed: strict
# frozen_string_literal: true

require "serviceowners/concerns/presence"
require "serviceowners/escalation_policy"

module Serviceowners
  # A team as described in a service mappings file
  class Team
    include Concerns::Presence
    extend T::Sig

    sig { params(name: Symbol, properties: T::Hash[Symbol, T.untyped]).void }
    def initialize(name, properties)
      @name = T.let(name, Symbol)
      severity_keys = %i[sev1 sev2 sev3]
      @properties = T.let(properties.except(*severity_keys), T::Hash[Symbol, String])
      @escalation_policies = T.let(properties.slice(*severity_keys), T::Hash[Symbol, T::Hash[Symbol, String]])
      @handle = T.let(nil, T.nilable(String))
      @slack = T.let(required_property(:slack), String)
      @org_name = T.let(required_property(:org), String)
    end

    sig { returns(Symbol) }
    attr_reader :name

    sig { returns(T::Hash[Symbol, String]) }
    attr_reader :properties

    sig { returns(String) }
    attr_reader :slack

    sig { returns(String) }
    attr_reader :org_name

    sig { returns(String) }
    def handle
      return @handle if @handle

      @handle = properties[:reviewers_team]
      unless @handle
        @handle = name.to_s
        @handle = "#{@handle}-reviewers" unless @handle.end_with?("-reviewers")
      end

      @handle = "@github/#{@handle}"
    end

    sig { returns(String) }
    def qualified_name
      "github/#{name}"
    end

    sig { returns(T.nilable(String)) }
    def repo
      presence(@properties[:repo])
    end

    sig { returns(T.nilable(String)) }
    def alert_slack
      presence(@properties[:alert_slack])
    end

    sig { params(severity: Severity).returns(T.nilable(String)) }
    def alert_slack_for_severity(severity)
      presence(escalation_policy(severity)&.alert_slack)
    end

    sig { returns(T.nilable(String)) }
    def product_manager
      presence(properties[:product_manager])
    end

    sig { returns(T.nilable(String)) }
    def support_squad_slack
      presence(@properties[:support_squad_slack])
    end

    sig { returns(T.nilable(String)) }
    def pagerduty_escalation_policy
      presence(@properties[:pagerduty_escalation_policy])
    end

    sig { returns(T.nilable(String)) }
    def issues
      presence(@properties[:issues])
    end

    sig { returns(T.nilable(String)) }
    def alert_issues
      presence(@properties[:alert_issues])
    end

    private

    sig { params(severity: Severity).returns(T.nilable(EscalationPolicy)) }
    def escalation_policy(severity)
      if @escalation_policies[severity.to_sym]
        return EscalationPolicy.new(T.must(@escalation_policies[severity.to_sym]))
      end

      nil
    end

    # handle properties required to be present by service-mappings-schema.json
    sig { params(name: Symbol).returns(String) }
    def required_property(name)
      val = presence(@properties[name])
      raise ArgumentError, "properties must include #{name}" if val.nil?

      val
    end
  end
end
