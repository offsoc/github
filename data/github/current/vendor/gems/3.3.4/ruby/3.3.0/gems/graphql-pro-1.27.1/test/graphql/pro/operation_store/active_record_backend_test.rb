# frozen_string_literal: true
require "test_helper"
require_relative "validate_assertions"

class GraphQLProOperationStoreActiveRecordBackendTest < Minitest::Test
  include OperationStoreAssertions
  include OperationStoreHelpers
  include OperationStoreIndexAssertions
  include OperationStoreEndpointAssertions
  include OperationStoreAddOperationBatchAssertions
  include GraphQLProOperationStoreValidateAssertions

  def setup
    SqliteHelpers.setup_database_once
    @schema = OperationStoreHelpers::ActiveRecordBackendSchema
    @validate_test_schema = Class.new(ValidateTestSchema) do
      use GraphQL::Pro::OperationStore
    end
    @store = @schema.operation_store
    @supports_last_used_at = true
  end

  def test_it_is_setup_correctly
    assert @schema.operation_store.supports_batch_upsert?, [@schema.operation_store, @schema.operation_store.instance_variable_get(:@backend)]
  end

  def test_it_saves_last_used_at_in_batches
    io = StringIO.new
    with_sql_log(io: io) do
      @store.get(client_name: "client-1", operation_alias: "GetExpansion2", touch_last_used_at: true)
      @store.get(client_name: "client-1", operation_alias: "GetExpansion1", touch_last_used_at: true)
    end
    log = io.string
    assert_equal 0, log.scan("UPDATE").count
    assert_equal 2, @store.pending_last_used_ats.size

    s = 0
    io = StringIO.new
    with_sql_log(io: io) do
      while @store.pending_last_used_ats.any?
        s += 1
        if s > 100
          raise "Waited #{s} seconds for pending last-used-ats, but they weren't updated"
        end
        sleep 1 # wait for the thread to tick!
      end
    end
    log = io.string
    assert_equal 2, log.scan("UPDATE").count, "Updates in #{log.inspect}"
    assert_equal 0, @store.pending_last_used_ats.size
  end

  def test_it_saves_last_used_at_synchronously_when_set_to_zero
    prev_update_every = @store.update_last_used_at_every
    @store.update_last_used_at_every = 0
    io = StringIO.new
    with_sql_log(io: io) do
      @store.get(client_name: "client-1", operation_alias: "GetExpansion2", touch_last_used_at: true)
      @store.get(client_name: "client-1", operation_alias: "GetExpansion1", touch_last_used_at: true)
    end
    log = io.string
    assert_equal 2, log.scan("UPDATE").count, "It updates inline"
    assert_equal 0, @store.pending_last_used_ats.size
  ensure
    @store.update_last_used_at_every = prev_update_every
  end

  def test_it_upserts_operations_in_batches
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
    # - find existing operations
    # - find existing index entries
    # - re-fetch bulk inserted operations
    # - re-fetch bulk inserted index entries
    # - find existing client operations
    assert_equal 6, log.scan("SELECT").count, log
    # - add new operations
    # - add new index entries
    # - add new index references
    # - add new client operations
    assert_equal 4, log.scan("INSERT").count

    io = StringIO.new
    with_sql_log(io: io) do
      batch_add("batch-client", operations)
    end
    assert_equal 2, @store.get_client_operations_by_client("batch-client", page: 1, per_page: 100).total_count
    log = io.string
    # No Changes:
    # - find client
    # - find existing operations
    # - find existing client operations
    assert_equal 3, log.scan("SELECT").count
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
    # - find existing operations
    # - re-fetch bulk inserted operations
    # - find existing client operations
    assert_equal 5, log.scan("SELECT").count
    # - add new operations
    # - add new index references
    # - add new client operations
    assert_equal 3, log.scan("INSERT").count
  ensure
    @store.delete_client("batch-client")
  end
end
