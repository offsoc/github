require "helper"
require "octolytics/deferred_response"

class DeferredResponseTest < Minitest::Test
  def test_callback_success
    EM.run_block do
      url = "http://example.com"
      stub_request(:get, url).to_return(:status => 200)
      request = EM::HttpRequest.new(url).get

      Octolytics::DeferredResponse.new(request).callback { |response|
        assert_kind_of Octolytics::Response, response
        assert_equal 200, response.status
      }.errback { |error|
        flunk "Should not get here"
      }
    end
  end

  def test_callback_error_from_status_code
    EM.run_block do
      url = "http://example.com"
      stub_request(:get, url).to_return(:status => 500)
      request = EM::HttpRequest.new(url).get

      Octolytics::DeferredResponse.new(request).callback { |response|
        flunk "Should not get here"
      }.errback { |error|
        assert_kind_of Octolytics::Error, error
      }
    end
  end

  def test_callback_error_from_timeout
    EM.run_block do
      url = "http://example.com"
      stub_request(:get, url).to_timeout
      request = EM::HttpRequest.new(url).get

      Octolytics::DeferredResponse.new(request).callback { |response|
        flunk "Should not get here"
      }.errback { |error|
        assert_kind_of Octolytics::Timeout, error
      }
    end
  end
end
