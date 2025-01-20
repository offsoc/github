# typed: true
# frozen_string_literal: true

module Trilogy::QueryDeadlockSubscriber
  def self.call(name, start, finish, id, payload = {})
    error = payload[:error]

    # Record datadog
    GitHub.dogstats.increment("rpc.mysql.retry.deadlock.count", tags: [
      "exception:#{error.class.name}",
    ])

    # Report to sentry
    # We're using github-user for now, because at times we have many
    # exceptions reported here and they may be handled successfully through
    # retries. In the future this should go to the standard github app, but
    # for the time being we don't want it causing alerts.
    Failbot.report(error, app: "github-user", "#event": "deadlock_retry", transaction_open: !!payload[:transaction])
  end

  def self.subscribe
    ActiveSupport::Notifications.subscribe("sql_deadlock.active_record", self)
  end
end

Trilogy::QueryDeadlockSubscriber.subscribe
