# frozen_string_literal: true

require "instrumentation/global_events"

GlobalInstrumenter.subscribe("repository.visibility_changed") do |event|
  Packages::VisibilityReindexJob.perform_later(event.payload[:repository_id])
end
