# typed: true
# frozen_string_literal: true

# These are Hydro event subscriptions related to the timeline service.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("issue.events.labeled") do |payload|
    next if payload[:pull_request].present?
    next if payload[:label].nil?
    next if payload[:issue].repository.nil?
    next unless GitHub.flipper[:publish_labeled_events_timeline].enabled?(payload[:issue].repository)

    message = {
      actor: serializer.user(payload[:actor]),
      parent: { id: payload[:issue].id, type: "Issue" },
      type: "LabeledEvent",
      created_at: payload[:event].created_at,
      source_id: payload[:event].id.to_s,
      subject: { id: payload[:label].id, type: "Label" },
      properties: [
        { key: "labelName", value: payload[:label].name },
        { key: "labelColor", value: payload[:label].color },
        { key: "performedByIntegrationId", value: payload[:event].performed_by_integration_id.to_s },
      ],
    }.freeze

    publish(message, schema: "github.timeline.v0.CreateTimelineEntry",
      publisher: GitHub.low_latency_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })
  end
end
