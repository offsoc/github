# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("browser.copilot_summarize_copy.click") do |payload|
    message = {
      analytics_tracking_id: payload[:analytics_tracking_id],
      repository_id: payload[:repository_id],
      organization_id: payload[:organization_id],
      content_type: payload[:content_type],
    }

    publish(message, schema: "github.copilot.v2.CopilotSummarizeCopyClick")
  end
end
