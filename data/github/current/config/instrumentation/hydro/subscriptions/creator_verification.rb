# typed: true
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("marketplace.creator_verification_state_update") do |payload|
    message = {
      state: payload[:state],
      actor: serializer.user(payload[:actor]),
      organization: serializer.organization(payload[:owner])
    }

    publish(message, schema: "github.marketplace.v0.CreatorVerification", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
