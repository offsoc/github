# frozen_string_literal: true

require "timer_daemon"

require "github/config/active_record"
require "github/config/stats"
require "github/config/redis"
require "github/pages/allocator"
require "github/sql"

# configure daemon
daemon = TimerDaemon.instance
daemon.err = GitHub.logger.method(:info)
daemon.redis = GitHub.job_coordination_redis

ScheduledPagesDfsTimerError = Class.new(StandardError)

# report exceptions to Failbot
daemon.error do |boom, timer|
  Failbot.report(ScheduledPagesDfsTimerError.new("timer #{timer.name} failed. #{boom.class}: #{boom}"), {
    "code.function" => "error",
    "code.namespace" => "config/timers.pages-dfs.rb",
    "timer" => timer.name
  })
end

# As dotcom moved to v3 naming, we needed the be able to use the FQDN
# of the host. For backwards-compatibility, we should continue using
# the shortname in Enterprise.
fqdn = Socket.gethostname
hostname = GitHub.enterprise? ? fqdn.split(".").first : fqdn

daemon.schedule "timerd-heartbeat-pages-dfs-global", 10.seconds do
  GitHub.dogstats.increment "timerd.heartbeat", tags: ["config:pages-dfs", "scope:global"]
end

daemon.schedule "timerd-heartbeat-pages-dfs-host", 10.seconds, scope: :host do
  GitHub.dogstats.increment "timerd.heartbeat", tags: ["config:pages-dfs", "scope:host"]
end

daemon.schedule "pages-partition-usage", 1.minute, scope: :host do
  GitHub::Pages::Allocator.update_disk_usage!(hostname: hostname)
end

daemon.schedule "pages-garbage-collect", 1.hour, scope: :host do
  GitHub::Pages::GarbageCollector.run!
end
