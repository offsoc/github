# typed: true
# frozen_string_literal: true

# These are Hydro event subscriptions related to Dependabot.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  # Repository Dependency Update Lifecycle
  subscribe("repository_dependency_update.created.vulnerability") do |payload|
    repository_dependency_update = payload[:repository_dependency_update]
    repository_vulnerability_alert = payload[:repository_vulnerability_alert]
    security_advisory = payload[:security_advisory]
    security_vulnerability = payload[:security_vulnerability]

    message = {
      repository_vulnerability_alert: repository_vulnerability_alert.hydro_entity_payload,
      repository: serializer.repository(repository_vulnerability_alert.repository),
      owner: serializer.user(repository_vulnerability_alert.repository.owner),
      security_advisory: security_advisory.hydro_entity_payload,
      security_vulnerability: security_vulnerability.hydro_entity_payload,
      trigger: repository_dependency_update.trigger_type,
      description: security_advisory.description,
      github_bot_install_id: payload[:github_bot_install_id].to_s,
      repository_dependency_update_id: repository_dependency_update.id.to_s,
      dry_run: repository_dependency_update.dry_run?,
    }

    if repository_vulnerability_alert.repository.vulnerability_updates_grouping_feature_enabled?
      message[:feature_flags] = feature_flags(repository_vulnerability_alert.repository)
    end

    schema = if repository_dependency_update.manual?
      "github.v1.RepositoryVulnerabilityAlertResolveRequest"
    else
      "github.v1.RepositoryVulnerabilityAlertCreate"
    end

    publish(message, schema: schema, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  def feature_flags(repo)
    return ["grouped_security_updates"] if repo.vulnerability_updates_grouping_enabled?

    []
  end

  subscribe("repository_dependency_update.created") do |payload|
    message = {
      repository_dependency_update: payload[:repository_dependency_update].hydro_entity_payload,
      repository: serializer.repository(payload[:repository]),
    }

    publish(message, schema: "github.v1.RepositoryDependencyUpdateCreated", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository_dependency_update.complete") do |payload|
    message = {
      repository_dependency_update: payload[:repository_dependency_update].hydro_entity_payload,
      repository: serializer.repository(payload[:repository]),
      pull_request: serializer.pull_request(payload[:pull_request]),
    }

    publish(message, schema: "github.v1.RepositoryDependencyUpdateComplete", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository_dependency_update.errored") do |payload|
    message = {
      repository_dependency_update: payload[:repository_dependency_update].hydro_entity_payload,
      repository: serializer.repository(payload[:repository]),
    }

    publish(message, schema: "github.v1.RepositoryDependencyUpdateErrored", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository_dependency_update.cleaned_up") do |payload|
    message = {
      repository_dependency_update: payload[:repository_dependency_update].hydro_entity_payload,
      repository: serializer.repository(payload[:repository]),
    }

    publish(message, schema: "github.v1.RepositoryDependencyUpdateCleanedUp", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  # Dependabot Security Updates config management
  subscribe("repository_dependency_updates.vulnerabilities.enabled") do |payload|
    message = {
      user: serializer.user(payload[:user]),
      repository: serializer.repository(payload[:repository]),
    }

    if payload[:org]
      message[:org] = serializer.organization(payload[:org])
    end

    publish(message, schema: "github.v1.RepositoryDependencyUpdatesVulnerabilitiesEnabled", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("repository_dependency_updates.vulnerabilities.disabled") do |payload|
    message = {
      user: serializer.user(payload[:user]),
      repository: serializer.repository(payload[:repository]),
    }

    if payload[:org]
      message[:org] = serializer.organization(payload[:org])
    end

    publish(message, schema: "github.v1.RepositoryDependencyUpdatesVulnerabilitiesDisabled", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("roles.custom_role_update") do |payload|
    fgps = payload[:fgps]
    action = payload[:action]

    tags = [
      "view_dependabot_alerts:#{fgps.include?("view_dependabot_alerts")}",
      "resolve_dependabot_alerts:#{fgps.include?("resolve_dependabot_alerts")}",
      "action:#{action}"
    ]

    GitHub.dogstats.increment("dependabot_alerts_fgp.custom_role", tags: tags)
  end
end
