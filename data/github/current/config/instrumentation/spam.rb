# frozen_string_literal: true

GitHub.subscribe "spam_queue.create" do |_event, _start, _ending, _transaction_id, _payload|
  GitHub.dogstats.increment "spam.queue_event", tags: ["operation:create"]
end

GitHub.subscribe "spam_queue.destroy" do |_event, _start, _ending, _transaction_id, _payload|
  GitHub.dogstats.increment "spam.queue_event", tags: ["operation:destroy"]
end

GitHub.subscribe /spam_queue_entry\.(create|destroy|move)/ do |event, _start, _ending, _transaction_id, payload|
  event_name = event.split(".").last
  GitHub.dogstats.increment "spam.queue_entry_event", tags: [
    "operation:#{event_name}",
    "queue_name:#{payload[:queue_name]}",
  ]
end

GitHub.subscribe "spam_queue_entry.resolved" do |_event, _start, _ending, _transaction_id, payload|
  GitHub.dogstats.increment "spam.queue_entry_event", tags: [
    "actor:#{payload[:actor]}",
    "operation:resolved",
    "queue_name:#{payload[:queue_name]}",
    "resolution:#{payload[:resolution]}",
  ]

  if payload[:queued_time_in_seconds]
    duration_ms = payload[:queued_time_in_seconds] * 1000
    GitHub.dogstats.distribution("spam.queue_entry_event.time_enqueued", duration_ms, { tags: ["operation:resolved"] })
  end
end

GitHub.subscribe "spam_queue_entry.drop" do |_event, _start, _ending, _transaction_id, payload|
  GitHub.dogstats.increment "spam.queue_entry_event", tags: [
    "actor:#{payload[:actor]}",
    "operation:drop",
    "queue_name:#{payload[:queue_name]}",
  ]

  if payload[:queued_time_in_seconds]
    duration_ms = payload[:queued_time_in_seconds] * 1000
    GitHub.dogstats.distribution("spam.queue_entry_event.time_enqueued", duration_ms, { tags: ["operation:drop"] })
  end
end
