# typed: true
# frozen_string_literal: true

# Hydro event subscriptions related to GitHub Connect
Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("github_connect.connect") do |payload|
    message = {
      enterprise_installation: serializer.enterprise_installation(payload[:enterprise_installation]),
    }
    publish(message, schema: "github.github_connect.v0.Connect", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("github_connect.usage_metrics_export_request") do |payload|
    message = {
      target_type: payload[:target_type],
      target_name: payload[:target_name],
      target_id: payload[:target_id],
      requested_at: payload[:requested_at],
    }
    publish(message, schema: "github.github_connect.v0.UsageMetricsExportRequest",
      topic: "github.github_connect.v0.#{GitHub.dynamic_lab? ? "Staging" : ""}UsageMetricsExportRequest",
      topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 }
    )
  end

  subscribe("github_connect.update_features") do |payload|
    message = {
      enterprise_installation: serializer.enterprise_installation(payload[:enterprise_installation]),
      features: Array.wrap(payload[:features]),
      actor: serializer.user(payload[:actor]),
      features_disabled: Array.wrap(payload[:features_disabled]),
    }
    publish(message, schema: "github.github_connect.v0.UpdateFeatures", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("github_connect.update_installation_info") do |payload|
    message = {
      enterprise_installation: serializer.enterprise_installation(payload[:enterprise_installation]),
    }
    publish(message, schema: "github.github_connect.v0.UpdateInstallationInfo")
  end

  subscribe("github_connect.disconnect") do |payload|
    message = {
      enterprise_installation: serializer.enterprise_installation(payload[:enterprise_installation]),
    }
    publish(message, schema: "github.github_connect.v0.Disconnect")
  end
end
