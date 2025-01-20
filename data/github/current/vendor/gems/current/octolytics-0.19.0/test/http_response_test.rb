require "helper"
require "octolytics/http_response"

class HttpResponseTest < Minitest::Test
  def test_initialize
    status = 200
    headers = {}
    body = "something"
    response = Octolytics::HttpResponse.new(status, headers, body)

    assert_equal status, response.status
    assert_equal headers, response.headers
    assert_equal "something", response.body
  end

  def test_data_for_json
    data = {"message" => "Got it!"}
    status = 200
    headers = {"Content-Type" => "application/json"}
    body = JSON.dump(data)
    response = Octolytics::HttpResponse.new(status, headers, body)

    assert_equal data, response.data
  end

  # em-http-request returns underscored headers
  def test_data_for_underscored_headers
    data = {"message" => "Got it!"}
    status = 200
    headers = {"CONTENT_TYPE" => "application/json"}
    body = JSON.dump(data)
    response = Octolytics::HttpResponse.new(status, headers, body)

    assert_equal data, response.data
  end

  def test_data_for_lower_case_json_content_type
    data = {"message" => "Got it!"}
    status = 200
    headers = {"content-type" => "application/json"}
    body = JSON.dump(data)
    response = Octolytics::HttpResponse.new(status, headers, body)

    assert_equal data, response.data
  end

  def test_data_for_not_json
    status = 200
    headers = {"Content-Type" => "text/plain"}
    body = "something"
    response = Octolytics::HttpResponse.new(status, headers, body)

    assert_equal({}, response.data)
  end

  def test_data_for_no_content_type
    status = 200
    headers = {}
    body = "something"
    response = Octolytics::HttpResponse.new(status, headers, body)

    assert_equal({}, response.data)
  end

  def test_error
    assert_raises Octolytics::HttpClientError do
      response = Octolytics::HttpResponse.new(401, {}, "")
    end
  end
end
