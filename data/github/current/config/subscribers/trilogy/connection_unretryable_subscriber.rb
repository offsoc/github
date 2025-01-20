# typed: true
# frozen_string_literal: true

class Trilogy
  class ConnectionUnretryableSubscriber
    def initialize(notifier: ActiveSupport::Notifications, stats: GitHub.dogstats)
      @notifier = notifier
      @stats = stats
    end

    def call(name, started_at, finished_at, id, payload = {})
      stats.increment "rpc.mysql.connect.error.not_retryable",
                      tags: ["exception:#{payload[:error_class_name]}"]
    end

    def subscribe
      notifier.subscribe "connection_unretriable.active_record", self
    end

    private

    attr_reader :notifier, :stats
  end
end

Trilogy::ConnectionUnretryableSubscriber.new.subscribe
