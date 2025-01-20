# typed: true
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("marketplace.cta_view") do |payload|
    message = {
        request_context: serializer.request_context(GitHub.context.to_hash),
        actor: serializer.user(payload[:user]),
        category: payload[:category],
        location: payload[:location]
    }

    publish(message, schema: "github.marketplace.v0.CtaView", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
