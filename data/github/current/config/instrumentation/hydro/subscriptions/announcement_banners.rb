# frozen_string_literal: true

# Hydro event subscriptions related to announcement banners.
Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("announcement_banners.publish") do |payload|
    message = {
      announcement_id: payload[:announcement_id],
      owner_type: serializer.enum_from_string(payload[:user_facing_owner_type]),
      owner_id: payload[:owner_id],
      message_length: payload[:message_length],
      expires_at: payload[:expires_at],
      user_dismissible: payload[:user_dismissible],
    }

    publish(message, schema: "github.announcement_banners.v1.Publish")
  end
end
