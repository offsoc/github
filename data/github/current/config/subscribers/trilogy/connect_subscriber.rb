# typed: true
# frozen_string_literal: true

class Trilogy
  class ConnectSubscriber
    def initialize(notifier: ActiveSupport::Notifications, stats: GitHub.dogstats)
      @notifier = notifier
      @stats = stats
    end

    def call(name, started_at, finished_at, id, payload = {})
      duration = TimeSpan.new(started_at, finished_at).duration

      tags = ["rpc_host:#{payload[:host]}"]
      if (exception_class, _  = payload[:exception])
        tags << "exception_class:#{exception_class}"
      end

      stats.distribution "rpc.mysql.connect.dist.time", duration, tags: tags
    end

    def subscribe
      notifier.subscribe "connect.active_record", self
    end

    private

    attr_reader :notifier, :stats
  end
end

Trilogy::ConnectSubscriber.new.subscribe
