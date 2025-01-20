# frozen_string_literal: true
require "test_helper"
require_relative "validate_assertions"

class GraphQLProOperationStoreRedisBackendTest < Minitest::Test
  include OperationStoreAssertions
  include OperationStoreHelpers
  include OperationStoreIndexAssertions
  include OperationStoreEndpointAssertions
  include OperationStoreAddOperationBatchAssertions
  include GraphQLProOperationStoreValidateAssertions

  REDIS = Redis.new(db: REDIS_NUMBERS[:operation_store])
  REDIS.flushdb
  class RedisBackendSchema < ConnectionHelpers::Schema
    trace_with(OperationStoreHelpers::BeforeQueryDocumentUser)
    use GraphQL::Pro::OperationStore, redis: REDIS
  end

  def setup
    @redis_backend = true
    @validate_test_schema = Class.new(ValidateTestSchema) do
      use GraphQL::Pro::OperationStore, redis: REDIS
    end
    REDIS.flushdb
    OperationStoreHelpers.add_fixtures(RedisBackendSchema.operation_store)
    @schema = RedisBackendSchema
    @store = @schema.operation_store
    @supports_last_used_at = true
  end

  # Convert to UTC seconds, which is what Redis stores.
  def prepare_last_used_at(t)
    Time.at(t.to_i).utc
  end

  def test_it_logs_stuff
    skip "Not implemented in redis backend yet"
  end

  def test_it_rejects_invalid_graphql
    ops = get_ops_1 + get_ops_2
    ops[3][:body] = "query Bogus { x }"
    init_clients("auth-3") do
      assert_adds_operations(2) do
        post_operations("auth-3", ops)
        assert_equal 200, last_response.status
        result = JSON.parse(last_response.body)
        assert_equal ["op-4"], result.fetch("failed")
        assert_equal({"op-4"=>["Field 'x' doesn't exist on type 'Query' (1:15)"]}, result.fetch("errors"))
        assert_equal [], result.fetch("not_modified")
        assert_equal ["op-1", "op-2", "op-3"], result.fetch("added")
        assert_equal "partial", result.fetch("committed")
      end
    end
  end

  def test_it_fails_everything_in_case_of_a_conflict
    skip "It doesn't fail everything"
  end

  def test_it_makes_a_partial_save_in_case_of_a_conflict
    ops = get_ops_1 + get_ops_2
    init_clients("auth-4") do
      # Add a conflicting operation
      @store.add(
        client_name: "auth-4",
        body: "query NonSense { __typename }",
        operation_alias: "op-3"
      )
      assert_adds_operations(2) do
        post_operations("auth-4", ops)
        assert_equal 200, last_response.status
        result = JSON.parse(last_response.body)
        assert_equal ["op-3"], result.fetch("failed")
        err_message =  "Uniqueness validation failed: make sure operation aliases are unique for 'auth-4'"
        assert_equal({"op-3"=>[err_message]}, result.fetch("errors"))
        assert_equal [], result.fetch("not_modified")
        assert_equal ["op-1", "op-2"], result.fetch("added")
        assert_equal "partial", result.fetch("committed")
      end
    end
  end

  def test_it_works_with_static_auth
    skip "No fixtures for Redis backend yet"
  end
end

class GraphQLProOperationStoreRedisClientBackendTest < Minitest::Test
  include OperationStoreAssertions
  include OperationStoreHelpers
  include OperationStoreIndexAssertions
  include OperationStoreEndpointAssertions
  include OperationStoreAddOperationBatchAssertions

  REDIS = Redis.new(db: REDIS_NUMBERS[:operation_store])
  REDIS.flushdb
  class RedisBackendSchema < ConnectionHelpers::Schema
    trace_with(OperationStoreHelpers::BeforeQueryDocumentUser)
    use GraphQL::Pro::OperationStore, redis: REDIS
  end

  def setup
    @redis_backend = true
    REDIS.flushdb
    OperationStoreHelpers.add_fixtures(RedisBackendSchema.operation_store)
    @schema = RedisBackendSchema
    @store = @schema.operation_store
    @supports_last_used_at = true
  end

  # Convert to UTC seconds, which is what Redis stores.
  def prepare_last_used_at(t)
    Time.at(t.to_i).utc
  end

  def test_it_logs_stuff
    skip "Not implemented in redis backend yet"
  end

  def test_it_rejects_invalid_graphql
    ops = get_ops_1 + get_ops_2
    ops[3][:body] = "query Bogus { x }"
    init_clients("auth-3") do
      assert_adds_operations(2) do
        post_operations("auth-3", ops)
        assert_equal 200, last_response.status
        result = JSON.parse(last_response.body)
        assert_equal ["op-4"], result.fetch("failed")
        assert_equal({"op-4"=>["Field 'x' doesn't exist on type 'Query' (1:15)"]}, result.fetch("errors"))
        assert_equal [], result.fetch("not_modified")
        assert_equal ["op-1", "op-2", "op-3"], result.fetch("added")
        assert_equal "partial", result.fetch("committed")
      end
    end
  end

  def test_it_fails_everything_in_case_of_a_conflict
    skip "It doesn't fail everything"
  end

  def test_it_makes_a_partial_save_in_case_of_a_conflict
    ops = get_ops_1 + get_ops_2
    init_clients("auth-4") do
      # Add a conflicting operation
      @store.add(
        client_name: "auth-4",
        body: "query NonSense { __typename }",
        operation_alias: "op-3"
      )
      assert_adds_operations(2) do
        post_operations("auth-4", ops)
        assert_equal 200, last_response.status
        result = JSON.parse(last_response.body)
        assert_equal ["op-3"], result.fetch("failed")
        err_message =  "Uniqueness validation failed: make sure operation aliases are unique for 'auth-4'"
        assert_equal({"op-3"=>[err_message]}, result.fetch("errors"))
        assert_equal [], result.fetch("not_modified")
        assert_equal ["op-1", "op-2"], result.fetch("added")
        assert_equal "partial", result.fetch("committed")
      end
    end
  end

  def test_it_works_with_static_auth
    skip "No fixtures for Redis backend yet"
  end
end
