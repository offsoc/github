# typed: true
# frozen_string_literal: true
# These are GlobalInstrumenter subscriptions that emit Hydro events related to GitHub Copilot Pull Request summaries.
Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("copilot.prompt.pull_request_summaries") do |payload|
    message = {
      analytics_tracking_id: payload[:analytics_tracking_id],
      repository_id: payload[:repository_id],
      base_revision: payload[:base_revision],
      head_revision: payload[:head_revision],
      status: payload[:status],
    }

    publish(message, schema: "github.copilot.v2.CopilotPullRequestSummaries")
  end
end
