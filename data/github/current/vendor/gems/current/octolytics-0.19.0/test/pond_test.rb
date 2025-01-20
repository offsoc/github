require 'helper'
require 'octolytics/pond'

module Octolytics
  class PondTest < Minitest::Test
    def test_initialize
      client = Pond.new(secret: "javasux")
      assert_equal "javasux", client.secret
      assert_equal "development", client.environment
      assert_equal "http://pond.dev", client.url
    end

    def test_passes_timeout_to_adapter
      client = Octolytics::Pond.new(secret: "javasux", timeout: 9)
      assert_equal 9, client.adapter.timeout
    end

    def test_url_based_on_rails_env
      ENV["RAILS_ENV"] = "staging"
      client = Octolytics::Pond.new(secret: "javasux")
      assert_equal "staging", client.environment
      assert_equal "https://pond-staging.githubapp.com", client.url
    ensure
      ENV.delete "RAILS_ENV"
    end

    def test_url_based_on_rack_env
      ENV["RACK_ENV"] = "production"
      client = Octolytics::Pond.new(secret: "javasux")
      assert_equal "production", client.environment
      assert_equal "https://pond.githubapp.com", client.url
    ensure
      ENV.delete "RACK_ENV"
    end

    def test_url_based_on_app_env
      ENV["APP_ENV"] = "production"
      client = Octolytics::Pond.new(secret: "javasux")
      assert_equal "production", client.environment
      assert_equal "https://pond.githubapp.com", client.url
    ensure
      ENV.delete "APP_ENV"
    end

    def test_url_for_test_environment
      client = Octolytics::Pond.new(environment: "test", secret: "javasux")
      assert_equal "test", client.environment
      assert_equal "http://pond.dev", client.url
    end

    def test_url_from_environment_var
      ENV["RAILS_ENV"] = "production"
      ENV["OCTOLYTICS_POND_URL"] = "https://pond-staging.githubapp.com"
      client = Octolytics::Pond.new(secret: "javasux")
      assert_equal "production", client.environment
      assert_equal "https://pond-staging.githubapp.com", client.url
    ensure
      ENV.delete "RAILS_ENV"
      ENV.delete "OCTOLYTICS_POND_URL"
    end

    def test_initialize_without_a_secret
      assert_raises ArgumentError do
        Octolytics::Pond.new()
      end
    end

    def test_initialize_with_nil_secret
      assert_raises ArgumentError do
        Octolytics::Pond.new(secret: nil)
      end
    end

    def test_initialize_with_nil_url
      assert_raises ArgumentError do
        Octolytics::Pond.new(url: nil)
      end
    end

    def test_referrers
      VCR.use_cassette("pond_referrers") do
        client = Octolytics::Pond.new(secret: "javasux")
        response = client.referrers(1)
        assert_kind_of Octolytics::Response, response

        data = response.data
        assert data.include?("latencyMillis")

        view = data["data"][0]
        assert_equal "github.com", view["referrer"]
      end
    end

    def test_referrer_paths
      VCR.use_cassette("pond_referrer_paths") do
        client = Octolytics::Pond.new(secret: "javasux")
        response = client.referrer_paths(1, "github.com")
        assert_kind_of Octolytics::Response, response

        data = response.data
        assert data.include?("latencyMillis")

        view = data["data"][0]
        assert_equal "/mojombo", view["path"]
        assert_equal 48, view["count"]
        assert_equal 28, view["uniques"]
      end
    end

    def test_content
      VCR.use_cassette("pond_content") do
        client = Octolytics::Pond.new(secret: "javasux")
        response = client.content(1)
        assert_kind_of Octolytics::Response, response

        data = response.data
        assert data.include?("latencyMillis")

        view = data["data"][0]
        assert_equal "/mojombo/grit/commits/master", view["path"]
        assert_equal 15, view["count"]
        assert_equal 3, view["uniques"]
        refute view["title"].empty?
      end
    end

    def test_counts
      VCR.use_cassette("pond_counts") do
        client = Octolytics::Pond.new(secret: "javasux")
        response = client.counts(1, 'page_view')

        assert_kind_of Octolytics::Response, response

        data = response.data
        assert data.include?("latencyMillis")

        view = data["data"][0]
        assert_equal 1403272800000, view["timestamp"]
        assert_equal 7, view["count"]
        assert_equal 5, view["uniques"]
      end
    end
  end
end
