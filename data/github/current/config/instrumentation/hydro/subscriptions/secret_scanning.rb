# typed: true
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("token_scan.config_change") do |payload|
    message = {
      repository: serializer.repository(payload[:repository]),
      actor: serializer.user(payload[:actor]),
      owner: serializer.user(payload[:owner]),
    }

    Hydro::PublishRetrier.publish(message, schema: "github.v1.SecretScanConfigChange", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("secret_scanning.backfill.group") do |payload|
    case payload[:owner]
    when Business
      owner_scope = :BUSINESS_SCOPE
    when Organization
      owner_scope = :ORGANIZATION_SCOPE
    when User
      owner_scope = :USER_SCOPE
    else
      owner_scope = :UNKNOWN_SCOPE
    end

    message = {
      owner_id: payload[:owner].id,
      owner_scope: owner_scope,
      action: payload[:action],
      backfill_type: payload[:type],
      feature_flags: payload[:feature_flags],
      requested_at: payload[:requested_at],
      repository_ids: payload[:repository_ids],
    }

    Hydro::PublishRetrier.publish(message, schema: "token_scanning_service.v0.BackfillGroupRequest")
  end

  subscribe("secret_scanning.backfill.repo") do |payload|
    # This causes a full backfill to be done, which includes pattern scan, generic secrets,
    # and low-confidence patterns (if they are enabled).
    message = {
      full_scan_type: {},
      actor: serializer.user(payload[:actor]),
      repo_scope: {
        repo: serializer.repository(payload[:repository]),
        owner: serializer.user(payload[:owner]),
      },
      feature_flags: payload[:feature_flags],
      type: payload[:type],
      requested_at: payload[:requested_at],
      business: payload[:business],
      wiki_scanning: payload[:wiki_scanning],
    }

    Hydro::PublishRetrier.publish(message, schema: "token_scanning_service.v0.BackfillRequest", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("secret_scanning.generic_secrets_backfill.repo") do |payload|
    message = {
      generic_secrets_scan_type: {}, # this is the thing that says we want a generic-secrets backfill
      actor: serializer.user(payload[:actor]),
      repo_scope: {
        repo: serializer.repository(payload[:repository]),
        owner: serializer.user(payload[:owner]),
      },
      feature_flags: payload[:feature_flags],
      type: payload[:type],
      requested_at: payload[:requested_at],
      business: payload[:business],
    }

    Hydro::PublishRetrier.publish(message, schema: "token_scanning_service.v0.BackfillRequest", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("secret_scanning.low_confidence_backfill.repo") do |payload|
    message = {
      low_confidence_scan_type: {}, # this is the thing that says we want a lower-confidence patterns backfill
      actor: serializer.user(payload[:actor]),
      repo_scope: {
        repo: serializer.repository(payload[:repository]),
        owner: serializer.user(payload[:owner]),
      },
      feature_flags: payload[:feature_flags],
      type: payload[:type],
      requested_at: payload[:requested_at],
      business: payload[:business],
      wiki_scanning: payload[:wiki_scanning],
    }

    Hydro::PublishRetrier.publish(message, schema: "token_scanning_service.v0.BackfillRequest", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("secret_scanning.backfill.gist") do |payload|
    message = {
      full_scan_type: {},
      actor: serializer.user(payload[:actor]),
      gist_scope: {
        gist: serializer.gist(payload[:gist]),
        owner: serializer.user(payload[:owner]),
      },
      feature_flags: payload[:feature_flags],
      type: payload[:type],
      requested_at: payload[:requested_at],
    }

    Hydro::PublishRetrier.publish(message, schema: "token_scanning_service.v0.BackfillRequest", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("secret_scanning.token.user_revoke_event") do |payload|
    message = {
      token_user_id: payload[:token_user_id],
      token_source: payload[:token_source],
      type: payload[:type],
      token_hash: payload[:token_hash],
      repository_id: payload[:repository_id],
      repository_type: payload[:repository_type],
      actor_id: payload[:actor_id],
    }

    Hydro::PublishRetrier.publish(message, schema: "token_scanning_service.v0.TokenUserRevocationEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })
  end

  subscribe("roles.custom_role_update") do |payload|
    fgps = payload[:fgps]
    action = payload[:action]

    tags = [
      "view_secret_scanning_alerts:#{fgps.include?("view_secret_scanning_alerts")}",
      "resolve_secret_scanning_alerts:#{fgps.include?("resolve_secret_scanning_alerts")}",
      "action:#{action}"
    ]

    GitHub.dogstats.increment("secret_scanning_fgp.custom_role", tags: tags)
  end

  subscribe("repository_secret_scanning_push_protection.enable") do |payload|
    message = {
      repository_id: payload[:repository_id],
      feature_enabled: true
    }

    # Using the repo id as partition key should ensure that events for a given repo are processed in order
    partition_key = payload[:repository_id]

    Hydro::PublishRetrier.publish(message,
      partition_key: partition_key,
      schema: "github.secret_scanning.v1.SecretScanningPushProtectionFeatureToggled",
      topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 },
    )
  end

  subscribe("repository_secret_scanning_push_protection.disable") do |payload|
    message = {
      repository_id: payload[:repository_id],
      feature_enabled: false
    }

    # Using the repo id as partition key should ensure that events for a given repo are processed in order
    partition_key = payload[:repository_id]

    Hydro::PublishRetrier.publish(message,
      partition_key: partition_key,
      schema: "github.secret_scanning.v1.SecretScanningPushProtectionFeatureToggled",
      topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 },
    )
  end

  subscribe("repository_secret_scanning.enable") do |payload|
    message = {
      repository_id: payload[:repository_id],
      feature_enabled: true
    }

    # Using the repo id as partition key should ensure that events for a given repo are processed in order
    partition_key = payload[:repository_id]

    Hydro::PublishRetrier.publish(message,
      partition_key: partition_key,
      schema: "github.secret_scanning.v1.SecretScanningFeatureToggled",
      topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 },
    )
  end

  subscribe("repository_secret_scanning.disable") do |payload|
    message = {
      repository_id: payload[:repository_id],
      feature_enabled: false
    }

    # Using the repo id as partition key should ensure that events for a given repo are processed in order
    partition_key = payload[:repository_id]

    Hydro::PublishRetrier.publish(message,
      partition_key: partition_key,
      schema: "github.secret_scanning.v1.SecretScanningFeatureToggled",
      topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 },
    )
  end
end
