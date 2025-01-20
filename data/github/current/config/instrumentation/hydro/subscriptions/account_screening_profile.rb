# typed: strict
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe /account_screening_profile\.form_(submitted|loaded)/ do |payload|
    message = {
      actor:  serializer.user(payload[:actor]),
      action: payload[:action],
      payment_flow_page: payload[:payment_flow_page],
      target_type: payload[:target_type],
      target_id: payload[:target_id],
      target_name: payload[:target_name],
    }

    publish(message, schema: "github.billing.v0.UserPersonalProfileFormAction")
  end
end
