# typed: true
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("advanced_security_billing.billing_toggled") do |payload|
    message = { actor: serializer.user(payload[:actor]), toggle_state: payload[:toggle_state] }
    message[:organization] = serializer.organization(payload[:organization]) if payload[:organization]
    message[:business] = serializer.business(payload[:business]) if payload[:business]

    publish(message, schema: "advanced_security_billing.v0.BillingToggled")
  end
end
