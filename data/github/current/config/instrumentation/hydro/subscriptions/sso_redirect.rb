# frozen_string_literal: true

# Hydro event subscriptions related to SSO redirect.
Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("sso_redirect.enable") do |payload|
    message = {
      business: serializer.business(payload[:business]),
      actor: serializer.user(payload[:actor]),
    }
    publish(message, schema: "github.sso_redirect.v0.Enable")
  end

  subscribe("sso_redirect.disable") do |payload|
    message = {
      business: serializer.business(payload[:business]),
      actor: serializer.user(payload[:actor]),
    }
    publish(message, schema: "github.sso_redirect.v0.Disable")
  end
end
