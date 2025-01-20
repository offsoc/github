# typed: true
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("porter.import_created") do |payload|
    message = {
      oauth_application_id: payload[:oauth_application_id],
      repository_id: payload[:repository_id],
      source: payload[:source],
    }

    publish(message, schema: "github.porter.v0.ImportCreated")
  end
end
