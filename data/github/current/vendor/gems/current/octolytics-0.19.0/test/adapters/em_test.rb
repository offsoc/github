require "helper"
require "octolytics/adapters/em"

class EmHttpTest < Minitest::Test
  def test_initialize
    adapter = Octolytics::Adapters::EM.new
    assert_instance_of Octolytics::Adapters::EM, adapter
  end

  def test_get
    body = {"message" => "got it"}
    raw_body = JSON.dump(body)
    headers = {"Content-Type" => "application/json"}
    stub_request(:get, "http://example.com/?some=thing").
      with(:headers => {"Content-Type" => "application/json"}).
      to_return(:status => 200, :body => raw_body, :headers => headers)

    url = "http://example.com"
    params = {"some" => "thing"}

    EM.run_block do
      adapter = Octolytics::Adapters::EM.new
      adapter.get(url, params, headers).callback { |response|
        assert_equal body, response.data
      }.errback { |message|
        flunk "Should not get here"
      }
    end
  end

  def test_get_server_error
    url = "http://example.com"
    stub_request(:get, url).to_return(:status => 500)

    EM.run_block do
      adapter = Octolytics::Adapters::EM.new
      adapter.get(url).callback { |response|
        flunk "Should not get here"
      }.errback { |error|
        assert_instance_of Octolytics::HttpServerError, error
      }
    end
  end

  def test_get_client_error
    url = "http://example.com"
    stub_request(:get, url).to_return(:status => 404)

    EM.run_block do
      adapter = Octolytics::Adapters::EM.new
      adapter.get(url).callback { |response|
        flunk "Should not get here"
      }.errback { |error|
        assert_instance_of Octolytics::NotFoundError, error
      }
    end
  end

  def test_post_with_hash_for_body
    response_body = {"message" => "got it"}
    raw_response_body = JSON.dump(response_body)

    stub_request(:post, "http://example.com/").
      with(:body => "{\"some\":\"thing\"}", :headers => {"Content-Type" => "application/json"}).
      to_return(:status => 200, :body => raw_response_body, :headers => {"Content-Type" => "application/json"})

    url = "http://example.com"
    body = {"some" => "thing"}
    headers = {"Content-Type" => "application/json"}

    EM.run_block do
      adapter = Octolytics::Adapters::EM.new
      adapter.post(url, body, headers).callback { |response|
        assert_equal response_body, response.data
      }.errback { |message|
        flunk "Should not get here"
      }
    end
  end

  def test_put_with_hash_for_body
    response_body = {"message" => "got it"}
    raw_response_body = JSON.dump(response_body)

    stub_request(:put, "http://example.com/").
      with(:body => "{\"some\":\"thing\"}", :headers => {"Content-Type" => "application/json"}).
      to_return(:status => 200, :body => raw_response_body, :headers => {"Content-Type" => "application/json"})

    url = "http://example.com"
    body = {"some" => "thing"}
    headers = {"Content-Type" => "application/json"}

    EM.run_block do
      adapter = Octolytics::Adapters::EM.new
      adapter.put(url, body, headers).callback { |response|
        assert_equal response_body, response.data
      }.errback { |message|
        flunk "Should not get here"
      }
    end
  end
end
