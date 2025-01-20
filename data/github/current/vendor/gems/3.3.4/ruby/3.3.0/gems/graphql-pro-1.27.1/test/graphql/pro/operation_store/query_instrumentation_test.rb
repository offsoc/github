# frozen_string_literal: true
require "test_helper"

class GraphQLProOperationStoreQueryInstrumenterTest < Minitest::Test
  include ConnectionHelpers

  module Tests
    def setup
      SqliteHelpers.setup_database_once
      @schema = get_schema
      reset_data
      @schema.operation_store.flush_pending_last_used_ats
    end

    def test_it_runs_queries_by_client_and_operation
      res = nil
      io = StringIO.new
      with_sql_log(io: io) do
        res = @schema.execute(context: { operation_id: "x-client-1/q-1", operation_store_touch_last_used_at: false })
      end
      assert_equal({"data" => { "__typename" => "Query" }}, res)
      assert_equal 1, io.string.scan("SELECT").count, "Only 1 sql select"
    end

    def test_it_runs_multiplexes
      res = nil
      io = StringIO.new
      with_sql_log(io: io) do
        res = @schema.multiplex([
          { context: { operation_id: "x-client-1/q-1", operation_store_touch_last_used_at: false } },
          { context: { operation_id: "x-client-1/q-2", operation_store_touch_last_used_at: false } }
        ])
      end
      expected_res = [
        {"data" => { "__typename" => "Query" }},
        {"data" => { "__typename" => "Query" }}
      ]
      assert_equal(expected_res, res)
      assert_equal 2, io.string.scan("SELECT").count, "Only 1 sql select per query"
    end

    def test_it_updates_last_used_at_by_default
      res = nil
      io = StringIO.new
      with_sql_log(io: io) do
        res = @schema.execute(context: { operation_id: "x-client-1/q-1" })
      end
      assert_equal({"data" => { "__typename" => "Query" }}, res)
      sql_string = io.string
      assert_equal 1, sql_string.scan("SELECT").count, "1 select in #{sql_string.inspect}"
      assert_equal 0, sql_string.scan("UPDATE").count, "no updates"
      assert_equal 1, @schema.operation_store.pending_last_used_ats.size

      io = StringIO.new
      with_sql_log(io: io) do
        @schema.operation_store.flush_pending_last_used_ats
      end
      sql_string = io.string
      assert_equal 1, sql_string.scan("UPDATE").count, "Updates one table in #{sql_string.inspect}"
      assert_equal 0, @schema.operation_store.pending_last_used_ats.size
    end

    def test_it_supports_per_query_or_global_overrides_to_not_touch_last_updated_at
      prev_touch_setting = @schema.operation_store.default_touch_last_used_at

      res = nil
      io = StringIO.new
      with_sql_log(io: io) do
        res = @schema.execute(context: { operation_id: "x-client-1/q-1", operation_store_touch_last_used_at: false  })
      end
      assert_equal({"data" => { "__typename" => "Query" }}, res)
      assert_equal 1, io.string.scan("SELECT").count, "Only 1 sql select"
      assert_equal 0, io.string.scan("UPDATE").count, "No updates"
      assert_equal 0, @schema.operation_store.pending_last_used_ats.size

      @schema.operation_store.default_touch_last_used_at = false
      io = StringIO.new
      with_sql_log(io: io) do
        res = @schema.execute(context: { operation_id: "x-client-1/q-1" })
      end
      assert_equal({"data" => { "__typename" => "Query" }}, res)
      assert_equal 1, io.string.scan("SELECT").count, "Only 1 sql select"
      assert_equal 0, io.string.scan("UPDATE").count, "No updates"
      assert_equal 0, @schema.operation_store.pending_last_used_ats.size

      io = StringIO.new
      with_sql_log(io: io) do
        res = @schema.execute(context: { operation_id: "x-client-1/q-1", operation_store_touch_last_used_at: true })
      end
      assert_equal({"data" => { "__typename" => "Query" }}, res)
      assert_equal 1, io.string.scan("SELECT").count, "1 select"
      assert_equal 0, io.string.scan("UPDATE").count, "no updates"
      assert_equal 1, @schema.operation_store.pending_last_used_ats.size

      io = StringIO.new
      with_sql_log(io: io) do
        res = @schema.operation_store.flush_pending_last_used_ats
      end
      assert_equal 1, io.string.scan("UPDATE").count, "Updates one table"
      assert_equal 0, @schema.operation_store.pending_last_used_ats.size

    ensure
      @schema.operation_store.default_touch_last_used_at = prev_touch_setting
    end

    def test_it_allows_normal_queries
      card_id = ConnectionHelpers::Card.where(name: "Heartmender").first.id
      if card_id.is_a?(Array)
        card_id = card_id.join(",")
      end
      query_str = "query GetCard($cardId: ID!){ card(id: $cardId) { name } }"
      res = @schema.execute(query_str, variables: { "cardId" => card_id })
      assert_equal "Heartmender", res["data"]["card"]["name"]
    end

    def test_it_somehow_handles_not_found_errors
      res = @schema.execute(context: { operation_id: "x-client-1/q-missing" })
      refute res.key?("data")
      assert_equal 2, res["errors"].length
      assert_equal "Operation not found for \"x-client-1/q-missing\"", res["errors"][0]["message"]
      assert_equal "No query string was present", res["errors"][1]["message"]
    end

    def test_it_errors_on_malformed_ids
      res = @schema.execute(
        context: { operation_id: "GetExpansion2" },
        variables: { "sym" => "SHM"}
      )
      refute res.key?("data")
      assert_equal "Failed to deconstruct operation id: GetExpansion2 (got: [\"GetExpansion2\"])", res["errors"][0]["message"]
      assert_equal "No query string was present", res["errors"][1]["message"]
    end

    def test_it_handles_slashes_in_op_names
      res = @schema.execute(
        context: { operation_id: "client-2/GetExpansion/2" },
        variables: { "sym" => "SHM"}
      )
      assert_equal "Shadowmoor", res["data"]["expansion"]["name"]
    end
  end

  include Tests

  def get_schema
    OperationStoreHelpers::ActiveRecordBackendSchema
  end
end

class GraphQLProOperationStoreQueryInstrumenterWithTraceTrueTest < Minitest::Test
  include ConnectionHelpers
  include GraphQLProOperationStoreQueryInstrumenterTest::Tests
  def get_schema
    OperationStoreHelpers::ActiveRecordBackendSchemaWithTraceTrue
  end
end
