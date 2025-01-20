# typed: true
# frozen_string_literal: true

class Trilogy
  class ConnectionRetryExhaustedSubscriber
    def initialize(notifier: ActiveSupport::Notifications, stats: GitHub.dogstats)
      @notifier = notifier
      @stats = stats
    end

    def call(name, started_at, finished_at, id, payload = {})
      stats.increment "rpc.mysql.connect.error.retries_exhausted",
                      tags: ["exception:#{payload[:error_class_name]}"]
    end

    def subscribe
      notifier.subscribe "connection_retries_exhausted.active_record", self
    end

    private

    attr_reader :notifier, :stats
  end
end

Trilogy::ConnectionRetryExhaustedSubscriber.new.subscribe
