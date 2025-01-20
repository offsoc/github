# frozen_string_literal: true

require File.expand_path("../test_helper", __FILE__)
require File.expand_path("../mock_response", __FILE__)
require "elastomer_client/notifications"

describe ElastomerClient::Client do

  it "uses the adapter specified at creation" do
    c = ElastomerClient::Client.new(adapter: :test)

    assert_equal c.connection.builder.adapter, Faraday::Adapter::Test
  end

  it "allows configuring the Faraday when a block is given" do
    assert ElastomerClient::Client.new.connection.builder.handlers.none? { |handler| handler.klass == FaradayMiddleware::Instrumentation }

    c = ElastomerClient::Client.new do |connection|
      assert_kind_of(Faraday::Connection, connection)

      connection.use :instrumentation
    end

    assert c.connection.builder.handlers.any? { |handler| handler.klass == FaradayMiddleware::Instrumentation }
  end

  it "use Faraday's default adapter if none is specified" do
    c = ElastomerClient::Client.new
    adapter = Faraday::Adapter.lookup_middleware(Faraday.default_adapter)

    assert_equal c.connection.builder.adapter, adapter
  end

  it "uses the same connection for all requests" do
    c = $client.connection

    assert_same c, $client.connection
  end

  it "raises an error for unknown HTTP request methods" do
    assert_raises(ArgumentError) { $client.request :foo, "/", {} }
  end

  it "raises an error on 4XX responses with an `error` field" do
    begin
      $client.get "/non-existent-index/_search?q=*:*"

      assert false, "exception was not raised when it should have been"
    rescue ElastomerClient::Client::Error => err
      assert_equal 404, err.status
      assert_match %r/index_not_found_exception/, err.message
    end
  end

  it "raises an error on rejected execution exceptions" do
    rejected_execution_response = {
      error: {
        root_cause: [{
          type: "es_rejected_execution_exception",
          reason: "rejected execution of org.elasticsearch.transport.TransportService$7@5a787cd5 on EsThreadPoolExecutor[bulk, queue capacity = 200, org.elasticsearch.common.util.concurrent.EsThreadPoolExecutor@1338862c[Running, pool size = 32, active threads = 32, queued tasks = 213, completed tasks = 193082975]]"
        }],
        type: "es_rejected_execution_exception",
        reason: "rejected execution of org.elasticsearch.transport.TransportService$7@5a787cd5 on EsThreadPoolExecutor[bulk, queue capacity = 200, org.elasticsearch.common.util.concurrent.EsThreadPoolExecutor@1338862c[Running, pool size = 32, active threads = 32, queued tasks = 213, completed tasks = 193082975]]"
      }
    }.to_json

    stub_request(:post, $client.url+"/_bulk").to_return({
      body: rejected_execution_response
    })

    begin
      $client.post "/_bulk"

      assert false, "exception was not raised when it should have been"
    rescue ElastomerClient::Client::RejectedExecutionError => err
      assert_match %r/es_rejected_execution_exception/, err.message
    end
  end

  it "wraps Faraday errors with our own exceptions" do
    error = Faraday::TimeoutError.new("it took too long")
    wrapped = $client.wrap_faraday_error(error, :get, "/_cat/indices")

    assert_instance_of ElastomerClient::Client::TimeoutError, wrapped
    assert_equal "it took too long :: GET /_cat/indices", wrapped.message
  end

  it "handles path expansions" do
    uri = $client.expand_path "/{foo}/{bar}", foo: "_cluster", bar: "health"

    assert_equal "/_cluster/health", uri

    uri = $client.expand_path "{/foo}{/baz}{/bar}", foo: "_cluster", bar: "state"

    assert_equal "/_cluster/state", uri
  end

  it "handles query parameters" do
    uri = $client.expand_path "/_cluster/health", level: "shards"

    assert_equal "/_cluster/health?level=shards", uri
  end

  it "handles query parameters in path and arguments" do
    uri = $client.expand_path "/index/_update_by_query?conflicts=proceed", routing: "1"

    assert_equal "/index/_update_by_query?conflicts=proceed&routing=1", uri
  end

  it "overrides query parameters in path and with arguments" do
    uri = $client.expand_path "/index/_update_by_query?conflicts=proceed&routing=2", routing: "1"

    assert_equal "/index/_update_by_query?conflicts=proceed&routing=1", uri
  end

  it "validates path expansions" do
    assert_raises(ArgumentError) {
      $client.expand_path "/{foo}/{bar}", foo: "_cluster", bar: nil
    }

    assert_raises(ArgumentError) {
      $client.expand_path "/{foo}/{bar}", foo: "_cluster", bar: ""
    }
  end

  it "hides basic_auth and token_auth params from inspection" do
    client_params = $client_params.merge(basic_auth: {
      username: "my_user",
      password: "my_secret_password"
    }, token_auth: "my_secret_token")
    client = ElastomerClient::Client.new(**client_params)

    refute_match(/my_user/, client.inspect)
    refute_match(/my_secret_password/, client.inspect)
    refute_match(/my_secret_token/, client.inspect)
    assert_match(/@basic_auth=\[FILTERED\]/, client.inspect)
    assert_match(/@token_auth=\[FILTERED\]/, client.inspect)
  end

  describe "authorization" do
    it "can use basic authentication" do
      client_params = $client_params.merge(basic_auth: {
        username: "my_user",
        password: "my_secret_password"
      })
      client = ElastomerClient::Client.new(**client_params)

      connection = Faraday::Connection.new
      basic_auth_spy = Spy.on(connection, :basic_auth).and_return(nil)

      Faraday.stub(:new, $client_params[:url], connection) do
        client.ping
      end

      assert basic_auth_spy.has_been_called_with?("my_user", "my_secret_password")
    end

    it "ignores basic authentication if password is missing" do
      client_params = $client_params.merge(basic_auth: {
        username: "my_user"
      })
      client = ElastomerClient::Client.new(**client_params)

      connection = Faraday::Connection.new
      basic_auth_spy = Spy.on(connection, :basic_auth).and_return(nil)

      Faraday.stub(:new, $client_params[:url], connection) do
        client.ping
      end

      refute_predicate basic_auth_spy, :has_been_called?
    end

    it "ignores basic authentication if username is missing" do
      client_params = $client_params.merge(basic_auth: {
        password: "my_secret_password"
      })
      client = ElastomerClient::Client.new(**client_params)

      connection = Faraday::Connection.new
      basic_auth_spy = Spy.on(connection, :basic_auth).and_return(nil)

      Faraday.stub(:new, $client_params[:url], connection) do
        client.ping
      end

      refute_predicate basic_auth_spy, :has_been_called?
    end

    it "can use token authentication" do
      client_params = $client_params.merge(token_auth: "my_secret_token")
      client = ElastomerClient::Client.new(**client_params)

      connection = Faraday::Connection.new
      token_auth_spy = Spy.on(connection, :token_auth).and_return(nil)

      Faraday.stub(:new, $client_params[:url], connection) do
        client.ping
      end

      assert token_auth_spy.has_been_called_with?("my_secret_token")
    end

    it "prefers token authentication over basic" do
      client_params = $client_params.merge(basic_auth: {
        username: "my_user",
        password: "my_secret_password"
      }, token_auth: "my_secret_token")
      client = ElastomerClient::Client.new(**client_params)

      connection = Faraday::Connection.new
      basic_auth_spy = Spy.on(connection, :basic_auth).and_return(nil)
      token_auth_spy = Spy.on(connection, :token_auth).and_return(nil)

      Faraday.stub(:new, $client_params[:url], connection) do
        client.ping
      end

      refute_predicate basic_auth_spy, :has_been_called?
      assert token_auth_spy.has_been_called_with?("my_secret_token")
    end
  end

  describe "when extracting and converting :body params" do
    it "deletes the :body from the params (or it gets the hose)" do
      params = { body: nil, q: "what what?" }
      body = $client.extract_body params

      assert_nil body
      assert_equal({q: "what what?"}, params)
    end

    it "leaves String values unchanged" do
      body = $client.extract_body body: '{"query":{"match_all":{}}}'

      assert_equal '{"query":{"match_all":{}}}', body

      body = $client.extract_body body: "not a JSON string, but who cares!"

      assert_equal "not a JSON string, but who cares!", body
    end

    it "joins Array values" do
      body = $client.extract_body body: %w[foo bar baz]

      assert_equal "foo\nbar\nbaz\n", body

      body = $client.extract_body body: [
        "the first entry",
        "the second entry",
        nil
      ]

      assert_equal "the first entry\nthe second entry\n", body
    end

    it "converts values to JSON" do
      body = $client.extract_body body: true

      assert_equal "true", body

      body = $client.extract_body body: {query: {match_all: {}}}

      assert_equal '{"query":{"match_all":{}}}', body
    end

    it "returns frozen strings" do
      body = $client.extract_body body: '{"query":{"match_all":{}}}'

      assert_equal '{"query":{"match_all":{}}}', body
      assert_predicate body, :frozen?, "the body string should be frozen"

      body = $client.extract_body body: %w[foo bar baz]

      assert_equal "foo\nbar\nbaz\n", body
      assert_predicate body, :frozen?, "Array body strings should be frozen"

      body = $client.extract_body body: {query: {match_all: {}}}

      assert_equal '{"query":{"match_all":{}}}', body
      assert_predicate body, :frozen?, "JSON encoded body strings should be frozen"
    end
  end

  describe "when validating parameters" do
    it "rejects nil values" do
      assert_raises(ArgumentError) { $client.assert_param_presence nil }
    end

    it "rejects empty strings" do
      assert_raises(ArgumentError) { $client.assert_param_presence "" }
      assert_raises(ArgumentError) { $client.assert_param_presence " " }
      assert_raises(ArgumentError) { $client.assert_param_presence " \t \r \n " }
    end

    it "rejects empty strings and nil values found in arrays" do
      assert_raises(ArgumentError) { $client.assert_param_presence ["foo", nil, "bar"] }
      assert_raises(ArgumentError) { $client.assert_param_presence ["baz", " \t \r \n "] }
    end

    it "strips whitespace from strings" do
      assert_equal "foo", $client.assert_param_presence("  foo  \t")
    end

    it "joins array values into a string" do
      assert_equal "foo,bar", $client.assert_param_presence(%w[foo bar])
    end

    it "flattens arrays" do
      assert_equal "foo,bar,baz,buz", $client.assert_param_presence(["  foo  \t", %w[bar baz buz]])
    end

    it "allows strings" do
      assert_equal "foo", $client.assert_param_presence("foo")
    end

    it "converts numbers and symbols to strings" do
      assert_equal "foo", $client.assert_param_presence(:foo)
      assert_equal "9", $client.assert_param_presence(9)
    end
  end

  describe "top level actions" do
    it "pings the cluster" do
      assert $client.ping
      assert_predicate $client, :available?
    end

    it "gets cluster info" do
      h = $client.info

      assert h.key?("name"), "expected cluster name to be returned"
      assert h.key?("version"), "expected cluster version information to be returned"
      assert h["version"].key?("number"), "expected cluster version number to be returned"
    end

    it "gets cluster version" do
      assert_match(/[\d\.]+/, $client.version)
    end

    it "does not make an HTTP request for version if it is provided at create time" do
      request = stub_request(:get, "#{$client.url}/")

      client = ElastomerClient::Client.new(**$client_params.merge(es_version: "5.6.6"))

      assert_equal "5.6.6", client.version

      assert_not_requested request
    end

    it "gets semantic version" do
      version_string = $client.version

      assert_equal Semantic::Version.new(version_string), $client.semantic_version
    end
  end

  describe "retry logic" do
    it "defaults to no retries" do
      stub_request(:get, $client.url+"/_cat/indices").
        to_timeout.then.
        to_return({
          headers: {"Content-Type" => "text/plain; charset=UTF-8"},
          body: "green open test-index 1 0 0 0 159b 159b"
        })

      assert_raises(ElastomerClient::Client::ConnectionFailed) {
        $client.get("/_cat/indices")
      }
    end

    it "adding retry logic retries up to 2 times" do
      retry_count = 0

      retry_options = {
        max: 2,
        interval: 0.05,
        methods: [:get],
        exceptions: Faraday::Request::Retry::DEFAULT_EXCEPTIONS + [Faraday::ConnectionFailed],
        retry_block: proc { |env, options, retries, exc| retry_count += 1 }
      }
      retry_client = ElastomerClient::Client.new(port: 9205) do |connection|
        connection.request :retry, retry_options
      end

      stub_request(:get, retry_client.url + "/").
        to_timeout.then.
        to_timeout.then.
        to_return({body: %q/{"acknowledged": true}/})

      response = retry_client.get("/")

      assert_equal 2, retry_count
      assert_equal({"acknowledged" => true}, response.body)
    end
  end

  describe "duplicating a client connection" do
    it "is configured the same" do
      client = $client.dup

      refute_same $client, client

      assert_equal $client.host, client.host
      assert_equal $client.port, client.port
      assert_equal $client.url, client.url
      assert_equal $client.read_timeout, client.read_timeout
      assert_equal $client.open_timeout, client.open_timeout
      assert_equal $client.max_request_size, client.max_request_size
    end

    it "has a unique connection" do
      client = $client.dup

      refute_same $client.connection, client.connection
    end
  end

  describe "OpaqueIDError conditionals" do
    it "does not throw OpaqueIdError for mocked response with empty opaque id" do
      opts = $client_params.merge \
        opaque_id: true
      client = ElastomerClient::Client.new(**opts) do |connection|
        connection.request(:mock_response) { |env| env.body = "{}" }
      end

      response = client.get("/")

      assert_equal "yes", response.headers["Fake"]
    end

    it "throws OpaqueIdError on mismatched ID" do
      client_params = $client_params.merge \
        opaque_id: true
      client = ElastomerClient::Client.new(**client_params)

      test_url = "#{client.url}/"
      stub_request(:get, test_url).and_return(status: 200, headers: { "Content-Type" => "application/json", "X-Opaque-Id" => "foo" })

      assert_raises(ElastomerClient::Client::OpaqueIdError) { client.request :get, test_url, {} }
    end

    it "throws OpaqueIdError on empty string ID" do
      client_params = $client_params.merge \
        opaque_id: true
      client = ElastomerClient::Client.new(**client_params)

      test_url = "#{client.url}/"
      stub_request(:get, test_url).and_return(status: 200, headers: { "Content-Type" => "application/json", "X-Opaque-Id" => "" })

      assert_raises(ElastomerClient::Client::OpaqueIdError) { client.request :get, test_url, {} }
    end

    it "throws ServerError and not OpaqueIdError on 5xx response and nil ID" do
      client_params = $client_params.merge \
        opaque_id: true
      client = ElastomerClient::Client.new(**client_params)

      test_url = "#{client.url}/"
      stub_request(:get, test_url).and_return(status: 503, headers: { "Content-Type" => "application/json" })

      assert_raises(ElastomerClient::Client::ServerError) { client.request :get, test_url, {} }
    end
  end
end
