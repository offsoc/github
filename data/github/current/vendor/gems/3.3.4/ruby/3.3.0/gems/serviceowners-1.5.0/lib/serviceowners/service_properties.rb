# typed: true
# frozen_string_literal: true

module Serviceowners
  # Canonical representation of the service properties originating from the service mappings yaml file.
  module ServiceProperties # rubocop:disable Metrics/ModuleLength
    extend T::Helpers
    extend T::Sig

    include Concerns::Presence
    include Kernel

    abstract!

    sig { abstract.returns(T::Hash[Symbol, T.untyped]) }
    def properties; end

    sig { abstract.returns(IServiceDataProvider) }
    def service_data_provider; end

    sig { returns(T.nilable(String)) }
    def explicit_name
      presence(properties[:name].to_s)
    end

    sig { returns(T.nilable(Team)) }
    def maintainers
      @maintainers ||= team_for(:team) if properties[:team] != "unowned"
    end

    sig { returns(T.nilable(Team)) }
    def additional_review_team
      @additional_review_team ||= team_for(:additional_review_team)
    end

    sig { returns(T::Set[Team]) }
    def teams
      @teams ||= Set.new([maintainers, additional_review_team].compact)
    end

    def component_of
      presence(properties[:component_of])
    end

    sig { returns(T.nilable(String)) }
    def package
      presence(properties[:package])
    end

    def description
      presence(properties[:description])
    end

    sig { returns(T.nilable(Integer)) }
    def tier
      properties[:tier]
    end

    sig { returns(T::Array[String]) }
    def dependencies
      Array(properties[:dependencies])
    end

    sig { returns(T.nilable(String)) }
    def datadog_dashboard
      properties[:datadog_dashboard]
    end

    sig { returns(T.nilable(String)) }
    def looker_dashboard
      properties[:looker_dashboard]
    end

    sig { returns(T.nilable(String)) }
    def ae_dashboard
      properties[:ae_dashboard]
    end

    sig { returns(T.nilable(String)) }
    def playbook
      properties[:playbook]
    end

    sig { returns(T.nilable(String)) }
    def ae_playbook
      properties[:ae_playbook]
    end

    sig { returns(String) }
    def kind
      presence(properties[:kind]) || (component? ? "code" : "logical")
    end

    sig { returns(T::Boolean) }
    def component?
      !!component_of
    end

    sig { returns(String) }
    def repo
      presence(properties[:repo]) || maintainers&.repo || "https://github.com/github/github"
    end

    sig { returns(String) }
    def qos
      presence(properties[:qos]) || "critical"
    end

    sig { returns(String) }
    def issues
      issues_val = presence(properties[:issues]) || presence(maintainers&.issues)
      return issues_val if issues_val

      "#{repo}/issues" if repo
    end

    sig { returns(T.nilable(String)) }
    def alert_issues
      presence(properties[:alert_issues]) || maintainers&.alert_issues
    end

    sig { returns(T.nilable(String)) }
    def product_manager
      presence(properties[:product_manager]) || maintainers&.product_manager
    end

    sig { returns(String) }
    def exec_sponsor
      # An exec specified on the service overrides team or default mappings.
      return properties[:exec] if properties[:exec]

      maintaining_team = maintainers
      org_name = maintaining_team ? maintaining_team.org_name : ServiceMappings::ORG_DEFAULT_KEY
      service_data_provider.exec_for(org_name)
    end

    sig { returns(T.nilable(String)) }
    def support_squad_slack
      presence(properties[:support_squad_slack]) || maintainers&.support_squad_slack
    end

    sig { returns(T.nilable(String)) }
    def alert_slack
      presence(properties[:alert_slack]) || maintainers&.alert_slack
    end

    sig { params(severity: Severity).returns(T.nilable(String)) }
    def alert_slack_for_severity(severity)
      maintainers&.alert_slack_for_severity(severity)
    end

    sig { returns(T.nilable(T::Array[String])) }
    def tags
      Array(properties[:tags]) unless properties[:tags].nil?
    end

    protected

    sig { params(property: Symbol).returns(T.nilable(Team)) }
    def team_for(property)
      return unless presence(properties[property])

      team = service_data_provider.team_for(properties[property])
      raise Error, "invalid team name '#{properties[property]}' for service '#{@name}'" unless team

      team
    end
  end
end
