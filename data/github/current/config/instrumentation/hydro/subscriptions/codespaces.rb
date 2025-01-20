# typed: true
# frozen_string_literal: true

# These are Hydro event subscriptions related to GitHub Codespaces.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("browser.codespace_create.click") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
                                                  overrides: browser_request_context_overrides(payload)),
      actor: serializer.user(payload[:client][:user]),
      repository_id: payload[:repository_id],
      target: payload[:target],
      originating_request_id: payload[:originating_request_id],
      server_timestamp: Time.zone.now,
      client_timestamp: payload[:client][:timestamp].try(:to_i),
    }

    publish(message, schema: "github.codespaces.v0.CodespaceCreateClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.codespace_open.click") do |payload|
    user = payload.dig(:client, :user)
    codespace = user.codespaces.find_by(id: payload[:codespace_id]) if user

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
                                                  overrides: browser_request_context_overrides(payload)),
      actor: serializer.user(user),
      codespace: serializer.codespace(codespace),
      target: payload[:target],
      originating_request_id: payload[:originating_request_id],
      server_timestamp: Time.zone.now,
      client_timestamp: payload[:client][:timestamp].try(:to_i),
    }

    publish(message, schema: "github.codespaces.v0.CodespaceOpenClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.codespace_destroy.click") do |payload|
    user = payload.dig(:client, :user)
    codespace = user.codespaces.find_by(id: payload[:codespace_id]) if user

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
                                                  overrides: browser_request_context_overrides(payload)),
      actor: serializer.user(user),
      codespace: serializer.codespace(codespace),
      target: payload[:target],
      originating_request_id: payload[:originating_request_id],
      server_timestamp: Time.zone.now,
      client_timestamp: payload[:client][:timestamp].try(:to_i),
    }

    publish(message, schema: "github.codespaces.v0.CodespaceDestroyClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.codespace_suspend.click") do |payload|
    user = payload.dig(:client, :user)
    codespace = user.codespaces.find_by(id: payload[:codespace_id]) if user

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
                                                  overrides: browser_request_context_overrides(payload)),
      actor: serializer.user(user),
      codespace: serializer.codespace(codespace),
      target: payload[:target],
      originating_request_id: payload[:originating_request_id],
      server_timestamp: Time.zone.now,
      client_timestamp: payload[:client][:timestamp].try(:to_i),
    }

    publish(message, schema: "github.codespaces.v0.CodespaceSuspendClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.codespace_share.click") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
                                                  overrides: browser_request_context_overrides(payload)),
      actor: serializer.user(payload[:client][:user]),
      repository_id: payload[:repository_id],
      share_type: payload[:share_type],
      originating_request_id: payload[:originating_request_id],
      server_timestamp: Time.zone.now,
      client_timestamp: payload[:client][:timestamp].try(:to_i),
    }

    publish(message, schema: "github.codespaces.v0.CodespaceShareClick")
  end

  subscribe("codespaces.created") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      codespace: serializer.codespace(payload[:codespace]),
      actor: serializer.user(payload[:actor]),
      billable_owner_in_dunning_cycle: payload[:billable_owner_in_dunning_cycle],
      billing_plan_owner: serializer.codespace_billable_owner(payload[:billable_owner]),
    }

    publish(message, schema: "github.codespaces.v0.CodespaceCreated", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("codespaces.soft_deleted") do |payload|
    message = {
      codespace: serializer.codespace(payload[:codespace]),
      reason: payload[:reason],
    }

    publish(message, schema: "github.codespaces.v0.CodespaceSoftDeleted")
  end

  subscribe("codespaces.destroyed") do |payload|
    message = {
      codespace: serializer.codespace(payload[:codespace]),
    }

    publish(message, schema: "github.codespaces.v0.CodespaceDestroyed", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("codespaces.restored") do |payload|
    message = {
      codespace: serializer.codespace(payload[:codespace]),
    }

    publish(message, schema: "github.codespaces.v0.CodespaceRestored")
  end

  subscribe("codespaces.provisioned") do |payload|
    message = payload.merge(codespace: serializer.codespace(payload[:codespace]))
    publish(message, schema: "github.codespaces.v0.CodespaceProvisioned", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(Codespaces::Events::BILLING_COMPUTE_ANALYTICS) do |payload|
    message = payload[:compute_data]
    publish(message, schema: "github.codespaces.v0.ComputeUsage", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(Codespaces::Events::BILLING_STORAGE_ANALYTICS) do |payload|
    message = payload[:storage_data]
    publish(message, schema: "github.codespaces.v0.StorageUsage", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("codespaces.start") do |payload|
    message = {
      codespace: serializer.codespace(payload[:codespace]),
      actor: serializer.user(payload[:actor])
    }

    publish(message, schema: "github.codespaces.v0.CodespaceStart")
  end

  subscribe("codespaces.suspend") do |payload|
    message = {
      codespace: serializer.codespace(payload[:codespace]),
      actor: serializer.user(payload[:actor])
    }

    publish(message, schema: "github.codespaces.v0.CodespaceSuspend")
  end

  subscribe("codespaces.org_enabled") do |payload|
    message = {
      organization: serializer.organization(payload[:organization]),
    }

    publish(message, schema: "github.codespaces.v0.OrgEnabled")
  end

  subscribe("codespaces.interaction") do |payload|
    message = {
      codespace: serializer.codespace(payload[:codespace]),
      actor: serializer.user(payload[:actor]),
      type: payload[:type],
      source: payload[:source],
      client: payload[:client],
      forked_from_onboarding_repo: payload[:forked_from_onboarding_repo],
      attempted_from_prebuild: payload[:attempted_from_prebuild],
      client_usage: payload[:client_usage],
    }

    publish(message, schema: "github.codespaces.v0.CodespaceInteraction")
  end

  subscribe("codespaces.published") do |payload|
    message = {
      codespace: serializer.codespace(payload[:codespace]),
    }

    publish(message, schema: "github.codespaces.v0.CodespacePublished")
  end

  subscribe("codespaces.trust_tier_calculated") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      calculated_trust_tier: payload[:calculated_trust_tier],
      tier_deciding_accounts: payload[:tier_deciding_accounts],
    }

    publish(message, schema: "github.codespaces.v0.CodespacesTrustTierCalculated")
  end

  subscribe("codespaces.default_idle_timeout_updated") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      value_minutes: payload[:value_minutes],
      previous_value_minutes: payload[:previous_value_minutes],
    }

    publish(message, schema: "github.codespaces.v0.DefaultIdleTimeoutUpdated")
  end
end
