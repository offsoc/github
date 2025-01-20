# typed: strict
# frozen_string_literal: true

# Hydro event subscriptions related to Meuse (metered billing).
Hydro::EventForwarder.configure(source: GlobalInstrumenter) do

  # Publish metered usage to Meuse
  #
  # Payload fields are documented in https://github.com/github/meuse/blob/main/docs/integration.md#message-fields
  subscribe("meuse.metered_usage") do |payload|
    GitHub.dogstats.increment(
      "billing.test.dotcom_hydro_metered_usage",
      tags: ["product:#{payload[:product_name]}", "product_sku:#{payload[:product_sku_name]}"]
    )

    custom_fields = payload[:custom_fields]
      .transform_values! { |value| value.to_s }
      .delete_if { |_key, value| value.blank? }

    quantity = T.let(nil, T.nilable(Float))
    quantity = payload[:quantity]&.to_f if payload[:quantity].is_a?(Numeric)

    metered_usage_message = {
      product_name: payload[:product_name],
      product_sku_name: payload[:product_sku_name],
      quantity: quantity,
      account_id: payload[:account_id],
      customer_id: payload[:customer_id],
      actor_id: payload[:actor_id],
      usage_at: Google::Protobuf::Timestamp.new(seconds: payload[:usage_at].to_i, nanos: 0),
      usage_uuid: payload[:usage_uuid],
      source_uri: payload[:source_uri],
      custom_fields: custom_fields
    }
    publish(metered_usage_message, schema: "meuse.v0.MeteredUsage", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
