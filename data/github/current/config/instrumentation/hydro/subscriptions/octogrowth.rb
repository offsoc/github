# typed: strict
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("create.ghas_trial_request") do |payload|
    message = {
      organization_id: payload[:organization_id],
      submitted_at: payload[:submitted_at],
    }

    publish(message, schema: "github.octogrowth.v0.GhasTrialRequest", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })
  end
end
