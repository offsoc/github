require "helper"
require "octolytics/adapters/net_http"

class NetHttpAdapterTest < Minitest::Test
  def test_initialize
    adapter = Octolytics::Adapters::NetHttp.new
    assert_instance_of Octolytics::Adapters::NetHttp, adapter
  end

  def test_initialize_with_options
    options = {timeout: 4}
    adapter = Octolytics::Adapters::NetHttp.new(options)
    assert_instance_of Octolytics::Adapters::NetHttp, adapter
    assert_equal 4, adapter.timeout
  end

  def test_get
    url = "http://example.com/"
    params = {foo: "bar"}
    headers = {"Accept" => "application/json"}

    stub_request(:get, "#{url}?foo=bar").
      with(:headers => headers).
      to_return(:status => 200, :body => "{\"foo\": \"bar\"}", :headers => {"Content-Type" => "application/json"})

    adapter = Octolytics::Adapters::NetHttp.new
    response = adapter.get(url, params, headers)

    assert_equal({"foo" => "bar"}, response.data)
    assert_equal({"content-type" => "application/json"}, response.headers)
  end

  def test_get_with_symbol_header_keys
    adapter = Octolytics::Adapters::NetHttp.new
    assert_raises ArgumentError do
      adapter.get("http://example.com/", {}, {accept: "application/json"})
    end
  end

  def test_get_with_auth
    url = "http://foo:bar@example.com/"
    params = {foo: "bar"}
    headers = {"Accept" => "application/json"}

    stub_request(:get, "#{url}?foo=bar").
      with(:headers => headers).
      to_return(:status => 200, :body => "{\"foo\": \"bar\"}", :headers => {"Content-Type" => "application/json"})

    adapter = Octolytics::Adapters::NetHttp.new
    response = adapter.get(url, params, headers)

    assert_equal({"foo" => "bar"}, response.data)
    assert_equal({"content-type" => "application/json"}, response.headers)
  end

  def test_get_timeout
    url = "http://www.example.com"
    stub_request(:get, url).to_timeout
    adapter = Octolytics::Adapters::NetHttp.new

    exception = assert_raises Octolytics::Timeout do
      adapter.get(url)
    end
    assert_kind_of Timeout::Error, exception.original_exception
  end

  def test_post
    url = "http://example.com/"
    body = "{\"foo\":\"bar\"}"
    headers = {"Accept" => "application/json", "Content-Type" => "application/json"}

    stub_request(:post, url).
      with(:body => body, :headers => headers).
      to_return(:status => 200, :body => "{\"baz\":\"wick\"}", :headers => {"Content-Type" => "application/json"})

    adapter = Octolytics::Adapters::NetHttp.new
    response = adapter.post(url, body, headers)

    assert_equal({"baz" => "wick"}, response.data)
    assert_equal({"content-type" => "application/json"}, response.headers)
  end

  def test_post_with_symbol_header_keys
    adapter = Octolytics::Adapters::NetHttp.new
    assert_raises ArgumentError do
      adapter.post("http://example.com/", "", {accept: "application/json"})
    end
  end

  def test_post_with_hash_for_body
    url = "http://example.com/"
    body = {"yes" => "sir"}
    headers = {}
    raw_body = JSON.dump(body)

    stub_request(:post, url).
      with(:body => raw_body).
      to_return(:status => 200, :body => "", :headers => {})

    adapter = Octolytics::Adapters::NetHttp.new
    response = adapter.post(url, body, headers)
    assert_equal(200, response.status)
  end

  def test_post_timeout
    url = "http://www.example.com"
    stub_request(:post, url).to_timeout
    adapter = Octolytics::Adapters::NetHttp.new

    exception = assert_raises Octolytics::Timeout do
      adapter.post(url)
    end
    assert_kind_of Timeout::Error, exception.original_exception
  end

  def test_put
    url = "http://example.com"
    body = "{\"foo\":\"bar\"}"
    headers = {"Accept" => "application/json", "Content-Type" => "application/json"}

    stub_request(:put, url).
      with(:body => body, :headers => headers).
      to_return(:status => 200, :body => "{\"baz\":\"wick\"}", :headers => {"Content-Type" => "application/json"})

    adapter = Octolytics::Adapters::NetHttp.new
    response = adapter.put(url, body, headers)

    assert_equal(200, response.status)
    assert_equal({"baz" => "wick"}, response.data)
    assert_equal({"content-type" => "application/json"}, response.headers)
  end

  def test_put_with_symbol_header_keys
    adapter = Octolytics::Adapters::NetHttp.new
    assert_raises ArgumentError do
      adapter.put("http://example.com/", "", {accept: "application/json"})
    end
  end

  def test_put_with_hash_for_body
    url = "http://example.com"
    body = {"yes" => "sir"}
    raw_body = JSON.dump(body)
    headers = {}

    stub_request(:put, url).
      with(:body => raw_body).
      to_return(:status => 200, :body => "", :headers => {})

    adapter = Octolytics::Adapters::NetHttp.new
    response = adapter.put(url, body, headers)
    assert_equal(200, response.status)
  end

  def test_put_timeout
    url = "http://www.example.com"
    stub_request(:put, url).to_timeout
    adapter = Octolytics::Adapters::NetHttp.new

    exception = assert_raises Octolytics::Timeout do
      adapter.put(url)
    end
    assert_kind_of Timeout::Error, exception.original_exception
  end
end
