# typed: true
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("issue_forms.create") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      data: payload[:data],
      issue: serializer.issue(payload[:issue]),
      repository: serializer.repository(payload[:repository]),
      request_context: serializer.request_context(GitHub.context.to_hash),
    }.freeze

    publish(
      message,
      schema: "github.issue_templates.v0.IssueCreateEvent",
      publisher: GitHub.low_latency_hydro_publisher, topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }, # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    )
  end
end
