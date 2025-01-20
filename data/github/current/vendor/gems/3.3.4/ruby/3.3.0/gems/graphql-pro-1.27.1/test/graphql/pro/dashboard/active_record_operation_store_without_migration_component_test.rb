# frozen_string_literal: true
require_relative "../operation_store/active_record_backend_without_migration_test"
require_relative "../dashboard_test"
require_relative "./operation_store_component_assertions"

class GraphQLProDashboardActiveRecordOperationStoreWithoutMigrationComponentTest < GraphQLProDashboardTest
  include GraphQLProDashboardOperationStoreComponentAssertions
  include GraphQLProDashboardOperationStoreComponentAssertions::ActiveRecordAssertions

  def setup
    @prev_con = GraphQLProOperationStoreActiveRecordBackendWithoutMigrationTest.setup_legacy_database_connection
    @supports_last_used_at = false
    super
  end

  def teardown
    # Switch the test suite back to whatever mode it used to be in
    GraphQLProOperationStoreActiveRecordBackendWithoutMigrationTest.setup_default_database_connection(@prev_con)
  end

  def test_it_supports_last_used_at
    expected_col_names = if @supports_last_used_at
      ["id", "graphql_client_id", "graphql_operation_id", "alias", "last_used_at", "created_at", "updated_at"]
    else
      ["id", "graphql_client_id", "graphql_operation_id", "alias",                 "created_at", "updated_at"]
    end
    col_names = GraphQL::Pro::OperationStore::ActiveRecordBackend::GraphQLClientOperation.column_names
    assert_equal expected_col_names.sort, col_names.sort
  end
end
