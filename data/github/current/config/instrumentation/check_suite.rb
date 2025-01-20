# typed: true
# frozen_string_literal: true

GlobalInstrumenter.subscribe("check_suite.notification_triggered") do |_event, _start, _finish, _id, payload|
  tags = ["conclusion:#{payload[:conclusion]}"]

  GitHub.dogstats.increment("actions.notifications.triggered", tags: tags)
end

GlobalInstrumenter.subscribe("notifications.delivery") do |_event, _start, _finish, _id, payload|
  if payload[:reason].to_s == "ci_activity"
    tags = ["handler:#{payload[:handler]}"]

    GitHub.dogstats.increment("actions.notifications.delivered", tags: tags)
  end
end
