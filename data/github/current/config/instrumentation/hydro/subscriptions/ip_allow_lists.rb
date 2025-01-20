# typed: true
# frozen_string_literal: true

# Hydro event subscriptions related to IP allow lists.
Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("ip_allow_list.enable") do |payload|
    message = {
      owner_type: payload[:owner].is_a?(Business) ? :BUSINESS : :ORG,
      owner_id: payload[:owner].id,
      entries: serializer.ip_allow_list_entries(payload[:entries]),
      actor: serializer.user(payload[:actor]),
    }
    publish(message, schema: "github.ip_allow_list.v0.Enable", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("ip_allow_list.disable") do |payload|
    message = {
      owner_type: payload[:owner].is_a?(Business) ? :BUSINESS : :ORG,
      owner_id: payload[:owner].id,
      entries: serializer.ip_allow_list_entries(payload[:entries]),
      actor: serializer.user(payload[:actor]),
    }
    publish(message, schema: "github.ip_allow_list.v0.Disable", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("ip_allow_list.enable_user_level_enforcement") do |payload|
    message = {
      owner_type: payload[:owner].is_a?(Business) ? :BUSINESS : :ORG,
      owner_id: payload[:owner].id,
      actor: serializer.user(payload[:actor]),
    }
    publish(message, schema: "github.ip_allow_list.v0.EnableUserLevelEnforcement", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })
  end

  subscribe("ip_allow_list.disable_user_level_enforcement") do |payload|
    message = {
      owner_type: payload[:owner].is_a?(Business) ? :BUSINESS : :ORG,
      owner_id: payload[:owner].id,
      actor: serializer.user(payload[:actor]),
    }
    publish(message, schema: "github.ip_allow_list.v0.DisableUserLevelEnforcement", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })
  end

  subscribe("ip_allow_list.enable_for_installed_apps") do |payload|
    message = {
      owner_type: payload[:owner].is_a?(Business) ? :BUSINESS : :ORG,
      owner_id: payload[:owner].id,
      actor: serializer.user(payload[:actor]),
    }
    publish(message, schema: "github.ip_allow_list.v0.EnableForInstalledApps", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("ip_allow_list.disable_for_installed_apps") do |payload|
    message = {
      owner_type: payload[:owner].is_a?(Business) ? :BUSINESS : :ORG,
      owner_id: payload[:owner].id,
      actor: serializer.user(payload[:actor]),
    }
    publish(message, schema: "github.ip_allow_list.v0.DisableForInstalledApps", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("ip_allow_list.policy_unsatisfied") do |payload|
    message = {
      owner_type: payload[:owner].is_a?(Business) ? :BUSINESS : :ORG,
      owner_id: payload[:owner].id,
      actor: serializer.user(payload[:actor]),
      integration_actor: serializer.integration(payload[:integration_actor]),
      actor_ip: payload[:actor_ip],
    }
    publish(message, schema: "github.ip_allow_list.v0.PolicyUnsatisfied", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("ip_allow_list_entry.create") do |payload|
    message = {
      entry: serializer.ip_allow_list_entry(payload[:entry]),
      actor: serializer.user(payload[:actor]),
    }
    publish(message, schema: "github.ip_allow_list.v0.IpAllowListEntryCreate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("ip_allow_list_entry.update") do |payload|
    message = {
      entry: serializer.ip_allow_list_entry(payload[:entry]),
      actor: serializer.user(payload[:actor]),
    }
    publish(message, schema: "github.ip_allow_list.v0.IpAllowListEntryUpdate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("ip_allow_list_entry.destroy") do |payload|
    message = {
      entry: serializer.ip_allow_list_entry(payload[:entry]),
      actor: serializer.user(payload[:actor]),
    }
    publish(message, schema: "github.ip_allow_list.v0.IpAllowListEntryDestroy", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
