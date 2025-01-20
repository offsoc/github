require "helper"
require "octolytics/client"

class ClientTest < Minitest::Test
  def test_initialize
    client = Octolytics::Client.new("github", secret: 'abc123')
    assert_equal "github", client.app_id
    assert_instance_of Octolytics::HttpCollector, client.collector
  end

  def test_collector_url
    client = Octolytics::Client.new("github", secret: 'abc123')
    assert_equal client.collector.url, client.collector_url
  end

  def test_collector_host
    client = Octolytics::Client.new("github", secret: 'abc123')
    assert_equal client.collector.host, client.collector_host
  end

  def test_collector_script_host
    client = Octolytics::Client.new("github", secret: 'abc123')
    assert_equal client.collector.script_host, client.collector_script_host
  end

  def test_collector_script_url
    client = Octolytics::Client.new("github", secret: 'abc123')
    assert_equal client.collector.script_url, client.collector_script_url
  end

  def test_record
    expected_data = {"message" => "Got it!"}
    expected_body = JSON.dump(expected_data)

    now = Time.now
    event_type = "tweet"
    dimensions = {user_id: 1234}
    measures = {count: 1}
    context = {}

    collector = Minitest::Mock.new
    client = Octolytics::Client.new("github", collector: collector)

    collector.expect :record, :recorded, [event_type, dimensions, measures, context, now]
    client.record(event_type, dimensions, measures, context, now)
    collector.verify
  end

  def test_secret_is_passed_to_reporter
    client = Octolytics::Client.new("github", secret: "abc123")
    assert_equal "abc123", client.reporter.secret
  end

  def test_secret_is_passed_to_collector
    client = Octolytics::Client.new("github", secret: "abc123")
    assert_equal "abc123", client.collector.secret
  end

  def test_secret
    client = Octolytics::Client.new("github", secret: "abc123")
    assert_equal "abc123", client.secret
  end

  def test_secret_from_env_var
    ENV["OCTOLYTICS_SECRET"] = "asdf"
    client = Octolytics::Client.new("github")
    assert_equal "asdf", client.secret
  ensure
    ENV.delete "OCTOLYTICS_SECRET"
  end

  def test_generate_actor_hash
    client = Octolytics::Client.new("github", secret: "abc123")
    assert_equal "f02877f24c9dd37542268a28627ebaf2e07d0d114d9482abcdc20f60874b40b3",
      client.generate_actor_hash(1)

    client = Octolytics::Client.new("github", secret: "gibberish")
    assert_equal "b99d0387f61f1e50e394a675a06be5b631d685d520de9af282a0b589352527ab",
      client.generate_actor_hash(3)
  end

  def test_instrumenter_passed_to_reporter
    instrumenter = Object.new
    client = Octolytics::Client.new("github", {
      secret: "abc123",
      instrumenter: instrumenter,
    })
    assert_equal client.reporter.instrumenter, instrumenter
  end

  def test_instrumenter_passed_to_collcollector
    instrumenter = Object.new
    client = Octolytics::Client.new("github", {
      secret: "abc123",
      instrumenter: instrumenter,
    })
    assert_equal client.collector.instrumenter, instrumenter
  end
end
