# frozen_string_literal: true
require "test_helper"

module OperationStoreAddOperationBatchAssertions
  def batch_add(client_name, operations)
    GraphQL::Pro::OperationStore::AddOperationBatch.call(
      client_name: client_name,
      operations: operations,
      operation_store: @store,
    )
  end

  def test_it_requires_the_client_to_exist
    err = assert_raises do
      batch_add("bogus-client-name", [])
    end

    assert_equal "No GraphQL Operation Store client called \"bogus-client-name\"", err.message
  end

  def test_it_adds_operations_from_data
    @store.upsert_client("batch-client", "12345")
    assert_equal 0, @store.get_client_operations_by_client("batch-client", page: 1, per_page: 100).total_count
    operations = [
      { "alias" => "abcd", "body" => "query B1 { batched1: __typename }" },
      { "alias" => "efgh", "body" => "query B2 { batched2: __typename }" },
    ]
    result = batch_add("batch-client", operations)

    assert_equal ["abcd", "efgh"], result[:added]
    assert_equal [], result[:not_modified]
    assert_equal [], result[:failed]
    assert_equal({}, result[:errors])

    assert_equal 2, @store.get_client_operations_by_client("batch-client", page: 1, per_page: 100).total_count

    result = batch_add("batch-client", operations)

    assert_equal [], result[:added]
    assert_equal ["abcd", "efgh"], result[:not_modified]
    assert_equal [], result[:failed]
    assert_equal({}, result[:errors])

    assert_equal 2, @store.get_client_operations_by_client("batch-client", page: 1, per_page: 100).total_count

    operations = [
      { "alias" => "ijkl", "body" => "query B1 { batched1: __typename }" },
      { "alias" => "efgh", "body" => "query B2 { batched2: __typename }" },
    ]
    result = batch_add("batch-client", operations)
    assert_equal ["ijkl"], result[:added]
    assert_equal 3, @store.get_client_operations_by_client("batch-client", page: 1, per_page: 100).total_count

  ensure
    @store.delete_client("batch-client")
  end
end
