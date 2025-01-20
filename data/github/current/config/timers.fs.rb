# frozen_string_literal: true

require "timer_daemon"
require "active_support/core_ext/numeric/time"
require "github/config/redis"
require File.expand_path("../basic", __FILE__)
require "github"
require "github/config/stats"
require "github/config/active_job"
require "github/dgit"

# configure daemon
daemon = TimerDaemon.instance
daemon.err = GitHub.logger.method(:info)
daemon.redis = GitHub.job_coordination_redis

ScheduledFsTimerError = Class.new(StandardError)

# report exceptions to Failbot
daemon.error do |_boom, timer|
  Failbot.report(ScheduledFsTimerError.new("timer #{timer.name} failed"), timer: timer.name)
end

daemon.schedule "timerd-heartbeat-fs-global", 10.seconds do
  GitHub.dogstats.increment "timerd.heartbeat", tags: ["config:fs", "scope:global"]
end

daemon.schedule "timerd-heartbeat-fs-host", 10.seconds, scope: :host do
  GitHub.dogstats.increment "timerd.heartbeat", tags: ["config:fs", "scope:host"]
end

daemon.schedule "dgit-loadavg-check", 10.seconds, scope: :host do
  GitHub::DGit.loadavg_check
end
