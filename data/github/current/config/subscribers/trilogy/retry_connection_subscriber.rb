# typed: true
# frozen_string_literal: true

module Trilogy::RetryConnectionSubscriber
  def self.call(name, start, finish, id, payload = {})
    GitHub.dogstats.increment("rpc.mysql.retry.query.count", tags: [
      "exception:#{payload[:error].class.name}",
    ])
  end

  def self.subscribe
    ActiveSupport::Notifications.subscribe("retry_connection.active_record", self)
  end
end

Trilogy::RetryConnectionSubscriber.subscribe
