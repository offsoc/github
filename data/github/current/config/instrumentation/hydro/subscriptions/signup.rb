# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("browser.signup_interstitial.click") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:client][:user]),
      target: payload[:event_target],
    }

    publish(message, schema: "github.v1.SignupInterstitialClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("suggested_username.publish") do |payload|
    message = {
      suggestion_count: payload[:suggestion_count],
      action: payload[:action],
      actor: {
        user_id: payload[:actor][:user_id],
        login: payload[:actor][:login],
      },
    }

    publish(message, schema: "github.suggested_username.v0.SuggestedUsername", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
