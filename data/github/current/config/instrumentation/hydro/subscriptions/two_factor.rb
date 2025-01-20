# typed: strict
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("two_factor.sms_message_sent") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      hashed_sms_number: payload[:hashed_sms_number],
    }

    publish(message, schema: "github.v1.SmsMessageSent")
  end
end
