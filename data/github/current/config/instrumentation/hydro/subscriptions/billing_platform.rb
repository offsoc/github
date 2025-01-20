# typed: strict
# frozen_string_literal: true

# These are Hydro event subscriptions related to Billing Platform.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("billing_platform.metered_usage") do |payload|
    metered_usage = payload
    quantity = T.let(nil, T.nilable(Float))
    quantity = metered_usage[:quantity].to_f if metered_usage[:quantity].is_a?(Numeric)
    entity = metered_usage[:entity]
    metered_usage_message = {
      sku:  metered_usage[:sku],
      quantity: quantity,
      usage_at:  Google::Protobuf::Timestamp.new(seconds: metered_usage[:usage_at].to_i, nanos: 0),
      source_uri: metered_usage[:source_uri],
      entity: {
        customer_id: entity[:customer_id],
        organization_id: entity[:organization_id],
        repo_id: entity[:repo_id],
        actor_id: entity[:actor_id],
      },
    }
    publish(metered_usage_message, schema: "billingplatform.v1.Usage")
  end
end
