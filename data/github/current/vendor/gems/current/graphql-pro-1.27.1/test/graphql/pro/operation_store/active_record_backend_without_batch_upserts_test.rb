# frozen_string_literal: true
require "test_helper"

class GraphQLProOperationStoreActiveRecordBackendWithoutBatchUpsertsTest < Minitest::Test
  include OperationStoreAssertions
  include OperationStoreHelpers
  include OperationStoreIndexAssertions
  include OperationStoreEndpointAssertions
  include OperationStoreAddOperationBatchAssertions

  class ActiveRecordBackendWithoutBatchUpsert < GraphQL::Pro::OperationStore::ActiveRecordBackend
    def supports_batch_upsert?
      false
    end
  end

  def setup
    SqliteHelpers.setup_database_once
    @schema = Class.new(OperationStoreHelpers::ActiveRecordBackendSchema) do
      use GraphQL::Pro::OperationStore, backend_class: ActiveRecordBackendWithoutBatchUpsert
    end
    @store = @schema.operation_store
    @supports_last_used_at = true
  end

  def test_it_adds_an_accessor_to_schemas
    assert_instance_of ActiveRecordBackendWithoutBatchUpsert, @schema.operation_store.instance_variable_get(:@backend)
    refute @schema.operation_store.supports_batch_upsert?
  end

  def test_it_upserts_operations_without_batches
    @store.upsert_client("batch-client", "12345")
    assert_equal 0, @store.get_client_operations_by_client("batch-client", page: 1, per_page: 100).total_count
    operations = [
      { "alias" => "abcd", "body" => "query B1 { batched1: __typename __schema { __typename } }" },
      { "alias" => "efgh", "body" => "query B2 { batched2: __typename }" },
    ]
    io = StringIO.new
    with_sql_log(io: io) do
      batch_add("batch-client", operations)
    end
    assert_equal 2, @store.get_client_operations_by_client("batch-client", page: 1, per_page: 100).total_count

    log = io.string
    # - find client
    # - 2 fetch existing operation
    # - 2 fetch existing client operation
    # - 1 get existing index entries
    # - 9 index reference exists? checks
    assert_equal 15, log.scan("SELECT").count
    # - 2 add new operation
    # - 2 add new client operation
    # - 3 add new index entry
    # - 9 add new index reference
    assert_equal 16, log.scan("INSERT").count

    io = StringIO.new
    with_sql_log(io: io) do
      batch_add("batch-client", operations)
    end
    assert_equal 2, @store.get_client_operations_by_client("batch-client", page: 1, per_page: 100).total_count
    log = io.string
    # No Changes:
    # - find client
    # - 2 find existing operations
    # - 2 find existing client operations
    assert_equal 5, log.scan("SELECT").count
    assert_equal 0, log.scan("INSERT").count

    operations = [
      { "alias" => "abcd", "body" => "query B1 { batched1: __typename __schema { __typename } }" },
      { "alias" => "ijkl", "body" => "query B3 { batched2: __typename }" },
    ]
    io = StringIO.new
    with_sql_log(io: io) do
      batch_add("batch-client", operations)
    end
    log = io.string
    # Partial update
    # - find client
    # - 2 find existing operations
    # - 2 find existing client operations
    # - find existing index entries
    # - 3 index reference checks
    assert_equal 9, log.scan("SELECT").count
    # - add new operation
    # - add new client operation
    # - 3 add new index references
    assert_equal 5, log.scan("INSERT").count
  ensure
    @store.delete_client("batch-client")
  end
end
