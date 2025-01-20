# frozen_string_literal: true

require "test_helper"

if defined?(GraphQL::Pagination)
  class PostgresStableRelationConnectionTest < Minitest::Test
    include StableRelationConnectionAssertions

    def prepare_database_once
      PostgresHelpers.setup_database_once
      ar_connection(PostgresHelpers.connection_options)
      ExampleSchema.connections.add(
        ActiveRecord::Relation,
        GraphQL::Pro::PostgresStableRelationConnection
      )
    end

    # Override the default expectations here, because Postgres treats
    # nulls differently than MySQL and SQLite
    NAMES_BY_BILLIARD_TABLES_ASC = [
      "The Villa",        # => 0
      "Rapture",          # => 6
      "Sam's Kitchen",    # => null
      "Peter Chang's",    # => null
      "Taste of China",   # => null
    ]

    NAMES_BY_BILLIARD_TABLES_DESC = [
      "Sam's Kitchen",    # => null
      "Peter Chang's",    # => null
      "Taste of China",   # => null
      "Rapture",          # => 6
      "The Villa",        # => 0
    ]

    def test_connection_sanity_check
      assert_instance_of ActiveRecord::ConnectionAdapters::PostgreSQLAdapter, ActiveRecord::Base.connection
    end

    # It seems like MySQL and Sqlite handled this case fine:
    def test_it_handles_mismatched_value_types
      query_str = <<-GRAPHQL
      query($first: Int, $last: Int, $before: String, $after: String, $orderBy: RestaurantOrderField!) {
        restaurants(first: $first, after: $after, last: $last, before: $before, order: [{by: $orderBy dir: ASC}]) {
          nodes { name }
          pageInfo { endCursor }
        }
      }
      GRAPHQL
      variables = { first: 2, after: nil, orderBy: "NEIGHBORHOOD" }
      res = exec_query(query_str, variables: variables)
      cursor = res["data"]["restaurants"]["pageInfo"]["endCursor"]

      variables = { first: 2, after: cursor, orderBy: "OPENED_AT" }
      res = exec_query(query_str, variables: variables)
      assert_equal ["Invalid cursor for `after: \"WyIyOSBOb3J0aCIsM10\"`. Fetch a new cursor and try again."], res["errors"].map { |err| err["message"] }

      variables = { last: 2, before: cursor, orderBy: "BILLIARDS_TABLES_COUNT" }
      res = exec_query(query_str, variables: variables)
      assert_equal ["Invalid cursor for `before: \"WyIyOSBOb3J0aCIsM10\"`. Fetch a new cursor and try again."], res["errors"].map { |err| err["message"] }
    end
  end
end
