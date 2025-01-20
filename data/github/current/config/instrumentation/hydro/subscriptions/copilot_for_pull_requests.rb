# typed: true
# frozen_string_literal: true

# These are GlobalInstrumenter subscriptions that emit Hydro events related to GitHub Copilot for pull requests.
Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("copilot.pull_request.pre_review.banner_view") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      analytics_tracking_id: payload[:analytics_tracking_id],
      diff_lines_changed: payload[:diff_lines_changed],
    }

    publish(message, schema: "github.copilot.v2.CopilotPullRequestPreReviewBannerView")
  end

  subscribe("copilot.pull_request.pre_review.banner_dismiss") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      analytics_tracking_id: payload[:analytics_tracking_id],
      error: payload[:error],
      dismiss_button: payload[:dismiss_button],
    }

    publish(message, schema: "github.copilot.v2.CopilotPullRequestPreReviewBannerDismiss")
  end

  subscribe("copilot.pull_request.pre_review.open_chat") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      analytics_tracking_id: payload[:analytics_tracking_id],
      round_trip_time_ms: payload[:round_trip_time_ms],
    }

    publish(message, schema: "github.copilot.v2.CopilotPullRequestPreReviewBannerOpenChat")
  end
end
