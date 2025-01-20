# frozen_string_literal: true

# Hydro event subscriptions related to pages.
Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("pages.actions.build") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      page: serializer.page(payload[:page]),
      repository_owner: serializer.user(payload[:repository_owner]),
      aqueduct_message: payload[:aqueduct_message],
      artifact_hash: payload[:artifact_hash]
    }
    publish(message, schema: "github.v1.RepositoryPagesActionBuild")
  end
end
