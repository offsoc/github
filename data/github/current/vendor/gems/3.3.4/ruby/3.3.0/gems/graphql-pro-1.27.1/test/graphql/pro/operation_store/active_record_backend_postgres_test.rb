# frozen_string_literal: true
require "test_helper"

class GraphQLProOperationStoreActiveRecordBackendPostgresTest < Minitest::Test
  include OperationStoreAssertions
  include OperationStoreHelpers
  include OperationStoreIndexAssertions
  include OperationStoreEndpointAssertions
  include OperationStoreAddOperationBatchAssertions

  def setup
    PostgresHelpers.setup_database_once
    @schema = OperationStoreHelpers::ActiveRecordBackendSchema
    @store = @schema.operation_store
    @supports_last_used_at = true
    @prev_conn = PostgresHelpers.with_connection
    @postgres_backend = true
  end

  def teardown
    # Switch the test suite back to whatever mode it used to be in
    PostgresHelpers.restore_connection(@prev_conn)
  end
end
