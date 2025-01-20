# typed: true
# frozen_string_literal: true

# Hydro event subscriptions for ExP Treatment Assignment Service API.
Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("exp.responded") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      namespace: payload[:namespace],
      assignment_surface: payload[:assignment_surface],
      current_experiments: payload[:current_experiments],
      assignment_context: payload[:assignment_context],
      called: payload[:called_at],
      randomization_unit: serializer.enum(
        type: Hydro::Schemas::Github::Exp::V0::TasApiResponse::RandomizationUnit,
        value: payload[:randomization_unit],
        default: :UNKNOWN
      ),
      randomization_id: payload[:randomization_id],
    }

    publish(message, schema: "hydro.schemas.github.exp.v0.TasApiResponse")
  end
end
