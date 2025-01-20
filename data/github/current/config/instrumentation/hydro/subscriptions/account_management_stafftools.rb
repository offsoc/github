# typed: strict
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("billing.change_billing_type") do |payload|
    message = {
      account: serializer.user(payload[:user]),
      current_billing_type: serializer.billing_type(payload[:billing_type]),
      previous_billing_type: serializer.billing_type(payload[:old_billing_type]),
      actor: serializer.user(payload[:actor]),
    }
    publish(message, schema: "github.v1.BillingTypeChange", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
