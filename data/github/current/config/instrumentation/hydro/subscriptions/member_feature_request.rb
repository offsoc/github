# typed: strict
# frozen_string_literal: true

# These are Hydro event subscriptions related to Member Feature Request.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("member_feature_request.cancel") do |payload|
    serialized_actor = serializer.user(payload[:actor])
    member_feature_request = payload[:member_feature_request]

    message = {
      actor: serialized_actor,
      organization: serializer.organization(member_feature_request.organization),
      member_feature_request_id: member_feature_request.id,
      feature: member_feature_request.feature.to_s,
      cancelled_at: payload[:cancelled_at],
    }

    publish(message, schema: "hydro.schemas.github.v1.MemberFeatureRequestCancelled")
  end
end
