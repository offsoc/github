# typed: true
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe(/\Aexemption_request\.(create|cancel|complete)\Z/) do |payload, event|
    next unless payload[:exemption_request].repository.delegated_bypass_hydro_events_enabled?

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      exemption_request: serializer.exemption_request(payload[:exemption_request])
    }

    schema = case event.split(".").last
    when "create"
      "Created"
    when  "cancel"
      "Cancelled"
    when "complete"
      "Completed"
    end

    publish(message, schema: "github.exemptions.v0.ExemptionRequest#{schema}") if schema
  end

  subscribe(/\Aexemption_response\.(approve|reject|dismiss)\Z/) do |payload, event|

    # Fetch the exemption request to get the most recent state
    exemption_request = Exemptions::ExemptionRequest.includes(:repository, :requester, responses: [:reviewer]).find_by(id: payload[:exemption_response].exemption_request_id)
    next unless exemption_request
    next unless exemption_request.repository&.delegated_bypass_hydro_events_enabled?

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      exemption_response: serializer.exemption_response(payload[:exemption_response]),
      exemption_request: serializer.exemption_request(exemption_request)
    }

    schema = case event.split(".").last
    when "approve", "reject"
      "Submitted"
    when "dismiss"
      "Dismissed"
    end

    publish(message, schema: "github.exemptions.v0.ExemptionResponse#{schema}") if schema
  end
end
