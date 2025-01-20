# frozen_string_literal: true

# These are Hydro event subscriptions related to browser events.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("repository_ui_event") do |payload|
    publish(payload, schema: "hydro.schemas.github.repositories.v1.UiEvent")
  end

  subscribe("search_ui_event") do |payload|
    publish(payload, schema: "hydro.schemas.github.search.v0.UiEvent")
  end
end
