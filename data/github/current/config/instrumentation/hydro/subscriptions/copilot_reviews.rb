# typed: true
# frozen_string_literal: true

# These are GlobalInstrumenter subscriptions that emit Hydro events related to GitHub Copilot Reviews v0.
Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("copilot.reviews.v0.Feedback") do |payload|
    message = {
      request_id: payload[:request_id],
      context: {
        organization_id: payload[:organization_id],
        repository_id: payload[:repository_id],
        pull_request_id: payload[:pull_request_id],
        comment_id: payload[:comment_id],
        user_analytics_tracking_id: payload[:analytics_tracking_id],
      },
      type: payload[:type]
    }

    publish(message, schema: "copilot.reviews.v0.Feedback")
  end

  subscribe("copilot.reviews.v0.RestrictedFeedback") do |payload|
    message = {
      request_id: payload[:request_id],
      context: {
        organization_id: payload[:organization_id],
        repository_id: payload[:repository_id],
        pull_request_id: payload[:pull_request_id],
        comment_id: payload[:comment_id],
        user_analytics_tracking_id: payload[:analytics_tracking_id],
      },
      text_response: payload[:text_response],
      feedback_choice: payload[:feedback_choice]
    }

    publish(message, schema: "copilot.reviews.v0.RestrictedFeedback")
  end
end
