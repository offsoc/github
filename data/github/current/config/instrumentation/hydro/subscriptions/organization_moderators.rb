# frozen_string_literal: true

# Hydro event subscriptions related to organization moderators.
Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("organization_moderators.moderator_update") do |payload|
    message = {
      organization: serializer.organization(payload[:organization]),
      action: payload[:action].upcase,
      moderator_type: payload[:moderator_type].upcase,
      moderator_id: payload[:moderator_id],
      actor: serializer.user(payload[:actor]),
    }

    publish(message, schema: "github.organization_moderators.v0.ModeratorUpdate")
  end
end
