# Running this script should show stats log output to stdout of
# metrics timing. Something like this should print out:
#
#   D, [2014-04-14T11:23:49.083231 #17446] DEBUG -- : Statsd: octolytics.metrics.metrics:1|ms
#   D, [2014-04-14T11:23:49.091766 #17446] DEBUG -- : Statsd: octolytics.reporter.referrers:8|ms

$:.unshift File.expand_path("../../lib", __FILE__)

require "pp"
require "logger"
require "statsd"
require "octolytics"
require "octolytics/metrics"
require "octolytics/instrumentation/statsd"

statsd = Statsd.new
Statsd.logger = Logger.new(STDOUT)
Octolytics::Instrumentation::StatsdSubscriber.client = statsd

metrics = Octolytics::Metrics.new({
  secret: "javasux",
  instrumenter: ActiveSupport::Notifications,
})

client = Octolytics::Client.new("github", {
  secret: "abc123",
  instrumenter: ActiveSupport::Notifications,
})

begin
  metrics.metrics
rescue => exception
  # server most likely not running so escape error
end

begin
  client.referrers
rescue => exception
  # server most likely not running so escape error
end
