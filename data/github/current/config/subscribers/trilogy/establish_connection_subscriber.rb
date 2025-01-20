# typed: true
# frozen_string_literal: true

class Trilogy
  class EstablishConnectionSubscriber
    def initialize(notifier: ActiveSupport::Notifications, stats: GitHub.dogstats)
      @notifier = notifier
      @stats = stats
    end

    def call(name, started_at, finished_at, id, payload = {})
      duration = TimeSpan.new(started_at, finished_at).duration
      stats.timing "rpc.mysql.configure_connection.time", duration
      stats.distribution "rpc.mysql.configure_connection.dist.time", duration
    end

    def subscribe
      notifier.subscribe "establish_connection.active_record", self
    end

    private

    attr_reader :notifier, :stats
  end
end

Trilogy::EstablishConnectionSubscriber.new.subscribe
