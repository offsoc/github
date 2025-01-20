# frozen_string_literal: true
require "test_helper"

module OperationStoreEndpointAssertions
  include Rack::Test::Methods
  include OperationStoreHelpers::Assertions
  include OperationStoreHelpers
  using GraphQL::Pro::Routes

  # Fixture data; return fresh objects
  # each time so that tests can modify them
  def get_ops_1
    [
      {
        alias: "op-1",
        body: 'query GetExpansion1 {
            expansion(sym: "SHM") {
              name
            }
          }',
      },
      {
        alias: "op-2",
        body: 'query GetExpansion1 {
            expansion(sym: "EVE") {
              name
            }
          }',
      },
    ]
  end

  def get_ops_2
    [
      {
        alias: "op-3",
        body: 'query GetCard($id: ID!) { card(id: $id) { name } }',
      },
      {
        alias: "op-4",
        body: 'query GetCardDetails($id: ID!) { card(id: $id) { name printings { artist { name } } } }',
      },
    ]
  end

  class ReadBody
    def initialize(app)
      @app = app
    end

    def call(env)
      if env["HTTP_READ_BODY"]
        env["rack.input"].read
      end
      @app.call(env)
    end
  end

  def app
    builder = Rack::Builder.new
    builder.use ReadBody
    builder.run @schema.operation_store_sync
    builder.to_app
  end

  def post_operations(client, operations, read_body: false)
    payload_json = JSON.dump({ "operations" => operations })
    hmac = OpenSSL::HMAC.hexdigest("SHA256", client + "-secret", payload_json)
    header "Authorization", "GraphQL::Pro #{client} #{hmac}"
    if read_body
      header "READ_BODY", "1"
    end
    post "/", payload_json
  end

  def test_it_inspects_nicely
    assert_equal "#<GraphQL::Pro::OperationStore::Endpoint[#{@schema.inspect}]>", @schema.operation_store_sync.inspect
  end

  def test_it_accepts_authenticated_input
    init_clients("auth-1") do
      operations = [
        {
          alias: "abcd",
          body: "query Stuff { __typename }"
        }
      ]
      assert_adds_operations(1) do
        post_operations("auth-1", operations, read_body: true)
        assert_equal 200, last_response.status
        assert_equal "application/json", last_response.headers["Content-Type"]
        assert_equal last_response.body.bytesize, last_response.headers["Content-Length"].to_i
        result = JSON.parse(last_response.body)
        assert_equal [], result.fetch("failed")
        assert_equal({}, result.fetch("errors"))
        assert_equal [], result.fetch("not_modified")
        assert_equal ["abcd"], result.fetch("added")
      end
    end
  end

  def test_it_reports_additions_and_duplicates
    ops_1 = get_ops_1
    ops_2 = get_ops_2
    init_clients("auth-2") do
      # Add some ops ahead of time
      ops_1.each do |op|
        @store.add(client_name: "auth-2", body: op[:body], operation_alias: op[:alias])
      end

      operations = ops_1 + ops_2

      # One operation was already preset (`GetCard`/op-3)
      assert_adds_operations(1) do
        post_operations("auth-2", operations)
        assert_equal 200, last_response.status
        result = JSON.parse(last_response.body)
        assert_equal [], result.fetch("failed")
        assert_equal({}, result.fetch("errors"))
        assert_equal ["op-1", "op-2"], result.fetch("not_modified")
        assert_equal ["op-3", "op-4"], result.fetch("added")
        assert_equal true, result.fetch("committed")
      end
    end
  end

  def test_it_fails_everything_in_case_of_a_conflict
    ops = get_ops_1 + get_ops_2
    init_clients("auth-4") do
      # Add a conflicting operation
      @store.add(
        client_name: "auth-4",
        body: "query NonSense { __typename }",
        operation_alias: "op-3"
      )
      operation_key = @store.supports_batch_upsert? ? nil : "op-3"

      assert_adds_operations(0) do
        post_operations("auth-4", ops)
        assert_equal 422, last_response.status
        result = JSON.parse(last_response.body)
        assert_equal [operation_key], result.fetch("failed")
        err_message = if MODERN_RAILS
          "Uniqueness validation failed: make sure operation aliases are unique for 'auth-4'"
        else
          "An internal error occurred"
        end
        assert_equal({"#{operation_key}"=>[err_message]}, result.fetch("errors"))
        assert_equal [], result.fetch("not_modified")
        assert_equal [], result.fetch("added")
        assert_equal false, result.fetch("committed")
      end
    end
  end

  def test_it_passes_changeset_version_thru
    init_clients("auth-1") do
      operations = [
        {
          alias: "abcd",
          body: "query Stuff { __typename }"
        }
      ]
      assert_adds_operations(1) do
        header "Changeset-Version", "2023-01-01"
        post_operations("auth-1", operations)
        result = JSON.parse(last_response.body)
        assert_equal "2023-01-01", result["changeset_version"]
      end
    end
  end

  def test_it_returns_404_or_422_for_nonsense
    get "/"
    assert_equal 404, last_response.status

    post "/something"
    assert_equal 404, last_response.status
  end

  def test_it_returns_401_for_no_auth
    post "/"
    assert_equal 401, last_response.status
  end

  def test_it_returns_401_for_failed_auth
    header "Authorization", "GraphQL::Pro client-1 abcd"
    post "/"
    assert_equal 401, last_response.status
  end

  def test_it_returns_401_for_typo_name
    init_clients("typo-client-1") do
      operations = [
        {
          alias: "abcd",
          body: "query Stuff { __typename }"
        }
      ]
      payload_json = JSON.dump({ "operations" => operations })
      hmac = OpenSSL::HMAC.hexdigest("SHA256","typo-client-2-secret", payload_json)
      header "Authorization", "GraphQL::Pro typo-client-2 #{hmac}"
      post "/", payload_json
      assert_equal 401, last_response.status
    end
  end
end
