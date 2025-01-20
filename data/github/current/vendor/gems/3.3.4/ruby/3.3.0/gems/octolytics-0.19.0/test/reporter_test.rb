require 'helper'
require 'octolytics/reporter'

module Octolytics
  class ReporterTest < Minitest::Test
    def test_initialize
      client = Reporter.new("github", secret: "abc123")
      assert_equal "github", client.app_id
      assert_equal "abc123", client.secret
      assert_equal "development", client.environment
      assert_equal "http://analytics.dev", client.url
    end

    def test_passes_timeout_to_adapter
      client = Octolytics::Reporter.new("github", secret: "abc123", timeout: 9)
      assert_equal 9, client.adapter.timeout
    end

    def test_url_based_on_rails_env
      ENV["RAILS_ENV"] = "staging"
      client = Octolytics::Reporter.new("github", secret: "abc123")
      assert_equal "staging", client.environment
      assert_equal "https://analytics-app-staging.service.private-us-east-1.github.net", client.url
    ensure
      ENV.delete "RAILS_ENV"
    end

    def test_url_based_on_rack_env
      ENV["RACK_ENV"] = "production"
      client = Octolytics::Reporter.new("github", secret: "abc123")
      assert_equal "production", client.environment
      assert_equal "https://analytics-app.service.private-us-east-1.github.net", client.url
    ensure
      ENV.delete "RACK_ENV"
    end

    def test_url_based_on_app_env
      ENV["APP_ENV"] = "production"
      client = Octolytics::Reporter.new("github", secret: "abc123")
      assert_equal "production", client.environment
      assert_equal "https://analytics-app.service.private-us-east-1.github.net", client.url
    ensure
      ENV.delete "APP_ENV"
    end

    def test_url_for_test_environment
      client = Octolytics::Reporter.new("github", environment: "test", secret: "abc123")
      assert_equal "test", client.environment
      assert_equal "http://analytics.dev", client.url
    end

    def test_url_from_environment_var
      ENV["RAILS_ENV"] = "production"
      ENV["OCTOLYTICS_REPORTER_URL"] = "https://analytics-app-staging.service.private-us-east-1.github.net"
      client = Octolytics::Reporter.new("github", secret: "abc123")
      assert_equal "production", client.environment
      assert_equal "https://analytics-app-staging.service.private-us-east-1.github.net", client.url
    ensure
      ENV.delete "RAILS_ENV"
      ENV.delete "OCTOLYTICS_REPORTER_URL"
    end

    def test_initialize_with_blank_app_id
      assert_raises ArgumentError do
        Octolytics::Reporter.new(nil)
      end

      assert_raises ArgumentError do
        Octolytics::Reporter.new("")
      end
    end

    def test_initialize_without_a_secret
      assert_raises ArgumentError do
        Octolytics::Reporter.new("github")
      end
    end

    def test_initialize_with_nil_secret
      assert_raises ArgumentError do
        Octolytics::Reporter.new("github", secret: nil)
      end
    end

    def test_initialize_with_nil_url
      assert_raises ArgumentError do
        Octolytics::Reporter.new("github", url: nil)
      end
    end

    def test_referrers
      expected_data = { "referrers" => [{ "referrer" => "Google", "total" => 1234 }] }
      expected_body = JSON.dump(expected_data)
      client = Octolytics::Reporter.new("github", secret: "abc123")

      stub_request(:get, "http://analytics.dev/apps/github/page_view/repository_id/1/referrers?from=-2w").
        with({
          :headers => {
            "Accept" => "application/json",
            "User-Agent" => "Octolytics v#{Octolytics::VERSION}",
            "Authorization" => /\AToken /,
          },
        }).
        to_return({
          :status => 200,
          :body => expected_body,
          :headers => {"Content-Type" => "application/json"}
        })

      response = client.referrers(
        event_type:       'page_view',
        dimension:        'repository_id',
        dimension_value:  1,
        from:             '-2w',
      )

      assert_kind_of Octolytics::Response, response
      assert_equal expected_body, response.body
      assert_equal expected_data, response.data
    end

    def test_referrer_paths_requires_referrer
      client = Octolytics::Reporter.new("github", secret: "abc123")
      assert_raises ArgumentError do
        client.referrer_paths(
          event_type:       'page_view',
          dimension:        'repository_id',
          dimension_value:  1,
        )
      end
    end

    def test_referrer_paths
      expected_data = { "paths" => [{ "path" => "/", "total" => 1234 }] }
      expected_body = JSON.dump(expected_data)
      client = Octolytics::Reporter.new("github", secret: "abc123")

      stub_request(:get, "http://analytics.dev/apps/github/page_view/repository_id/1/referrer_paths?referrer=github.com&from=-2w").
        with({
          :headers => {
            "Accept" => "application/json",
            "User-Agent" => "Octolytics v#{Octolytics::VERSION}",
            "Authorization" => /\AToken /,
          },
        }).
        to_return({
          :status => 200,
          :body => expected_body,
          :headers => {"Content-Type" => "application/json"}
        })

      response = client.referrer_paths(
        event_type:       'page_view',
        dimension:        'repository_id',
        dimension_value:  1,
        referrer:         'github.com',
        from:             '-2w',
      )

      assert_kind_of Octolytics::Response, response
      assert_equal expected_body, response.body
      assert_equal expected_data, response.data
    end

    def test_content
      expected_data = { "content" => [{ "path" => "/mojombo/grid", "total" => 1234 }] }
      expected_body = JSON.dump(expected_data)
      client = Octolytics::Reporter.new("github", secret: "abc123")

      stub_request(:get, "http://analytics.dev/apps/github/page_view/repository_id/1/content?from=-2w").
        with({
          :headers => {
            "Accept" => "application/json",
            "User-Agent" => "Octolytics v#{Octolytics::VERSION}",
            "Authorization" => /\AToken /,
          },
        }).
        to_return({
          :status => 200,
          :body => expected_body,
          :headers => {"Content-Type" => "application/json"}
        })

      response = client.content(
        event_type:       'page_view',
        dimension:        'repository_id',
        dimension_value:  1,
        from:             '-2w',
      )

      assert_kind_of Octolytics::Response, response
      assert_equal expected_body, response.body
      assert_equal expected_data, response.data
    end

    def test_counts
      expected_data = { "counts" => [{ "bucket" => 123456789, "total" => 1234 }] }
      expected_body = JSON.dump(expected_data)
      client = Octolytics::Reporter.new("github", secret: "abc123")

      stub_request(:get, "http://analytics.dev/apps/github/page_view/repository_id/1/hourly/counts?from=-2w").
        with({
          :headers => {
            "Accept" => "application/json",
            "User-Agent" => "Octolytics v#{Octolytics::VERSION}",
            "Authorization" => /\AToken /,
          },
        }).
        to_return({
          :status => 200,
          :body => expected_body,
          :headers => {"Content-Type" => "application/json"}
        })

      response = client.counts(
        event_type:       'page_view',
        dimension:        'repository_id',
        dimension_value:  1,
        bucket:           'hourly',
        from:             '-2w',
      )

      assert_kind_of Octolytics::Response, response
      assert_equal expected_body, response.body
      assert_equal expected_data, response.data
    end

    def test_counts_defaults
      expected_data = { "counts" => [{ "bucket" => 123456789, "total" => 1234 }] }
      expected_body = JSON.dump(expected_data)
      client = Octolytics::Reporter.new("github", secret: "abc123")

      stub_request(:get, "http://analytics.dev/apps/github/page_view/repository_id/1/hourly/counts").
        with({
          :headers => {
            "Accept" => "application/json",
            "User-Agent" => "Octolytics v#{Octolytics::VERSION}",
            "Authorization" => /\AToken /,
          },
        }).
        to_return({
          :status => 200,
          :body => expected_body,
          :headers => {"Content-Type" => "application/json"}
        })

      # bucket: 'hourly' is default
      response = client.counts(
        event_type:       'page_view',
        dimension:        'repository_id',
        dimension_value:  1,
      )

      assert_kind_of Octolytics::Response, response
      assert_equal expected_body, response.body
      assert_equal expected_data, response.data
    end

    def test_top
      expected_data = { "top" => [{ "repository_id" => "1", "total" => 1234 }] }
      expected_body = JSON.dump(expected_data)
      client = Octolytics::Reporter.new("github", secret: "abc123")

      stub_request(:get, "http://analytics.dev/apps/github/page_view/actor_id/1/top/repository_id").
        with({
          :headers => {
            "Accept" => "application/json",
            "User-Agent" => "Octolytics v#{Octolytics::VERSION}",
            "Authorization" => /\AToken /,
          },
        }).
        to_return({
          :status => 200,
          :body => expected_body,
          :headers => {"Content-Type" => "application/json"}
        })

      response = client.top(
        event_type:         'page_view',
        grouped_dimension:  'repository_id',
        dimension:          'actor_id',
        dimension_value:    1,
      )

      assert_kind_of Octolytics::Response, response
      assert_equal expected_body, response.body
      assert_equal expected_data, response.data
    end

    def test_raw_events_compressed
      uncompressed_data = "id\tapp_id\tevent_type\ttimestamp\tdata\n" * 5
      compressed_data = gzip(uncompressed_data)

      client = Octolytics::Reporter.new("github", secret: "abc123")

      stub_request(:get, "http://analytics.dev/apps/github/page_view/events").
        with({
          :headers => {
            "Accept" => "application/x-gzip",
            "User-Agent" => "Octolytics v#{Octolytics::VERSION}",
            "Authorization" => /\AToken /,
          },
        }).
        to_return({
          :status => 200,
          :body => compressed_data,
          :headers => {"Content-Type" => "application/x-gzip"}
        })

        data = ""
        response = client.raw_events(event_type: 'page_view') do |chunk|
          data += chunk
        end

        assert_kind_of Octolytics::Response, response
        assert_equal compressed_data, data

        data = ""
        response = client.raw_events(event_type: 'page_view', decompress: true) do |chunk|
          data += chunk
        end

        assert_kind_of Octolytics::Response, response
        assert_equal uncompressed_data, data
    end
  end
end
