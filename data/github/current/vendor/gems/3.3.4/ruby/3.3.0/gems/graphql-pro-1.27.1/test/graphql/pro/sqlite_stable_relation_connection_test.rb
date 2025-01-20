# frozen_string_literal: true

require "test_helper"

if defined?(GraphQL::Pagination)
  class SqliteStableRelationConnectionTest < Minitest::Test
    include StableRelationConnectionAssertions

    def prepare_database_once
      ar_connection({
        adapter:  "sqlite3",
        database: File.expand_path("./__restaurant.db"),
      })
      `rm -rf ./__restaurant.db`
      ExampleSchema.connections.add(ActiveRecord::Relation, GraphQL::Pro::SqliteStableRelationConnection)
    end

    def test_connection_sanity_check
      assert_instance_of ActiveRecord::ConnectionAdapters::SQLite3Adapter, ActiveRecord::Base.connection
    end

    def test_it_works_with_postgres_array
      skip "Postgres only"
    end
  end
end
