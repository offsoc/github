# frozen_string_literal: true

# These are Hydro event subscriptions related to Discussions.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("orcid_record.create") do |payload|
    publish_orcid_event(payload:, schema: "github.v1.OrcidRecordCreate")
  end

  subscribe("orcid_record.destroy") do |payload|
    publish_orcid_event(payload:, schema: "github.v1.OrcidRecordDestroy")
  end

  subscribe("orcid_display_preference.change") do |payload|
    actor = payload[:actor]
    value = payload[:value]

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(actor),
      display_on_profile: value,
    }.freeze
    publish(message, schema: "github.v1.OrcidDisplayPreferenceChange")
  end

  def publish_orcid_event(payload:, schema:)
    actor = payload[:actor]
    identifier = payload[:identifier]

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(actor),
      identifier: identifier,
    }.freeze
    publish(message, schema:)
  end
end
