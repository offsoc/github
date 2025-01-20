# typed: true
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("merge_queue.event") do |payload|
    message = {
      event: payload[:event],
      repository: serializer.repository(payload[:repository]),
      protected_branch: serializer.protected_branch(payload[:protected_branch]),
      queue: serializer.merge_queue(payload[:queue]),
      entries: payload[:entries].map { |entry| serializer.merge_queue_entry(entry) },
      group_entries: [],
      actor: serializer.user(payload[:actor]),
      reason: payload[:reason],
    }

    publish(message, schema: "github.merge_queue.v1.MergeQueueEvent")
  end

  subscribe("merge_queue_entry.event") do |payload|
    message = {
      event: payload[:event],
      pull_request: serializer.pull_request(payload[:pull_request]),
      repository: serializer.repository(payload[:repository]),
      queue: serializer.merge_queue(payload[:queue]),
      entry: serializer.merge_queue_entry(payload[:entry]),
      group_entries: [],
      enqueuer: serializer.user(payload[:enqueuer]),
      dequeuer: serializer.user(payload[:dequeuer]),
      required_status_checks: payload[:required_status_checks].map do |status_check|
        serializer.merge_queue_required_status_check(status_check)
      end,
      removal_reason: payload[:removal_reason],
      queue_depth: payload[:queue_depth],
    }

    publish(message, schema: "github.merge_queue.v1.MergeQueueEntryEvent")
  end
end
