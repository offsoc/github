# typed: true
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GitHub) do
  def repository_vulnerability_alert(payload, action)
    last_state_change_reason =
      if payload[:state] == "open" && payload[:last_state_change_reason].nil?
        :NO_REASON
      else
        payload[:last_state_change_reason]&.upcase&.to_sym
      end

    {
      action: action,
      repository_vulnerability_alert_id: payload[:alert_id],
      repository_vulnerability_alert_number: payload[:alert_number],
      vulnerability_id: payload[:vulnerability_id],
      vulnerable_version_range_id: payload[:vulnerable_version_range_id],
      ghsa_id: payload[:ghsa_id],
      repository_id: payload[:repo_id],
      owner_id: payload[:owner_id],
      dismiss_reason: payload[:dismiss_reason],
      dismisser_id: payload[:user_id],
      created_at: payload[:created_at],
      updated_at: payload[:updated_at],
      state: payload[:state]&.upcase&.to_sym,
      last_state_change_reason:,
      last_state_change_at: payload[:last_state_change_at],
      severity: payload[:severity]&.upcase&.to_sym,
      dependency_scope: payload[:dependency_scope]&.upcase&.to_sym,
      package_name: payload[:package_name],
      ecosystem: payload[:ecosystem],
    }
  end

  subscribe("repository_vulnerability_alert.create") do |payload|
    publish(repository_vulnerability_alert(payload, "create"),
            schema: "github.security_alerts.v1.RepositoryVulnerabilityAlertLifecycleEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository_vulnerability_alert.resolve") do |payload|
    publish(repository_vulnerability_alert(payload, "resolve"),
            schema: "github.security_alerts.v1.RepositoryVulnerabilityAlertLifecycleEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository_vulnerability_alert.dismiss") do |payload|
    publish(repository_vulnerability_alert(payload, "dismiss"),
            schema: "github.security_alerts.v1.RepositoryVulnerabilityAlertLifecycleEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository_vulnerability_alert.reopen") do |payload|
    publish(repository_vulnerability_alert(payload, "reopen"),
            schema: "github.security_alerts.v1.RepositoryVulnerabilityAlertLifecycleEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository_vulnerability_alert.reintroduce") do |payload|
    publish(repository_vulnerability_alert(payload, "reintroduce"),
            schema: "github.security_alerts.v1.RepositoryVulnerabilityAlertLifecycleEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository_vulnerability_alert.auto_dismiss") do |payload|
    publish(repository_vulnerability_alert(payload, "auto_dismiss"),
            schema: "github.security_alerts.v1.RepositoryVulnerabilityAlertLifecycleEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository_vulnerability_alert.auto_reopen") do |payload|
    publish(repository_vulnerability_alert(payload, "auto_reopen"),
            schema: "github.security_alerts.v1.RepositoryVulnerabilityAlertLifecycleEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository_vulnerability_alert.withdraw") do |payload|
    publish(repository_vulnerability_alert(payload, "withdraw"),
            schema: "github.security_alerts.v1.RepositoryVulnerabilityAlertLifecycleEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository_vulnerability_alerts.digest_sent") do |payload|
    msg = {
      action: "digest_sent",
      user_id: payload[:user_id],
      repository_count: payload[:repository_count],
      accounts: payload[:accounts],
      period: payload[:period],
      start_date: payload[:start_date],
      end_date: payload[:end_date],
    }

    publish(msg, schema: "github.security_alerts.v1.RepositoryVulnerabilityAlertsAnalyticsEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository_vulnerability_alerts.authorized_users_teams") do |payload|
    msg = {
      action: "authorized_users_teams",
      repository_id: payload[:repo_id],
      owner_id: payload[:org_id],
      authorized_actor_logins: payload[:authorized_actors]
    }

    publish(msg, schema: "github.security_alerts.v1.RepositoryVulnerabilityAlertsAnalyticsEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("repository_vulnerability_alerts.enable") do |payload|
    repository = payload[:repo]
    message = {
      action: "enable",
      repository_id: repository.id
    }

    if repository.owner.organization?
      message[:owner_id] = repository.owner_id
    end

    user = payload[:user]
    if user.present?
      message[:user_id] = user.id
    end

    # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    publish(
      message,
      schema: "github.security_alerts.v1.RepositoryVulnerabilityAlertsAnalyticsEvent",
      topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }
    )
  end

  subscribe("repository_vulnerability_alerts.disable") do |payload|
    repository = payload[:repo]
    message = {
      action: "disable",
      repository_id: repository.id
    }

    if repository.owner.organization?
      message[:owner_id] = repository.owner_id
    end

    user = payload[:user]
    if user.present?
      message[:user_id] = user.id
    end

    # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    publish(
      message,
      schema: "github.security_alerts.v1.RepositoryVulnerabilityAlertsAnalyticsEvent",
      topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }
    )
  end
end
