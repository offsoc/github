# frozen_string_literal: true
require_relative "../dashboard_test"
require_relative "../operation_store/redis_backend_test"
require_relative "./operation_store_component_assertions"

class GraphQLProDashboardRedisOperationStoreComponentTest < GraphQLProDashboardTest
  include GraphQLProDashboardOperationStoreComponentAssertions

  def setup
    GraphQLProOperationStoreRedisBackendTest::REDIS.flushdb
    @schema = GraphQLProOperationStoreRedisBackendTest::RedisBackendSchema
    @store = @schema.operation_store
    @supports_last_used_at = true
    OperationStoreHelpers.add_fixtures(@store)
    prepare_last_used_at
    # Change this so we can test it later:
    GraphQLProOperationStoreRedisBackendTest::REDIS.hset(
      "gql:opstore:cl:client-1", "created_at", DateTime.parse("2011-01-01 01:00:00").to_time.to_i
    )
    GraphQLProOperationStoreRedisBackendTest::REDIS.hset(
      "gql:opstore:cl:client-1", "last_synced_at", DateTime.parse("2222-01-02 02:00:00").to_time.to_i
    )
  end
end

class GraphQLProDashboardRedisClientOperationStoreComponentTest < GraphQLProDashboardTest
  include GraphQLProDashboardOperationStoreComponentAssertions
  REDIS_CONFIG = RedisClient.config(db: REDIS_NUMBERS[:operation_store])
  REDIS_CLIENT = REDIS_CONFIG.new_pool(timeout: 0.5, size: 5)

  def setup
    REDIS_CLIENT.call("script", "flush")
    REDIS_CLIENT.call("flushdb")

    @schema = Class.new(GraphQLProOperationStoreRedisBackendTest::RedisBackendSchema) do
      use GraphQL::Pro::OperationStore, redis: REDIS_CLIENT
    end
    @store = @schema.operation_store
    @supports_last_used_at = true
    OperationStoreHelpers.add_fixtures(@store)
    prepare_last_used_at
    # Change this so we can test it later:
    GraphQLProOperationStoreRedisBackendTest::REDIS.hset(
      "gql:opstore:cl:client-1", "created_at", DateTime.parse("2011-01-01 01:00:00").to_time.to_i
    )
    GraphQLProOperationStoreRedisBackendTest::REDIS.hset(
      "gql:opstore:cl:client-1", "last_synced_at", DateTime.parse("2222-01-02 02:00:00").to_time.to_i
    )
  end
end
