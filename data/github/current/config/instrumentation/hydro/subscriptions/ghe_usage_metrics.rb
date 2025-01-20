# typed: true
# frozen_string_literal: true

# Hydro event subscriptions related to GHES usage metrics transmitted over GitHub Connect
Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("ghe_usage_metrics.event") do |payload|
    message = {
      collected_at: payload[:collected_at].to_time.utc,
      server_id: payload[:server_id],
      version: payload[:version],
      features: Array.wrap(payload[:features]),
      mec: serializer.ghes_usage_metrics_mec(payload[:mec]),
      admin_stats: payload[:admin_stats],
      owner_id: payload[:owner_id],
      dormant_users: payload[:dormant_users],
      schema_version: payload[:schema_version],
      host_name: payload[:host_name],
      actions_stats: payload[:actions_stats],
      packages_stats: payload[:packages_stats],
      advisory_db_stats: payload[:advisory_db_stats]
    }

    # Use the github.ghe_usage_metrics_staging.v0.Event on review-lab so we don't pollute production data
    publish(message, schema: "github.ghe_usage_metrics.v0.Event", topic: "github.ghe_usage_metrics#{GitHub.dynamic_lab? ? "_staging" : ""}.v0.Event", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
