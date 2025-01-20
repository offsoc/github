# typed: true
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("advanced_security.enabled") do |payload|
    message = {
      repository_id: payload[:repository_id],
      feature_enabled: true,
      customer_id: payload[:customer_id]
    }

    Hydro::PublishRetrier.publish(
      message,
      partition_key: payload[:repository_id],
      schema: "github.security_center.v0.AdvancedSecurityToggled",
      topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 },
    )
  end

  subscribe("advanced_security.disabled") do |payload|
    message = {
      repository_id: payload[:repository_id],
      feature_enabled: false,
      customer_id: payload[:customer_id]
    }

    Hydro::PublishRetrier.publish(
      message,
      partition_key: payload[:repository_id],
      schema: "github.security_center.v0.AdvancedSecurityToggled",
      topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 },
    )
  end
end
