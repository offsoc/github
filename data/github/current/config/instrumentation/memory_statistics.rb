# typed: true
# frozen_string_literal: true

class ExcessiveAllocationsError < StandardError
end

ActiveSupport::Notifications.subscribe "statistics.memory" do |_name, _started, _ended, _id, payload|
  if payload.dig(:data, :statistics, :heap_live_slots).to_i > 1_000_000
    Failbot.report ExcessiveAllocationsError.new,
                   app: "github-memory-statistics",
                   data: payload[:data]
  end
end
