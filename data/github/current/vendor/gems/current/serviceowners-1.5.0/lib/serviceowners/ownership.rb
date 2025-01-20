# typed: true
# frozen_string_literal: true

require "serviceowners/severity"

module Serviceowners
  # An internal class encapsulating generation of the ownership hash for ownership.yaml output
  module Ownership
    extend T::Helpers
    extend T::Sig

    KEY_ORDER = %w[name long_name description kind component_of maintainer team exec_sponsor
                   product_manager repo team_slack sev1 sev2 sev3 support_squad
                   qos dependencies tier tags].freeze

    include Kernel

    requires_ancestor { ServiceProperties }

    abstract!

    sig { abstract.returns(String) }
    def qualified_name; end

    sig { abstract.returns(String) }
    def human_name; end

    sig { abstract.returns(T::Array[String]) }
    def package_dependencies; end

    def to_ownership
      ownership = if component?
                    base_ownership
                  else
                    base_ownership.merge(detailed_ownership)
                  end
      sort_ownership(ownership).to_h
    end

    private

    def base_ownership
      {
        "name" => qualified_name,
        "long_name" => human_name,
        "description" => description,
        "kind" => kind,
        "repo" => repo
      }.merge(optional_ownership)
    end

    def optional_ownership
      {
        "component_of" => component_of,
        "dependencies" => build_dependencies,
        "qos" => qos,
        "tier" => tier,
        "tags" => tags&.sort
      }.delete_if { |_k, v| v.nil? } # rubocop:disable Style/CollectionCompact
    end

    def detailed_ownership
      h = team_escalations
      h.merge!(optional_detailed_ownership_values)

      if (pagerduty = maintainers&.pagerduty_escalation_policy)
        h["sev1"] = sev1_escalation_policy(pagerduty)
      end
      h
    end

    def sort_ownership(ownership)
      ownership.sort do |(k1, _v1), (k2, _v2)|
        KEY_ORDER.index(k1) <=> KEY_ORDER.index(k2)
      end
    rescue StandardError => e
      puts "unexpected key in #{ownership.keys}"
      raise e
    end

    def optional_detailed_ownership_values
      h = {
        "team_slack" => maintainers&.slack,
        "exec_sponsor" => exec_sponsor,
        "product_manager" => product_manager
      }.delete_if { |_k, v| v.nil? } # rubocop:disable Style/CollectionCompact
      h["support_squad"] = { "slack" => support_squad_slack } if support_squad_slack
      h
    end

    def team_escalations
      team = maintainers
      return {} unless team

      {
        "team" => team.qualified_name,
        "sev2" => sev2_escalation_policy,
        "sev3" => sev3_escalation_policy(team.slack)
      }
    end

    def sev1_escalation_policy(pagerduty)
      {
        "pagerduty" => "https://github.pagerduty.com/escalation_policies##{pagerduty}",
        "tta" => "30 minutes",
        "alert_slack" => alert_slack_for_severity(Severity::Sev1)
      }.delete_if { |_k, v| v.nil? } # rubocop:disable Style/CollectionCompact
    end

    def sev2_escalation_policy
      {
        "issue" => issues, "alert_issue" => alert_issues,
        "tta" => "1 business day",
        "alert_slack" => alert_slack_for_severity(Severity::Sev2)
      }.delete_if { |_k, v| v.nil? } # rubocop:disable Style/CollectionCompact
    end

    def sev3_escalation_policy(team_slack)
      {
        "slack" => team_slack,
        "alert_slack" => alert_slack_for_severity(Severity::Sev3) || alert_slack
      }.delete_if { |_k, v| v.nil? } # rubocop:disable Style/CollectionCompact
    end

    sig { returns(T.nilable(T::Array[String])) }
    def build_dependencies
      deps = (dependencies + package_dependencies).sort
      deps unless deps.empty?
    end
  end
end
