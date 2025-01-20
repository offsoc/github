require "helper"
require "support/fake_udp_socket"
require "statsd"
require "octolytics/instrumentation/statsd"
require "octolytics/adapters/noop"

class StatsdInstrumentationTest < Minitest::Test
  attr_reader :client, :socket, :metrics_client, :collector_client, :reporter_client

  def setup
    @client = Statsd.new
    @socket = FakeUdpSocket.new

    @metrics_client = Octolytics::Metrics.new({
      secret: "javasux",
      instrumenter: ActiveSupport::Notifications,
      adapter: Octolytics::Adapters::Noop.new,
    })

    @collector_client = Octolytics::HttpCollector.new("github", {
      secret: "abc123",
      instrumenter: ActiveSupport::Notifications,
      adapter: Octolytics::Adapters::Noop.new,
    })

    @reporter_client = Octolytics::Reporter.new("github", {
      secret: "abc123",
      instrumenter: ActiveSupport::Notifications,
      adapter: Octolytics::Adapters::Noop.new,
    })

    Octolytics::Instrumentation::StatsdSubscriber.client = @client

    # crappy way of overriding socket for statsd instance
    Thread.current[:statsd_socket] = @socket
  end

  def teardown
    Octolytics::Instrumentation::StatsdSubscriber.client = nil
    Thread.current[:statsd_socket] = nil
  end

  def test_metrics_metrics
    metrics_client.metrics
    assert_timer "octolytics.metrics.metrics"
  end

  def test_metrics_find
    metrics_client.find("test")
    assert_timer "octolytics.metrics.find"
  end

  def test_metrics_create
    metrics_client.create({
      name: "test",
      label: "test",
    })
    assert_timer "octolytics.metrics.create"
  end

  def test_metrics_update
    metrics_client.update("test", {
      label: "test 2",
    })
    assert_timer "octolytics.metrics.update"
  end

  def test_metrics_load
    metrics_client.load([])
    assert_timer "octolytics.metrics.load"
  end

  def test_metrics_query_weekly
    metrics_client.query_weekly(["testing"])
    assert_timer "octolytics.metrics.query_weekly"
  end

  def test_collector_record
    collector_client.record([])
    assert_timer "octolytics.collector.record"
  end

  def test_reporter_referrers
    reporter_client.referrers
    assert_timer "octolytics.reporter.referrers"
  end

  def test_reporter_referrer_paths
    reporter_client.referrer_paths({
      referrer: "http://johnnunemaker.com",
    })
    assert_timer "octolytics.reporter.referrer_paths"
  end

  def test_reporter_content
    reporter_client.content
    assert_timer "octolytics.reporter.content"
  end

  def test_reporter_counts
    reporter_client.counts
    assert_timer "octolytics.reporter.counts"
  end

  def test_reporter_top
    reporter_client.top
    assert_timer "octolytics.reporter.top"
  end

  def test_reporter_raw_events
    reporter_client.raw_events
    assert_timer "octolytics.reporter.raw_events"
  end

  private

  def assert_timer(metric)
    assert socket.timer?(metric),
      "Expected the timer #{metric.inspect} to be included in #{socket.timer_metric_names.inspect}, but it was not."
  end

  def assert_no_timer(metric)
    assert ! socket.timer?(metric),
      "Expected the timer #{metric.inspect} to not be included in #{socket.timer_metric_names.inspect}, but it was."
  end

  def assert_counter(metric)
    assert socket.counter?(metric),
      "Expected the counter #{metric.inspect} to be included in #{socket.counter_metric_names.inspect}, but it was not."
  end

  def assert_no_counter(metric)
    assert ! socket.counter?(metric),
      "Expected the counter #{metric.inspect} to not be included in socket.counter_metric_names.inspect}, but it was."
  end
end
