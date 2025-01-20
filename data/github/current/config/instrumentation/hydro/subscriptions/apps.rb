# typed: true
# frozen_string_literal: true

# These are Hydro event subscriptions owned by the Apps team.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("oauth_access.create") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      database_id: payload[:oauth_access].id,
      scopes: Array.wrap(payload[:scopes]),
      accessible_organization_ids: Array.wrap(payload[:accessible_organization_ids]),
    }

    case payload[:oauth_access].application_type
    when "OauthApplication"
      message[:app_type] = :OAUTH_APPLICATION
      message[:oauth_application] = serializer.oauth_application(payload[:app])
    when "Integration"
      message[:app_type] = :INTEGRATION
      message[:integration] = serializer.integration(payload[:app])
    end

    if payload[:oauth_access].expires_at_timestamp.present?
      message[:expires_at_timestamp] = payload[:oauth_access].expires_at_timestamp

      preset_selection = TokenExpirable::VALID_DEFAULT_EXPIRATIONS[payload[:oauth_access].default_expires_at]
      message[:expires_at_preset] = preset_selection

      message[:expires_at_custom_date] = payload[:oauth_access].custom_expires_at&.to_s
    end

    publish(message, schema: "github.v1.OauthAccess", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("oauth_access.delete") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      database_id: payload[:oauth_access].id,
      scopes: Array.wrap(payload[:scopes]),
      accessible_organization_ids: Array.wrap(payload[:accessible_organization_ids]),
    }

    case payload[:oauth_access].application_type
    when "OauthApplication"
      message[:app_type] = :OAUTH_APPLICATION
      message[:oauth_application] = serializer.oauth_application(payload[:app])
    when "Integration"
      message[:app_type] = :INTEGRATION
      message[:integration] = serializer.integration(payload[:app])
    end

    if payload[:oauth_access].expires_at_timestamp.present?
      message[:expires_at_timestamp] = payload[:oauth_access].expires_at_timestamp

      preset_selection = TokenExpirable::VALID_DEFAULT_EXPIRATIONS[payload[:oauth_access].default_expires_at]
      message[:expires_at_preset] = preset_selection

      message[:expires_at_custom_date] = payload[:oauth_access].custom_expires_at&.to_s
    end

    publish(message, schema: "github.v1.OauthAccessDelete")
  end

  subscribe("oauth_access.exchange") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      database_id: payload[:oauth_access]&.id || 0,
      token_last_eight: payload[:token_last_eight],
      refresh_token_last_eight: payload[:refresh_token_last_eight],
      exchanged_refresh_token_last_eight: payload[:exchanged_refresh_token_last_eight] || "",
      exchange_result: payload[:exchange_result] || "UNKNOWN_FAILURE"
    }

    case payload[:application]&.class&.name
    when "OauthApplication"
      message[:app_type] = :OAUTH_APPLICATION
      message[:oauth_application] = serializer.oauth_application(payload[:application])
    when "Integration"
      message[:app_type] = :INTEGRATION
      message[:integration] = serializer.integration(payload[:application])
    end

    publish(message, schema: "github.v1.OauthExchange", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("oauth_access.regenerate") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      database_id: payload[:oauth_access].id,
      scopes: Array.wrap(payload[:scopes]),
      accessible_organization_ids: Array.wrap(payload[:accessible_organization_ids]),
    }

    case payload[:oauth_access].application_type
    when "OauthApplication"
      message[:app_type] = :OAUTH_APPLICATION
      message[:oauth_application] = serializer.oauth_application(payload[:app])
    when "Integration"
      message[:app_type] = :INTEGRATION
      message[:integration] = serializer.integration(payload[:app])
    end

    if payload[:oauth_access].expires_at_timestamp.present?
      message[:expires_at_timestamp] = payload[:oauth_access].expires_at_timestamp

      preset_selection = TokenExpirable::VALID_DEFAULT_EXPIRATIONS[payload[:oauth_access].default_expires_at]
      message[:expires_at_preset] = preset_selection

      message[:expires_at_custom_date] = payload[:oauth_access].custom_expires_at&.to_s
    end

    publish(message, schema: "github.v1.OauthAccessRegenerate")
  end

  subscribe("user_programmatic_access.create") do |payload|
    access = payload[:programmatic_access]
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(access.owner),
      database_id: access.id,
    }

    if access.expires_at.present?
      message[:expires_at_timestamp] = access.expires_at

      preset_selection = TokenExpirable::VALID_DEFAULT_EXPIRATIONS[access.default_expires_at]
      message[:expires_at_preset] = preset_selection

      message[:expires_at_custom_date] = access.custom_expires_at&.to_s
    end

    publish(message, schema: "github.v1.UserProgrammaticAccessCreate")
  end

  subscribe("user_programmatic_access.regenerate") do |payload|
    access = payload[:programmatic_access]
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(access.owner),
      database_id: access.id,
    }

    if access.expires_at.present?
      message[:expires_at_timestamp] = access.expires_at

      preset_selection = TokenExpirable::VALID_DEFAULT_EXPIRATIONS[access.default_expires_at]
      message[:expires_at_preset] = preset_selection

      message[:expires_at_custom_date] = access.custom_expires_at&.to_s
    end

    publish(message, schema: "github.v1.UserProgrammaticAccessRegenerate")
  end


  # Permissions Service Events
  # --------------------------
  # These events are published by the Permissions Service when permissions records
  # are created, updated or deleted
  subscribe("permissions.service.write_requested") do |payload|
    payload[:request_context] = serializer.request_context(GitHub.context.to_hash)
    publish(payload, schema: "github.permissions.v0.Created")
  end
end

# Configured with `source GitHub` means it's listening to the corresponding
# audit log event, this can mutate the payload though and it's recommended
# to use the GlobalInstrumenter pattern (like the above events do)
Hydro::EventForwarder.configure(source: GitHub) do
  subscribe("integration_installation.create") do |payload|
    installer = User.find_by(id: payload[:installer_id])
    integration = Integration.find_by(id: payload[:integration_id])

    serialized_repositories = []

    if GitHub.flipper[:instrument_installation_creation_with_repo_ids].enabled?
      payload[:repository_ids].in_groups_of(1_000) do |group|
        Repositories::Public
          .load_repositories(group)
          .each { |repo| serialized_repositories << serializer.repository(repo) }
      end
    else
      if payload[:repository_selection] == "selected"
        installation = IntegrationInstallation.find_by(id: payload[:installation_id])
        serialized_repositories = installation&.repositories&.map { |repo| serializer.repository(repo) }
      end
    end

    message = {
      installation: serializer.integration_installation(payload),
      integration: serializer.integration(integration),
      repositories: serialized_repositories,
      sender: serializer.user(installer),
    }

    publish(message, schema: "github.v1.IntegrationInstallationCreate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("integration_installation.destroy") do |payload|
    integration = Integration.find_by(id: payload[:integration_id])
    uninstaller = User.find_by(id: payload[:actor_id])

    message = {
      installation: serializer.integration_installation(payload),
      integration: serializer.integration(integration),
      sender: serializer.user(uninstaller),
    }

    publish(message, schema: "github.v1.IntegrationInstallationDelete", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("integration_installation.repositories_added") do |payload|
    actor = User.find_by(id: payload[:actor_id])

    repositories = Repository.where(id: payload[:repositories_added])
    serialized_repositories = repositories.map do |repo|
      serializer.repository(repo)
    end

    message = {
      installation: serializer.integration_installation(payload),
      repositories_added: serialized_repositories,
      sender: serializer.user(actor),
    }

    publish(message, schema: "github.v1.IntegrationInstallationRepositoriesAdded", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("integration_installation.repositories_removed") do |payload|
    actor = User.find_by(id: payload[:actor_id])

    repositories = Repository.where(id: payload[:repositories_removed])
    serialized_repositories = repositories.map do |repo|
      serializer.repository(repo)
    end

    message = {
      installation: serializer.integration_installation(payload),
      repositories_removed: serialized_repositories,
      sender: serializer.user(actor),
    }

    publish(message, schema: "github.v1.IntegrationInstallationRepositoriesRemoved", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
