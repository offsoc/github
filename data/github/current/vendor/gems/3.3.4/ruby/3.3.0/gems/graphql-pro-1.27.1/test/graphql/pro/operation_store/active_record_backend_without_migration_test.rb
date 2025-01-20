# frozen_string_literal: true
require "test_helper"

# This test is similiar to the other ActiveRecordBackend test, except it covers the scenario for
# when the ActiveRecord database hasn't been migrated to have `last_used_at` yet.
class GraphQLProOperationStoreActiveRecordBackendWithoutMigrationTest < Minitest::Test
  include OperationStoreAssertions
  include OperationStoreHelpers
  include OperationStoreIndexAssertions
  include OperationStoreEndpointAssertions

  def setup
    @schema = OperationStoreHelpers::ActiveRecordBackendSchema
    @store = @schema.operation_store
    @supports_last_used_at = false
    @prev_con = self.class.setup_legacy_database_connection
  end

  def teardown
    # Switch the test suite back to whatever mode it used to be in
    self.class.setup_default_database_connection(@prev_con)
  end


  class << self
    def setup_legacy_database_connection
      prev_con = active_record_config
      ActiveRecord::Base.establish_connection({adapter: "sqlite3", database: "../legacy_test.db"})
      # Otherwise, it might get stale column names from having been booted on the _real_ sqlite database
      ActiveRecord::Base.descendants.each(&:reset_column_information)
      prev_con
    end

    def setup_default_database_connection(con)
      ActiveRecord::Base.establish_connection(con)
      # Otherwise, it might get stale column names from having been booted on the _real_ sqlite database
      ActiveRecord::Base.descendants.each(&:reset_column_information)
    end

    def setup_legacy_sqlite_schema
      ActiveRecord::Schema.define do
        self.verbose = false
        # OPERATION STORE STRUCTURE
        create_table :graphql_clients, primary_key: :id do |t|
          t.column :name, :string, null: false
          t.column :secret, :string, null: false
          t.timestamps
        end
        add_index :graphql_clients, :name, unique: true
        add_index :graphql_clients, :secret, unique: true

        create_table :graphql_client_operations, primary_key: :id do |t|
          t.references :graphql_client, null: false
          t.references :graphql_operation, null: false
          t.column :alias, :string, null: false
          t.timestamps
        end
        add_index :graphql_client_operations, [:graphql_client_id, :alias], unique: true, name: "graphql_client_operations_pairs"

        create_table :graphql_operations, primary_key: :id do |t|
          t.column :digest, :string, null: false
          t.column :body, :text, null: false
          t.column :name, :string, null: false
          t.timestamps
        end
        add_index :graphql_operations, :digest, unique: true

        create_table :graphql_index_entries, primary_key: :id do |t|
          t.column :name, :string, null: false
        end
        add_index :graphql_index_entries, :name, unique: true

        create_table :graphql_index_references, primary_key: :id do |t|
          t.references :graphql_index_entry, null: false
          t.references :graphql_operation, null: false
        end
        add_index :graphql_index_references, [:graphql_index_entry_id, :graphql_operation_id], unique: true, name: "graphql_index_reference_pairs"
      end
    end
  end
  # Now set up the database once
  FileUtils.rm_rf("test/legacy_test.db")
  prev_con = setup_legacy_database_connection
  setup_legacy_sqlite_schema
  OperationStoreHelpers.add_fixtures(ActiveRecordBackendSchema.operation_store)
  setup_default_database_connection(prev_con)
end
