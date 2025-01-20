# typed: true
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("browser.translator.request") do |payload|
    message = {
      source_language: payload[:source_language],
      target_language: payload[:target_language],
      url: payload[:url],
      resource_type: payload[:resource_type],
      resource_id: payload[:resource_id]
    }

    publish(message, schema: "github.localization.v0.TranslationRequest", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
