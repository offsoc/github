# frozen_string_literal: true
require "test_helper"
class GraphQLProOperationStoreMigrationTest < Minitest::Test
  include OperationStoreHelpers

  def setup
    @schema = ActiveRecordBackendSchema
    @schema.operation_store.all_clients(page: 1, per_page: 50).items.each do |client_record|
      @schema.operation_store.delete_client(client_record.name)
    end
    OperationStoreHelpers.add_fixtures(@schema.operation_store)
    @redis = Redis.new(db: REDIS_NUMBERS[:migration])
    @redis.flushdb
  end

  def test_it_migrates_from_ar_to_redis
    redis_backend = GraphQL::Pro::OperationStore::RedisBackend.new(
      operation_store: @schema.operation_store,
      redis: @redis,
    )
    ar_backend = GraphQL::Pro::OperationStore::ActiveRecordBackend.new(
      operation_store: @schema.operation_store,
    )
    assert_equal [], @redis.keys("*")

    GraphQL::Pro::OperationStore::Migration.call(
      schema: @schema,
      old_backend: ar_backend,
      new_backend: redis_backend,
      page_size: 1,
    )

    expected_client_names = [
      "client-1",
      "client-2",
      "client-3",
      "x-client-1",
      "x-client-2"
    ]
    expected_client_secrets = expected_client_names.map { |n| n + "-secret" }
    new_clients = redis_backend.all_clients(page: 1, per_page: 10).items
    assert_equal expected_client_names, new_clients.map(&:name).sort
    assert_equal expected_client_secrets, new_clients.map(&:secret).sort

    new_operations = redis_backend.all_operations(page: 1, per_page: 100).items
    expected_operation_names = [
      "GetCard",
      "GetExpansion1",
      "GetExpansion2",
      "GetExpansionReleaseDate",
      "GetTypename",
      "GetTypename2"
    ]

    assert_equal expected_operation_names, new_operations.map(&:name).sort

    expected_client_op_counts = {
      "client-1" => 2,
      "client-2" => 3,
      "x-client-1" => 2,
      "x-client-2" => 1,
    }

    total_expected_count = 8
    total_count = 0
    expected_client_op_counts.each do |client_name, expected_client_op_count|
      client_op_count = redis_backend.get_client_operations_by_client(client_name, per_page: 1, page: 1).total_count
      total_count += client_op_count
      assert_equal expected_client_op_count, client_op_count, "#{client_name}'s operations are registered"
    end
    assert_equal total_expected_count, total_count

    # The index is also populated
    assert_equal 1, redis_backend.all_index_entries(search_term: "Card.name", page: 1, per_page: 100).items.first.references_count
    assert_equal 3, redis_backend.all_index_entries(search_term: "Query.expansion.sym", page: 1, per_page: 100).items.first.references_count
    all_expansion_entries = redis_backend.all_index_entries(search_term: "Expansion", page: 1, per_page: 100).items
    all_expansion_refs = all_expansion_entries.map(&:references_count).sum
    assert_equal 8, all_expansion_refs
    assert_equal ["Expansion", "Expansion.name", "Expansion.release_date", "Expansion.sym"], all_expansion_entries.map(&:name)
  end
end
