# frozen_string_literal: true
require "test_helper"

module OperationStoreAssertions
  include OperationStoreHelpers::Assertions

  def normalize(query_str)
    doc = GraphQL.parse(query_str)
    GraphQL::Pro::OperationStore::Normalize.to_normalized_graphql(doc)
  end

  def test_it_finds_by_alias
    op_str = @store.get(operation_alias: "q-1", client_name: "x-client-1").body
    assert_equal "query GetTypename{__typename}", op_str
    op_str = @store.get(operation_alias: "q-2", client_name: "x-client-1").body
    assert_equal "query GetTypename2{__typename}", op_str
  end

  # Overridden in redis tests
  def prepare_last_used_at(t)
    t
  end

  def test_it_adds_an_accessor_to_schemas
    prev_version = GraphQL::VERSION
    [prev_version, "1.9.silly"].each do |stubbed_graphql_version|
      capture_io do
        GraphQL.send(:const_set, :VERSION, stubbed_graphql_version)
      end
      assert_instance_of GraphQL::Pro::OperationStore, @schema.operation_store
      new_schema = Class.new(GraphQL::Schema)
      assert_nil new_schema.operation_store
    end
  ensure
    capture_io do
      GraphQL.send(:const_set, :VERSION, prev_version)
    end
  end

  def test_finding_by_alias_can_update_last_used_at
    init_clients("last-used-at-1") do
      @store.add(body: "query GetExpansionReleaseDate2 { expansion(sym: \"ISD\") { release_date } }", operation_alias: "q-3", client_name: "last-used-at-1")
      operation = @store.get(operation_alias: "q-3", client_name: "last-used-at-1")
      assert_nil operation.last_used_at
      assert_nil @store.index.get_entry("Expansion.release_date").last_used_at

      Timecop.freeze do
        operation = @store.get(operation_alias: "q-3", client_name: "last-used-at-1", touch_last_used_at: true)
        if @supports_last_used_at
          s = 0
          while @store.pending_last_used_ats.any?
            s += 1
            if s > 100
              raise "Waited #{s} seconds for pending last-used-ats, but they weren't updated"
            end
            sleep 1 # wait for the thread to tick!
          end
          limit = 7
          assert s < limit, "It ticked in less than #{limit} seconds (it took #{s} seconds)"
        end
        # Redis does seconds, AR does milliseconds
        expected_last_used_at = prepare_last_used_at(Time.now.utc).to_i

        if @supports_last_used_at
          assert_equal expected_last_used_at, operation.last_used_at.to_i
          entry_last_used_at = @store.index.get_entry("Expansion.release_date").last_used_at
          # This happens on CI?
          if entry_last_used_at.is_a?(String)
            entry_last_used_at = DateTime.parse(entry_last_used_at)
          end
          assert_equal expected_last_used_at, entry_last_used_at.to_i

          # Also present when reloaded
          operation = @store.get(operation_alias: "q-3", client_name: "last-used-at-1")
          assert_equal expected_last_used_at, operation.last_used_at.to_i
        else
          assert_nil operation.last_used_at
          assert_nil @store.index.get_entry("Expansion.release_date").last_used_at
        end
      end
    end
  end

  def test_it_returns_nil_for_missing_alias
    res = @store.get(operation_alias: "q-missing", client_name: "x-client-1")
    assert_nil res
  end

  def test_it_finds_by_client_and_op_name
    expected = "query GetExpansion1{expansion(sym:\"SHM\"){...ExpansionFields}}fragment ExpansionFields on Expansion{name,sym}"
    res = @store.get(operation_alias: "GetExpansion1", client_name: "client-1")
    actual = res.body
    assert_equal expected, actual
    # Normalized, minified
    expected = "query GetExpansion2($sym:String!){expansion(sym:$sym){name,...ExpansionFields}}fragment ExpansionFields on Expansion{name,sym}"
    res = @store.get(operation_alias: "GetExpansion2", client_name: "client-1")
    actual = res.body
    assert_equal expected, actual
  end

  def test_it_returns_nil_for_missing_client_name
    res = @store.get(operation_alias: "GetExpansion1", client_name: "client-999")
    assert_nil res
  end

  def test_it_returns_nil_for_missing_op_name
    res = @store.get(operation_alias: "GetExpansion3", client_name: "client-1")
    assert_nil res
  end

  def test_it_rejects_slash_in_client_name
    err = assert_raises GraphQL::Pro::OperationStore::InvalidClientNameError do
      @store.upsert_client("sl/ash", "1")
    end
    assert_includes err.message, "may not include /"
  end

  def test_it_requires_unique_and_present_names
    @store.upsert_client("invalid-client-1", "12345")
    res = @store.add(
      body: OperationStoreHelpers::INVALID_CLIENT_DOC_1,
      operation_alias: "..",
      client_name: "invalid-client-1",
    )
    assert_equal true, res.failed?
    if @store.supports_batch_upsert?
      assert_equal ["Documents must contain only 1 operation, but received: GetCard, GetCard, (anonymous)"], res.errors
    else
      assert_equal [
        "Operation names must be unique, but 2 operations are named \"GetCard\" (2:3, 3:3)",
        "Operation names are required, but there is 1 unnamed operation (1:1)",
      ], res.errors
    end
  ensure
    @store.delete_client("invalid-client-1")
  end

  def test_it_requires_valid_graphql
    @store.upsert_client("invalid-client-1", "12345")
    res = @store.add(
      body: "query InvalidSyntax { card(id: 1) { name }",
      client_name: "invalid-client-1",
      operation_alias: "...",
    )
    assert_equal 1, res.errors.length
    assert_equal "Syntax error: Expected NAME, actual: (none) (\"\") at [1, 42]", res.errors.first

    res = @store.add(
      body: "query InvalidUsage { card(id: 1) { nonsense } }",
      client_name: "invalid-client-1",
      operation_alias: "....",
    )
    assert_equal 1, res.errors.length
    assert_equal "Field 'nonsense' doesn't exist on type 'Card' (1:36)", res.errors.first
  ensure
    @store.delete_client("invalid-client-1")
  end

  def test_it_dedups_matches_between_clients
    init_clients("dedup-1", "dedup-2", "dedup-3")
    query_str_1 = "query GetCard500 { card(id: 500) { name } }"
    query_str_2 = " query GetCard499 { card(id: 499) { name } }"
    # GetCard500 was stored once, GetCard499 was stored once
    assert_adds_operations(1) do
      @store.add(body: query_str_1, operation_alias: "GetCard500", client_name: "dedup-1")
    end
    assert_adds_operations(1) do
      @store.add(body: query_str_2, operation_alias: "GetCard499", client_name: "dedup-2")
    end
    assert_adds_operations(0) do
      @store.add(body: query_str_1, operation_alias: "GetCard500", client_name: "dedup-3")
    end

    @store.delete_client("dedup-1")
    refute_nil @store.get(client_name: "dedup-3", operation_alias: "GetCard500")
    @store.delete_client("dedup-2")
    refute_nil @store.get(client_name: "dedup-3", operation_alias: "GetCard500")
    @store.delete_client("dedup-3")
    assert_nil @store.get(client_name: "dedup-3", operation_alias: "GetCard500")
    names = @store.all_operations(page: 1, per_page: 50).items.map(&:name)
    refute_includes names, "GetCard500"
  end

  def test_it_removes_operations
    init_clients("cleanup-1") do
      query_str_1 = "query GetCard600 { card(id: 600) { name __typename } }"
      assert_adds_operations(1) do
        @store.add(body: query_str_1, operation_alias: "GetCard600", client_name: "cleanup-1")
      end
      assert_equal 1, @store.all_index_entries(search_term: "Card.__typename", page: 1, per_page: 100).total_count
      # Fetched from the test DB:
      digest = "0301472dc9972854dad4bd256f3ea7c1"
      assert_adds_operations(-1) do
        @store.delete_operation(digest)
      end
      assert_equal 0, @store.get_client_operations_by_client("cleanup-1", page: 1, per_page: 100).total_count
      assert_equal 0, @store.all_index_entries(search_term: "Card.__typename", page: 1, per_page: 100).total_count
    end
  end

  def test_it_rejects_set_with_duplicate_client_name_and_op_name
    query_str_1 = "query GetCard501 { card(id: 501) { name } }"
    res = @store.add(body: query_str_1, client_name: "x-client-1", operation_alias: "q-1")
    assert_equal 1, res.errors.length
    if MODERN_RAILS
      assert_equal "Uniqueness validation failed: make sure operation aliases are unique for 'x-client-1'", res.errors.first
    else
      # Rails 3 doesn't raise ActiveRecord::RecordNotUnique, so we can't respond to it
      assert_equal "An internal error occurred", res.errors.first
    end
  end

  def test_it_normalizes_query_strings
    init_clients("normalize-test-1", "normalize-test-2")
    query_str_1 = "query GetCard99 { card(id: 99) { name, colors } }"
    # same query, different whitespace & comment:
    query_str_2 = "
      query GetCard99 {
        card(id: 99) {
          colors # stupid comment
          name # another stupid comment
        }
      }
    "

    assert_adds_operations(1) do
      @store.add(body: query_str_1, operation_alias: "GetCard99", client_name: "normalize-test-1")
    end

    assert_adds_operations(0) do
      @store.add(body: query_str_2, operation_alias: "GetCard99", client_name: "normalize-test-2")
    end

    @store.delete_client("normalize-test-1")
    @store.delete_client("normalize-test-2")
  end

  def test_it_allows_duplicate_names_with_different_clients
    query_str_1 = @store.get(client_name: "x-client-1", operation_alias: "q-2")
    query_str_2 = @store.get(client_name: "x-client-2", operation_alias: "q-2")
    assert_equal query_str_1.body, query_str_2.body
  end

  def with_logger_io(io:)
    prev_logger = GraphQL::Pro::OperationStore.logger
    GraphQL::Pro::OperationStore.logger = Logger.new(io)
    GraphQL::Pro::OperationStore.logger.level = Logger::DEBUG
    yield
    io
  ensure
    GraphQL::Pro::OperationStore.logger = prev_logger
  end

  def test_it_logs_stuff
    io = StringIO.new
    res = nil
    with_logger_io(io: io) do
      res = @store.add(body: "query T { __typename }", client_name: "x-client-1", operation_alias: "q-1")
    end
    assert res.failed?
    error_class_name = if @postgres_backend
      "PG::UniqueViolation"
    else
      "SQLite3::ConstraintException"
    end

    assert_includes io.string, error_class_name
  end

  def test_it_archives_operations
    skip "Explicitly not supported" unless @supports_last_used_at

    @store.reindex

    assert @store.get(client_name: "client-1", operation_alias: "GetExpansion2")
    assert_equal ["GetExpansion1", "GetExpansion2"], @store.get_client_operations_by_client("client-1", per_page: 50, page: 1).items.map(&:operation_alias)
    assert_equal 2, @store.index.get_entry("Expansion.sym").references_count
    assert_equal 0, @store.index.get_entry("Expansion.sym").archived_references_count

    @store.archive_operations(digests: ["bc2ef23b12e3875f809fd2ec57284df6"], is_archived: true)
    refute @store.get(client_name: "client-1", operation_alias: "GetExpansion2")
    assert_equal ["GetExpansion1"], @store.get_client_operations_by_client("client-1", per_page: 50, page: 1).items.map(&:operation_alias)
    assert_equal ["GetExpansion2"], @store.get_client_operations_by_client("client-1", per_page: 50, page: 1, is_archived: true).items.map(&:operation_alias)
    assert_equal 1, @store.index.get_entry("Expansion.sym").references_count

    @store.archive_operations(digests: ["89dcc1ef5c48948f607e8d5dffff310c", "55bb6cc0f223e03622432b2329f1eac4"], is_archived: true)

    assert_equal 0, @store.index.get_entry("Expansion").references_count
    assert_equal 3, @store.index.get_entry("Expansion").archived_references_count
    assert_equal 0, @store.index.get_entry("Expansion.sym").references_count
    assert_equal 2, @store.index.get_entry("Expansion.sym").archived_references_count

    @store.archive_operations(digests: ["bc2ef23b12e3875f809fd2ec57284df6", "89dcc1ef5c48948f607e8d5dffff310c", "55bb6cc0f223e03622432b2329f1eac4"], is_archived: false)
    assert @store.get(client_name: "client-1", operation_alias: "GetExpansion2")
    assert_equal ["GetExpansion1", "GetExpansion2"], @store.get_client_operations_by_client("client-1", per_page: 50, page: 1).items.map(&:operation_alias)
    assert_equal 2, @store.index.get_entry("Expansion.sym").references_count
    assert_equal 3, @store.index.get_entry("Expansion").references_count
  end

  def test_it_archives_client_operations
    skip "Explicitly not supported" unless @supports_last_used_at
    assert @store.get(client_name: "client-1", operation_alias: "GetExpansion2")
    assert_equal ["GetExpansion1", "GetExpansion2"], @store.get_client_operations_by_client("client-1", per_page: 50, page: 1).items.map(&:operation_alias)

    @store.archive_client_operations(client_name: "client-1", operation_aliases: ["GetExpansion2"], is_archived: true)
    refute @store.get(client_name: "client-1", operation_alias: "GetExpansion2")
    assert_equal ["GetExpansion1"], @store.get_client_operations_by_client("client-1", per_page: 50, page: 1).items.map(&:operation_alias)
    assert_equal ["GetExpansion2"], @store.get_client_operations_by_client("client-1", per_page: 50, page: 1, is_archived: true).items.map(&:operation_alias)

    @store.archive_client_operations(client_name: "client-1", operation_aliases: ["GetExpansion2"], is_archived: false)
    assert @store.get(client_name: "client-1", operation_alias: "GetExpansion2")
    assert_equal ["GetExpansion1", "GetExpansion2"], @store.get_client_operations_by_client("client-1", per_page: 50, page: 1).items.map(&:operation_alias)
  end

  def test_it_doesnt_accept_redis_and_update_last_used_at_every
    err = assert_raises ArgumentError do
      Class.new(GraphQL::Schema) do
        use GraphQL::Pro::OperationStore, redis: true, update_last_used_at_every: 5
      end
    end
    assert_equal "`update_last_used_at_every: ...` is only supported for ActiveRecord, please remove that option.", err.message
  end

  def test_it_doesnt_require_printing
    doc = GraphQL.parse("{ bad(arg: 9999e999) }")
    # Make sure this isn't printed:
    doc.singleton_class.undef_method(:to_query_string)
    assert GraphQL::Query.new(@schema, document: doc)
  end

  if Rails.version > "5"
    def test_the_db_structure_is_up_to_date
      skip "Not testing on postgres" if @postgres_backend
      skip "Not testing on redis" if @redis_backend
      # If this ever changes, we need to:
      # - Update the getting-started docs
      # - Add migration docs
      # This way, new users can get up to speed correctly
      # and existing users can update their db for the new structure
      file_path = @supports_last_used_at ? "./test/support/schema.sql" : "./test/support/schema_legacy.sql"
      prev_structure = File.read(file_path)
      prev_structure.sub!(
        "CREATE TABLE \"printings\" (\"id\" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, \"card_id\" integer, \"expansion_id\" integer)",
        "CREATE TABLE \"printings\" (\"id\" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, \"card_name\" varchar, \"card_mana_cost\" varchar, \"expansion_id\" integer)"
      )

      current_structure_result = ActiveRecord::Base.connection.execute <<-SQL
        SELECT name, sql FROM sqlite_master
        WHERE
          (type='table' OR type='index')
          AND name NOT LIKE 'sqlite%'
          AND name NOT LIKE 'ar_%'
        ORDER BY name;
      SQL

      # Downcase both to avoid case sensitivity

      current_structure = current_structure_result
        .map { |r| r["sql"].to_s.strip + "\n"}
        .join
        .downcase

      assert_equal prev_structure.downcase, current_structure, "The database schema is up-to-date"
    end
  end
end
