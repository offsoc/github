# frozen_string_literal: true
require_relative "../dashboard_test"
require_relative "./operation_store_component_assertions"

class GraphQLProDashboardActiveRecordOperationStoreSqliteComponentTest < GraphQLProDashboardTest
  include GraphQLProDashboardOperationStoreComponentAssertions
  include GraphQLProDashboardOperationStoreComponentAssertions::ActiveRecordAssertions

  def setup
    SqliteHelpers.setup_database_once
    @prev_conn = PostgresHelpers.with_connection(SqliteHelpers.connection_options)
    @supports_last_used_at = true
    super
  end

  def teardown
    # Switch the test suite back to whatever mode it used to be in
    PostgresHelpers.restore_connection(@prev_conn)
  end
end
