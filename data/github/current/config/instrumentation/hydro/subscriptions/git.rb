# typed: true
# frozen_string_literal: true

# These are Hydro event subscriptions related to Git operations.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do

  subscribe("git.maintenance") do |payload|
    publish(payload, schema: "git.v1.Maintenance")
  end

end
