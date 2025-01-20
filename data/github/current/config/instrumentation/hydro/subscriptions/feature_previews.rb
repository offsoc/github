# typed: true
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("browser.feature_preview.clicks.open_modal") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(payload[:client][:user]),
      link_location: serializer.enum_from_string(payload[:link_location]),
    }

    publish(message, schema: "github.v1.FeaturePreviewOpenModalClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.feature_preview.clicks.close_modal") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(payload[:client][:user]),
    }

    publish(message, schema: "github.v1.FeaturePreviewCloseModalClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.feature_preview.clicks.feedback") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(payload[:client][:user]),
      feature: serializer.feature(Feature.find_by(slug: payload[:feature_slug])),
      display_location: serializer.enum_from_string(payload[:display_location]),
    }

    publish(message, schema: "github.v1.FeaturePreviewFeedbackClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.feature_preview.clicks.documentation") do |payload|
    feature = Feature.find_by(slug: payload[:feature_slug])
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(payload[:client][:user]),
      feature: serializer.feature(feature),
      documentation_link: feature&.documentation_link,
    }

    publish(message, schema: "github.v1.FeaturePreviewDocumentationClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("feature_preview.selected") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(payload[:user]),
      feature: serializer.feature(payload[:feature]),
      selection_type: serializer.enum_from_string(payload[:selection_type]),
    }

    publish(message, schema: "github.v1.FeaturePreviewSelected", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
