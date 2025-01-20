# frozen_string_literal: true
require "test_helper"

class GraphQLProOperationStoreEndpointTest < Minitest::Test
  include Rack::Test::Methods
  using GraphQL::Pro::Routes

  class ExampleSchema < GraphQL::Schema
    REDIS = Redis.new(db: REDIS_NUMBERS[:operation_store])
    use GraphQL::Pro::OperationStore, redis: REDIS

    class Query < GraphQL::Schema::Object
      field :a, Int

      def self.visible?(ctx)
        {}.fetch(:not_there)
      end
    end

    query(Query)
  end

  def setup
    @schema = ExampleSchema
    ExampleSchema::REDIS.flushdb
    ExampleSchema.operation_store.upsert_client("endpoint-test", "endpoint-test-secret")
    super
  end

  def test_it_lazy_loads_schema_from_schema_name
    lazy_endpoint = GraphQL::Pro::OperationStore::Endpoint.new(schema_class_name: "GraphQLProOperationStoreEndpointTest::ExampleSchema")
    assert_nil lazy_endpoint.instance_variable_get(:@schema)
    lazy_endpoint.call({})
    assert_equal ExampleSchema, lazy_endpoint.instance_variable_get(:@schema)
  end

  def app
    builder = Rack::Builder.new
    builder.run @schema.operation_store_sync
  end

  def post_operations(client, operations)
    payload_json = JSON.dump({ "operations" => operations })
    hmac = OpenSSL::HMAC.hexdigest("SHA256", client + "-secret", payload_json)
    header "Authorization", "GraphQL::Pro #{client} #{hmac}"
    post "/", payload_json
  end

  def test_it_doesnt_rescue_application_key_errors
    err = assert_raises KeyError do
      post_operations("endpoint-test", [{ alias: "abcd", body: "{ a }" }])
    end
    assert_equal :not_there, err.key
  end
end
