# frozen_string_literal: true

require "test_helper"

if defined?(GraphQL::Pagination)
  class MySQLStableRelationConnectionTest < Minitest::Test
    include StableRelationConnectionAssertions

    def prepare_database_once
      MysqlHelpers.setup_database_once
      ar_connection(MysqlHelpers.connection_options)
      ExampleSchema.connections.add(
        ActiveRecord::Relation,
        GraphQL::Pro::MySQLStableRelationConnection
      )
    end

    def test_connection_sanity_check
      assert_instance_of ActiveRecord::ConnectionAdapters::Mysql2Adapter, ActiveRecord::Base.connection
    end

    def test_it_paginates_by_field_with_null_explicitly_first
      skip "MySQL doesn't support NULLS FIRST"
    end

    def test_it_paginates_by_field_with_null_explicitly_last
      skip "MySQL doesn't support NULLS LAST"
    end

    def test_it_works_with_arel_expression
      skip "MySQL doesn't support ||"
    end

    def test_it_works_with_postgres_array
      skip "Postgres only"
    end

    def database_quote
      "`"
    end
  end
end
