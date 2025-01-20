# typed: strict
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe(/(org|env|repository)_variable\.(create|update|remove)/) do |payload|
    message = {
      app: payload[:app],
      request_context: serializer.request_context(GitHub.context.to_hash),
      owner_type: serializer.enum(type: Hydro::Schemas::Github::V1::VariableChanged::OwnerType,
        value: payload[:owner_type],
        default: :UNKNOWN),
      owner_repo: serializer.repository(payload[:owner_repo]),
      owner_org: serializer.organization(payload[:owner_org]),
      owner_env: serializer.environment(payload[:owner_env]),
      actor: serializer.user(payload[:actor]),
      name: payload[:name],
      visibility: payload[:visibility],
      state: serializer.enum(type: Hydro::Schemas::Github::V1::VariableChanged::State,
        value: payload[:state],
        default: :UNKNOWN_STATE),
      updated_name: payload[:updated_name],
      varlen: payload[:varlen],
      updated_at: payload[:updated_at],
    }

    publish(message, schema: "github.v1.VariableChanged")
  end
end
