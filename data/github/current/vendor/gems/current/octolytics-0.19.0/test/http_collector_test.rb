require "helper"
require "octolytics/client"

class HttpCollectorTest < Minitest::Test
  def test_initialize
    client = Octolytics::HttpCollector.new("github", secret: "abc123")
    assert_equal "github", client.app_id
    assert_equal "abc123", client.secret
    assert_equal "development", client.environment
    assert_equal "collector.dev", client.host
    assert_equal "http://collector.dev", client.url
    assert_equal "collector.dev", client.script_host
    assert_equal "http://collector.dev/assets/api.js", client.script_url
  end

  def test_initialize_with_adapter
    adapter = Object.new
    client = Octolytics::HttpCollector.new("github", adapter: adapter, secret: 'abc123')
    assert_equal adapter, client.adapter
  end

  def test_passes_timeout_to_adapter
    adapter = Struct.new(:timeout).new
    client = Octolytics::HttpCollector.new("github", adapter: adapter, timeout: 9, secret: 'abc123')
    assert_equal 9, adapter.timeout
  end

  def test_url_based_on_rails_env
    ENV["RAILS_ENV"] = "staging"
    client = Octolytics::HttpCollector.new("github", secret: 'abc123')
    assert_equal "staging", client.environment
    assert_equal "collector-staging.githubapp.com", client.host
    assert_equal "https://collector-staging.githubapp.com", client.url
    assert_equal "collector-staging.githubapp.com", client.script_host
    assert_equal "https://collector-staging.githubapp.com/assets/api.js", client.script_url
  ensure
    ENV.delete "RAILS_ENV"
  end

  def test_url_based_on_rack_env
    ENV["RACK_ENV"] = "production"
    client = Octolytics::HttpCollector.new("github", secret: 'abc123')
    assert_equal "production", client.environment
    assert_equal "https://collector.githubapp.com", client.url
  ensure
    ENV.delete "RACK_ENV"
  end

  def test_url_based_on_app_env
    ENV["APP_ENV"] = "production"
    client = Octolytics::HttpCollector.new("github", secret: 'abc123')
    assert_equal "production", client.environment
    assert_equal "https://collector.githubapp.com", client.url
  ensure
    ENV.delete "APP_ENV"
  end

  def test_url_for_test_environment
    client = Octolytics::HttpCollector.new("github", environment: "test", secret: 'abc123')
    assert_equal "test", client.environment
    assert_equal "http://collector.dev", client.url
  end

  def test_url_from_environment_var
    ENV["RAILS_ENV"] = "production"
    ENV["OCTOLYTICS_HOST"] = "collector-staging.githubapp.com"
    client = Octolytics::HttpCollector.new("github", secret: 'abc123')
    assert_equal "production", client.environment
    assert_equal "https://collector-staging.githubapp.com", client.url
  ensure
    ENV.delete "RAILS_ENV"
    ENV.delete "OCTOLYTICS_HOST"
  end

  def test_script_host_for_production_environment
    client = Octolytics::HttpCollector.new("github", environment: "production", secret: 'abc123')
    assert_equal "production", client.environment
    assert_equal "collector-cdn.github.com", client.script_host
  end

  def test_script_host_for_non_production_environment_matches_default_host
    ["development", "test"].each do |env|
      client = Octolytics::HttpCollector.new("github", environment: env, secret: 'abc123')
      assert_equal client.host, client.script_host
    end
  end

  def test_script_host_from_environment_var_overrides_application_environment_var
    ENV["RAILS_ENV"] = "production"
    ENV["OCTOLYTICS_SCRIPT_HOST"] = "https://some-cdn.githubapp.com"
    client = Octolytics::HttpCollector.new("github", secret: 'abc123')
    assert_equal "production", client.environment
    assert_equal "https://some-cdn.githubapp.com", client.script_host
  ensure
    ENV.delete "RAILS_ENV"
    ENV.delete "OCTOLYTICS_SCRIPT_HOST"
  end

  def test_initialize_with_blank_app_id
    assert_raises ArgumentError do
      Octolytics::HttpCollector.new(nil, secret: 'abc123')
    end

    assert_raises ArgumentError do
      Octolytics::HttpCollector.new("", secret: 'abc123')
    end
  end

  def test_initialize_overriding_default_host
    client = Octolytics::HttpCollector.new("github", host: "collector.com", secret: 'abc123')
    assert_equal "github", client.app_id
    assert_equal "collector.com", client.host
  end

  def test_initialize_overriding_default_content_type
    client = Octolytics::HttpCollector.new("github", content_type: "application/json", secret: 'abc123')
    assert_equal "github", client.app_id
    assert_equal "application/json", client.content_type
  end

  def test_initialize_with_nil_secret
    assert_raises ArgumentError do
      Octolytics::HttpCollector.new("github", secret: nil)
    end
  end

  def test_initialize_with_nil_host
    assert_raises ArgumentError do
      Octolytics::HttpCollector.new("github", host: nil, secret: 'abc123')
    end
  end

  def test_initialize_with_nil_content_type
    assert_raises ArgumentError do
      Octolytics::HttpCollector.new("github", content_type: nil, secret: 'abc123')
    end
  end

  def test_initialize_defaults_content_type_to_env_variable
    ENV["OCTOLYTICS_CONTENT_TYPE"] = "application/json"
    client = Octolytics::HttpCollector.new("github", secret: 'abc123')
    assert_equal "application/json", client.content_type
  ensure
    ENV.delete "OCTOLYTICS_CONTENT_TYPE"
  end

  def test_record
    expected_data = {"message" => "Got it!"}
    expected_body = JSON.dump(expected_data)
    now = Time.utc(2014, 1, 21, 1, 2, 3)
    client = Octolytics::HttpCollector.new("github", secret: 'abc123')

    Time.stub :now, now do
      stub_request(:post, "http://collector.dev/github/events").
        with({
          :body => "{\"events\":[{\"event_type\":\"tweet\",\"dimensions\":{\"user_id\":1234},\"measures\":{\"count\":1},\"context\":{\"packages\":[\"1\",\"2\"]},\"timestamp\":#{now.to_i}}]}",
          :headers => {
            "Content-Type" => "application/vnd.github-octolytics.batch+json",
            "User-Agent" => "Octolytics v#{Octolytics::VERSION}",
            "Authorization" => "Octolytics 69079b6a336e04721f4a4dbf411097aee7c0e97aefab473f7653eac4c0f42d4e",
          },
        }).
        to_return({
          :status => 200,
          :body => expected_body,
          :headers => {"Content-Type" => client.content_type}
        })

      event_type = "tweet"
      dimensions = {user_id: 1234}
      measures = {count: 1}
      context = {packages: ["1", "2"]}

      response = client.record(event_type, dimensions, measures, context)

      assert_kind_of Octolytics::Response, response
      assert_equal expected_body, response.body
      assert_equal expected_data, response.data
    end
  end

  def test_record_multiple
    expected_data = {"message" => "Got it!"}
    expected_body = JSON.dump(expected_data)
    now = Time.utc(2014, 1, 21, 1, 2, 3)
    client = Octolytics::HttpCollector.new("github", secret: 'abc123')

    Time.stub :now, now do
      stub_request(:post, "http://collector.dev/github/events").
        with({
          :body => {events:[
            {dimensions: {user_id: 1234}, measures: {count: 1}, context: {packages: ["1", "2"]}, timestamp: now.to_i, event_type: "tweet"},
            {dimensions: {user_id: 1234}, measures: {count: 1}, context: {packages: ["1", "2"]}, timestamp: now.to_i, event_type: "tweet"},
          ]}.to_json,
          :headers => {
            "Content-Type" => "application/vnd.github-octolytics.batch+json",
            "User-Agent" => "Octolytics v#{Octolytics::VERSION}",
            "Authorization" => "Octolytics 3ef4eef6d36cbe13fc295e85454042eeb971fd4696e90833032a8edb97a46c47",
          },
        }).
        to_return({
          :status => 200,
          :body => expected_body,
          :headers => {"Content-Type" => client.content_type}
        })

      event_type = "tweet"
      dimensions = {user_id: 1234}
      measures = {count: 1}
      context = {packages: ["1", "2"]}

      response = client.record([
        {event_type: event_type, dimensions: dimensions, measures: measures, context: context},
        {event_type: event_type, dimensions: dimensions, measures: measures, context: context},
      ])

      assert_kind_of Octolytics::Response, response
      assert_equal expected_body, response.body
      assert_equal expected_data, response.data
    end
  end

  def test_record_with_timestamp
    expected_data = {"message" => "Got it!"}
    expected_body = JSON.dump(expected_data)
    time = Time.utc(1981, 11, 25)
    client = Octolytics::HttpCollector.new("github", secret: 'abc123')

    stub_request(:post, "http://collector.dev/github/events").
      with({
        :body => "{\"events\":[{\"event_type\":\"tweet\",\"dimensions\":{},\"measures\":{},\"context\":{},\"timestamp\":#{time.to_i}}]}",
        :headers => {
           "Content-Type" => "application/vnd.github-octolytics.batch+json",
           "User-Agent" => "Octolytics v#{Octolytics::VERSION}",
           "Authorization" => "Octolytics 29a7501ce4955573c10c8d80bfff6321b10901306202b22bf39b28a5c2a1acc3",
        },
      }).
      to_return({
        :status => 200,
        :body => expected_body,
        :headers => {"Content-Type" => client.content_type}
      })

    response = client.record("tweet", {}, {}, {}, time)

    assert_kind_of Octolytics::Response, response
    assert_equal expected_body, response.body
    assert_equal expected_data, response.data
  end
end
