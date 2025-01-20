require 'helper'
require 'octolytics/metrics'

module Octolytics
  class MetricsTest < Minitest::Test
    def test_initialize
      client = Metrics.new(secret: "abc123")
      assert_equal "abc123", client.secret
      assert_equal "development", client.environment
      assert_equal "http://127.0.0.1:7080", client.url
    end

    def test_initialize_with_adapter
      adapter = Object.new
      client = Metrics.new(adapter: adapter, secret: 'abc123')
      assert_equal adapter, client.adapter
    end

    def test_passes_timeout_to_adapter
      adapter = Struct.new(:timeout).new
      client = Metrics.new(adapter: adapter, timeout: 9, secret: 'abc123')
      assert_equal 9, adapter.timeout
    end

    def test_passes_logger_to_adapter
      adapter = Struct.new(:logger).new
      logger = $stdout
      client = Metrics.new(adapter: adapter, logger: logger, secret: 'abc123')
      assert_equal logger, adapter.logger
    end

    def test_secret_based_on_env_var
      ENV["METRICS_API_SECRET"] = "abc123"
      client = Metrics.new
      assert_equal "abc123", client.secret
    ensure
      ENV.delete "METRICS_API_SECRET"
    end

    def test_url_based_on_rails_env
      ENV["RAILS_ENV"] = "production"
      client = Metrics.new(secret: 'abc123')
      assert_equal "production", client.environment
      assert_equal "https://metrics-api.githubapp.com", client.url
    ensure
      ENV.delete "RAILS_ENV"
    end

    def test_url_based_on_rack_env
      ENV["RACK_ENV"] = "production"
      client = Metrics.new(secret: 'abc123')
      assert_equal "production", client.environment
      assert_equal "https://metrics-api.githubapp.com", client.url
    ensure
      ENV.delete "RACK_ENV"
    end

    def test_url_based_on_app_env
      ENV["APP_ENV"] = "production"
      client = Metrics.new(secret: 'abc123')
      assert_equal "production", client.environment
      assert_equal "https://metrics-api.githubapp.com", client.url
    ensure
      ENV.delete "APP_ENV"
    end

    def test_url_for_test_environment
      client = Metrics.new(environment: "test", secret: 'abc123')
      assert_equal "test", client.environment
      assert_equal "http://127.0.0.1:7080", client.url
    end

    def test_url_for_staging_environment
      client = Metrics.new(environment: "staging", secret: 'abc123')
      assert_equal "staging", client.environment
      assert_equal "https://metrics-api-staging.githubapp.com", client.url
    end

    def test_url_from_environment_var
      ENV["RAILS_ENV"] = "production"
      ENV["METRICS_API_HOST"] = "metrics-api-staging.githubapp.com"
      client = Metrics.new(secret: 'abc123')
      assert_equal "production", client.environment
      assert_equal "https://metrics-api-staging.githubapp.com", client.url
    ensure
      ENV.delete "RAILS_ENV"
      ENV.delete "METRICS_API_HOST"
    end

    def test_initialize_overriding_default_host
      client = Metrics.new(host: "metrics.com", secret: 'abc123')
      assert_equal "metrics.com", client.host
    end

    def test_initialize_with_nil_secret
      assert_raises ArgumentError do
        Metrics.new(secret: nil)
      end
    end

    def test_initialize_with_nil_host
      assert_raises ArgumentError do
        Metrics.new(host: nil, secret: 'abc123')
      end
    end

    def test_metrics
      VCR.use_cassette("all_metrics") do
        client = Metrics.new(secret: "javasux")
        response = client.metrics
        assert_equal 200, response.status
        assert_equal "application/json", response.headers["content-type"]
        data = response.data
        assert_equal 2, data.size
      end
    end

    def test_find_existing_metric
      VCR.use_cassette("find_existing_metric") do
        client = Metrics.new(secret: "javasux")
        response = client.find("large_organizations")
        assert_equal 200, response.status
        assert_equal "large_organizations", response.data["name"]
      end
    end

    def test_find_not_found_metric
      VCR.use_cassette("find_not_found_metric") do
        client = Metrics.new(secret: "javasux")
        assert_raises Octolytics::NotFoundError do
          client.find("i_dont_exist")
        end
      end
    end

    def test_create_metric
      VCR.use_cassette("create_metric") do
        client = Metrics.new(secret: "javasux")
        response = client.create({
          name: "bug_count",
          label: "Bug Count",
        })
        assert_equal 201, response.status
        assert_equal "bug_count", response.data["name"]
        assert_equal "Bug Count", response.data["label"]
      end
    end

    def test_create_metric_without_name
      client = Metrics.new(secret: "javasux")
      assert_raises ArgumentError do
        client.create({label: "Notre Dame"})
      end
    end

    def test_create_metric_without_label
      client = Metrics.new(secret: "javasux")
      assert_raises ArgumentError do
        client.create({name: "nd"})
      end
    end

    def test_create_already_created_metric
      VCR.use_cassette("create_already_created_metric") do
        client = Metrics.new(secret: "javasux")
        assert_raises Octolytics::ConflictError  do
          client.create({
            name: "large_organizations",
            label: "Large Organizations",
          })
        end
      end
    end

    def test_update_metric
      VCR.use_cassette("update_metric") do
        client = Metrics.new(secret: "javasux")
        response = client.update("large_organizations", {
          label: "LARGE Organizations",
        })
        assert_equal 200, response.status
        assert_equal "large_organizations", response.data["name"]
        assert_equal "LARGE Organizations", response.data["label"]
      end
    end

    def test_update_not_found_metric
      VCR.use_cassette("update_not_found_metric") do
        client = Metrics.new(secret: "javasux")
        assert_raises Octolytics::NotFoundError do
          client.update("i_do_not_exist", label: "I DO NOT EXIST")
        end
      end
    end

    def test_load
      VCR.use_cassette("load_metric_data") do
        client = Metrics.new(secret: "javasux")
        response = client.load([
            {name: "large_organizations", measurement: 887, timestamp: Time.utc(2014, 3, 3).to_i / 60 / 60 / 24 * 60 * 60 * 24 * 1_000},
            {name: "large_organizations", measurement: 877, timestamp: Time.utc(2014, 2, 24).to_i / 60 / 60 / 24 * 60 * 60 * 24 * 1_000},
            {name: "new_organizations", measurement: 5833, timestamp: Time.utc(2014, 3, 3).to_i / 60 / 60 / 24 * 60 * 60 * 24 * 1_000},
            {name: "new_organizations", measurement: 5862, timestamp: Time.utc(2014, 2, 24).to_i / 60 / 60 / 24 * 60 * 60 * 24 * 1_000},
        ])
        assert_equal 204, response.status
      end
    end

    def test_query
      VCR.use_cassette("query_metric_data") do
        to = Time.utc(2014, 3, 3).to_i * 1_000
        from = Time.utc(2014, 1, 27).to_i * 1_000
        client = Metrics.new(secret: "javasux")
        response = client.query_weekly(["large_organizations", "new_organizations"], {
          from: from,
          to: to,
          day_of_week: 1,
        })

        assert_equal 200, response.status

        assert_equal "new_organizations",
          response.data["header"]["metrics"]["new_organizations"]["name"]
        assert_equal "large_organizations",
          response.data["header"]["metrics"]["large_organizations"]["name"]

        assert_equal 2, response.data["measurements"].keys.size
        assert_equal 6, response.data["measurements"]["new_organizations"].size
        assert_equal 5833,
          response.data["measurements"]["new_organizations"][0]["measurement"]
        assert_equal 5862,
          response.data["measurements"]["new_organizations"][1]["measurement"]
      end
    end

    def test_query_for_not_found_metric
      VCR.use_cassette("query_for_not_found_metric") do
        client = Metrics.new(secret: "javasux")
        response = client.query_weekly(["i_do_not_exist"])
        assert_equal 200, response.status
        assert_equal({}, response.data["header"]["metrics"])
        assert_equal({}, response.data["measurements"])
      end
    end

    def test_query_daily
      VCR.use_cassette("query_daily_metric_data") do
        from = Time.utc(2015, 7, 15).to_i * 1_000
        to = Time.utc(2015, 8, 1).to_i * 1_000
        client = Metrics.new(secret: "javasux")
        response = client.query_daily(["ga_uniques_trailing_7", "ga_uniques_trailing_30"], {
          from: from,
          to: to
        })

        assert_equal 200, response.status
        assert response.data["header"]["metrics"]
        assert_equal 2, response.data["measurements"].keys.size
        assert_equal 18, response.data["measurements"]["ga_uniques_trailing_7"].size
        assert_equal 11918416,
          response.data["measurements"]["ga_uniques_trailing_7"][0]["measurement"]
        assert_equal 11840651,
          response.data["measurements"]["ga_uniques_trailing_7"][1]["measurement"]
      end
    end

    def test_query_metric_recent
      VCR.use_cassette("query_recent_metric_data") do
        client = Metrics.new(secret: "javasux")
        response = client.recent_data("ga_uniques_trailing_7", {
          number_of_items: 10
        })

        assert_equal 200, response.status
        assert_equal 10, response.data.size

        first = response.data.first
        refute_nil first
        assert_equal 10244896, first["measurement"]
        assert_equal "ga_uniques_trailing_7", first["name"]
      end
    end
  end
end
