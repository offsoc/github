# frozen_string_literal: true

module GraphQLProDashboardOperationStoreComponentAssertions
  def setup
    super
    @schema.operation_store.all_clients(page: 1, per_page: 50).items.each do |client_record|
      @schema.operation_store.delete_client(client_record.name)
    end
    OperationStoreHelpers.add_fixtures(@schema.operation_store)
  end

  module ActiveRecordAssertions
    def setup
      super
      @store.reindex
      prepare_last_used_at
      # Change this so we can test it later:
      GraphQL::Pro::OperationStore::ActiveRecordBackend::GraphQLClient.where(
        name: "client-1"
      ).update_all(created_at: "2011-01-01 01:00:00")
      GraphQL::Pro::OperationStore::ActiveRecordBackend::GraphQLClientOperation.where(
        alias: "GetExpansion1"
      ).update_all(created_at: "2222-01-02 02:00:00")
    end

    def test_it_supports_last_used_at
      expected_col_names = ["id", "graphql_client_id", "graphql_operation_id", "alias", "is_archived", "last_used_at", "created_at", "updated_at"]
      col_names = GraphQL::Pro::OperationStore::ActiveRecordBackend::GraphQLClientOperation.column_names
      assert_equal expected_col_names.sort, col_names.sort
    end
  end

  def prepare_last_used_at
    @t1 = Time.now + 15
    Timecop.freeze(@t1) do
      assert @store.get(client_name: "client-2", operation_alias: "GetExpansion/2", touch_last_used_at: true)
    end

    @t2 = Time.now + 20
    Timecop.freeze(@t2) do
      assert @store.get(client_name: "client-1", operation_alias: "GetExpansion2", touch_last_used_at: true)
    end

    @t3 = Time.now + 22
    Timecop.freeze(@t3) do
      assert @store.get(client_name: "client-1", operation_alias: "GetExpansion1", touch_last_used_at: true)
    end

    @t4 = Time.now + 25
    Timecop.freeze(@t4) do
      assert @store.get(client_name: "client-2", operation_alias: "GetCard", touch_last_used_at: true)
    end

    if @supports_last_used_at
      @schema.operation_store.flush_pending_last_used_ats
    end
  end

  def test_it_renders_archived_counts_for_clients
    skip "Explicitly not testing this" unless @supports_last_used_at

    get "/clients"
    assert_equal 200, last_response.status
    # Make sure we serve good headers
    assert last_response.headers.key?("Content-Type")
    assert last_response.headers.key?("Content-Length")

    assert_body_includes_in_order(
      "client-1",
      "<td>2</td>",
      "client-2",
      "<td>3</td>",
    )

    post "/operations/archive", { values: "bc2ef23b12e3875f809fd2ec57284df6" }

    get "/clients"
    assert_body_includes_in_order(
      "client-1",
      '<td>1 <span class="muted">(1 archived)</span></td>',
      "client-2",
      '<td>2 <span class="muted">(1 archived)</span></td>',
    )

    post "/operations/unarchive", { values: "bc2ef23b12e3875f809fd2ec57284df6" }

    get "/clients"
    assert_body_includes_in_order(
      "client-1",
      "<td>2</td>",
      "client-2",
      "<td>3</td>",
    )
  end

  def test_it_renders_clients
    get "/clients"
    assert_equal 200, last_response.status
    # Make sure we serve good headers
    assert last_response.headers.key?("Content-Type")
    assert last_response.headers.key?("Content-Length")

    assert_body_includes_in_order("client-1", "client-2")
    assert_body_includes "client-1"
    assert_body_includes "<td>2</td>"
    assert_body_includes "client-2"
    assert_body_includes "<td>3</td>"
    if @supports_last_used_at
      refute_body_includes @t1.utc.strftime("%Y-%m-%dT%H:%M:%S+00:00") + "</time>"
      assert_body_includes @t3.utc.strftime("%Y-%m-%dT%H:%M:%S+00:00") + "</time>"
      assert_body_includes @t4.utc.strftime("%Y-%m-%dT%H:%M:%S+00:00") + "</time>"
    else
      refute_body_includes @t1.utc.strftime("%Y-%m-%dT%H:%M:%S+00:00") + "</time>"
      refute_body_includes @t2.utc.strftime("%Y-%m-%dT%H:%M:%S+00:00") + "</time>"
      refute_body_includes @t3.utc.strftime("%Y-%m-%dT%H:%M:%S+00:00") + "</time>"
      refute_body_includes @t4.utc.strftime("%Y-%m-%dT%H:%M:%S+00:00") + "</time>"
    end

    client_1_created_at = if MODERN_RAILS
      "2011-01-01T01:00:00+00:00"
    else
      # Not normalized to UTC on old rails
      "2011-01-01T01:00:00-05:00"
    end
    assert_body_includes "datetime=\"#{client_1_created_at}\""

    # TODO how to get uniform formating from these?
    client_1_updated_at = "2222-01-02T02:00:00+00:00"
    assert_body_includes "datetime=\"#{client_1_updated_at}\""

    # Showing all on one page
    refute_body_includes "prev"
    refute_body_includes "next"

    # Paginate past all clients:
    get "/clients?page=2"
    assert_equal 200, last_response.status
    refute_body_includes "client-1"
    refute_body_includes "client-2"
    assert_body_includes "prev"
    refute_body_includes "next"

    # Right in the middle:
    get "/clients?page=2&per_page=1"
    assert_equal 200, last_response.status
    refute_body_includes "client-1"
    assert_body_includes "client-2"
    assert_body_includes "prev"
    assert_body_includes "next"
    assert_body_includes "order_by=last_used_at&order_dir=asc"
    assert_body_includes "order_by=name&order_dir=desc"

    if @supports_last_used_at
      # ordering by last_used_at
      get "/clients?page=2&per_page=1&order_by=last_used_at"
      assert_equal 200, last_response.status
      refute_body_includes "client-1"
      assert_body_includes "client-2"
      assert_body_includes "prev"
      assert_body_includes "next"
      assert_body_includes "order_by=last_used_at&order_dir=desc"
      assert_body_includes "order_by=name&order_dir=asc"

      get "/clients?page=2&per_page=1&order_by=last_used_at&order_dir=desc"
      assert_equal 200, last_response.status
      assert_body_includes "client-1"
      refute_body_includes "client-2"
      assert_body_includes "prev"
      assert_body_includes "next"
      assert_body_includes "order_by=last_used_at&order_dir=asc"
      assert_body_includes "order_by=name&order_dir=asc"
    end

    assert_raises ArgumentError do
      get "/clients?page=2&per_page=1&order_by=bogus&order_dir=desc"
    end

    get "/clients?page=2&per_page=1&order_by=name&order_dir=bogus"
    assert_body_includes "order_by=name&order_dir=desc"
  end

  def test_it_renders_client_operations
    get "/clients/client-2/operations"
    assert_equal 200, last_response.status
    assert_body_includes "client-2"
    assert_body_includes "Manage client-2"
    if @supports_last_used_at
      assert_body_includes @t1.utc.strftime("%Y-%m-%dT%H:%M:%S+00:00") + "</time>"
      refute_body_includes @t2.utc.strftime("%Y-%m-%dT%H:%M:%S+00:00") + "</time>"
      assert_body_includes @t4.utc.strftime("%Y-%m-%dT%H:%M:%S+00:00") + "</time>"
    else
      refute_body_includes @t1.utc.strftime("%Y-%m-%dT%H:%M:%S+00:00") + "</time>"
      refute_body_includes @t2.utc.strftime("%Y-%m-%dT%H:%M:%S+00:00") + "</time>"
      refute_body_includes @t4.utc.strftime("%Y-%m-%dT%H:%M:%S+00:00") + "</time>"
    end
    assert_body_includes "3 Operations"
    assert_body_includes_in_order(
      "GetCard",
      "GetExpansion1",
      "GetExpansion/2",
    )
    # Showing all on one page
    refute_body_includes "prev"
    refute_body_includes "next"

    # Right in the middle:
    get "/clients/client-2/operations?page=2&per_page=1"
    assert_equal 200, last_response.status
    assert_body_includes "3 Operations"
    refute_body_includes "GetCard"
    assert_body_includes "GetExpansion1"
    refute_body_includes "GetExpansion2"
    assert_body_includes "prev"
    assert_body_includes "next"
    assert_body_includes "?order_by=name&order_dir=desc"
    assert_body_includes "?order_by=last_used_at&order_dir=asc"

    # It shows aliases
    get "/clients/x-client-1/operations"
    assert_body_includes "q-1"
    assert_body_includes "q-2"

    if @supports_last_used_at
      get "/clients/client-2/operations?page=2&per_page=1&order_by=last_used_at&order_dir=asc"
      if @postgres_backend
        # Postgres puts nulls last
        refute_body_includes "GetExpansion1"
        refute_body_includes "GetExpansion/2"
        assert_body_includes "GetCard"
      else
        refute_body_includes "GetExpansion1"
        assert_body_includes "GetExpansion/2"
        refute_body_includes "GetCard"

        get "/clients/client-2/operations?page=3&per_page=1&order_by=last_used_at&order_dir=desc"
        refute_body_includes "GetCard"
        refute_body_includes "GetExpansion/2"
        assert_body_includes "GetExpansion1"

        get "/clients/client-2/operations?page=3&per_page=1&order_by=name&order_dir=desc"
        refute_body_includes "GetExpansion1"
        refute_body_includes "GetExpansion/2"
        assert_body_includes "GetCard"
      end
    end
  end

  def test_it_renders_client_manage
    get "/clients/x-client-1/manage"
    assert_equal 200, last_response.status
    assert_body_includes 'disabled value="x-client-1"'
    assert_body_includes '>x-client-1-secret</textarea'
    assert_body_includes 'value="Save"'
    assert_body_includes "Delete x-client-1"
  end

  def test_it_renders_new_client
    get "/clients/new/manage"
    assert_equal 200, last_response.status
    assert_body_includes "New Client"
    assert_body_includes />\w{64}<\/textarea/
    assert_body_includes 'value="Save"'
    refute_body_includes "Delete"
  end

  def test_it_creates_and_updates_clients
    post "/clients/new/save", { client_name: "created-client", client_secret: "created-client-secret" }
    assert_equal 302, last_response.status

    client = @schema.operation_store.get_client("created-client")
    assert_equal "created-client-secret", client.secret

    post "/clients/created-client/save", { client_name: "created-client", client_secret: "created-client-secret-2" }
    assert_equal 302, last_response.status

    client = @schema.operation_store.get_client("created-client")
    assert_equal "created-client", client.name
    assert_equal "created-client-secret-2", client.secret
  end

  def test_it_renders_operations
    get "/operations"
    assert_body_includes "GetCard<"
    assert_body_includes "GetExpansion1"
    assert_body_includes "GetExpansion2"
    if @supports_last_used_at
      assert_body_includes @t2.utc.strftime("%Y-%m-%dT%H:%M:%S+00:00") + "</time>"
      assert_body_includes @t3.utc.strftime("%Y-%m-%dT%H:%M:%S+00:00") + "</time>"
      assert_body_includes @t4.utc.strftime("%Y-%m-%dT%H:%M:%S+00:00") + "</time>"
    else
      refute_body_includes @t2.utc.strftime("%Y-%m-%dT%H:%M:%S+00:00") + "</time>"
    end
    assert_body_includes "GetExpansionReleaseDate"
    assert_body_includes "GetTypename"
    # Showing all on one page
    refute_body_includes "prev"
    refute_body_includes "next"

    get "/operations?per_page=2&page=2"
    refute_body_includes "GetCard<"
    refute_body_includes "GetExpansion1"
    # There's some kind of test-order dependency issue here. Sometimes,
    # a full run of the tests makes it look like there's one more record in the DB than expected :S
    assert_body_includes "GetExpansion2"
    assert_body_includes "GetExpansionReleaseDate"
    assert_body_includes "prev"
    assert_body_includes "?order_by=name&order_dir=desc"
    assert_body_includes "?order_by=last_used_at&order_dir=asc"

    get "/operations?per_page=1&page=2"
    assert_body_includes "next"
    assert_body_includes "prev"

    get "/operations?per_page=1&page=200"
    refute_body_includes "next"
    assert_body_includes "prev"

    if @supports_last_used_at
      get "/operations?per_page=2&page=2&order_by=last_used_at&order_dir=asc"
      assert_body_includes "/operations?per_page=2&page=1&order_by=last_used_at&order_dir=asc"
      assert_body_includes "/operations?per_page=2&page=3&order_by=last_used_at&order_dir=asc"
      # Postgres puts nulls last by default, instead of nulls first
      if @postgres_backend
        assert_body_includes "GetCard"
      else
        assert_body_includes "GetExpansion2"
        # This is backend-dependent, it's an object with NULL for last-used-at
        # assert_body_includes "GetExpansionReleaseDate"
        get "/operations?per_page=2&page=3&order_by=last_used_at&order_dir=asc"
        assert_body_includes "GetExpansion1"
        assert_body_includes "GetCard"

        get "/operations?per_page=2&page=1&order_by=last_used_at&order_dir=desc"
        assert_body_includes "GetExpansion1"
        assert_body_includes "GetCard"
      end
    end
  end

  def test_it_renders_operation_detail
    # I grabbed this hardcoded value from the test db
    digest = "bc2ef23b12e3875f809fd2ec57284df6"
    get "/operations/#{digest}"
    assert_equal 200, last_response.status
    assert_body_includes "client-1"
    assert_body_includes "client-2"
    assert_body_includes "GetExpansion2"
    assert_body_includes "GetExpansion/2"
    # Minified:
    assert_body_includes "query GetExpansion2($sym:String!){expansion"
    # Index references
    assert_body_includes "Query.expansion.sym"
    # Last-used-at
    if @supports_last_used_at
      assert_body_includes @t2.utc.strftime("%Y-%m-%dT%H:%M:%S+00:00") + "</time>"
    else
      refute_body_includes @t2.utc.strftime("%Y-%m-%dT%H:%M:%S+00:00") + "</time>"
    end

    # Grabbed from the test db
    digest_2 = "b161214b11847649e7f36cc50e1257a1"
    get "/operations/#{digest_2}"
    # The operation name is present
    assert_body_includes "GetTypename"
    # The alias is present
    assert_body_includes "q-1"
  end

  def test_it_archives_and_unarchives_operations
    skip "Explicitly not testing this" unless @supports_last_used_at
    get "/operations"
    assert_body_includes "GetExpansion2"
    assert_body_includes "6 Operations"

    post "/operations/archive", { values: "bc2ef23b12e3875f809fd2ec57284df6" }
    assert_equal 302, last_response.status

    get "/operations"
    refute_body_includes "GetExpansion2"
    assert_body_includes "5 Operations"
    assert_body_includes "1 Archived Operation<"
    assert_body_includes "/operations/archived"
    assert_body_includes ">Archive<"

    get "/operations/archived"
    assert_body_includes "GetExpansion2"
    assert_body_includes "5 Operations"
    assert_body_includes "1 Archived Operation<"
    assert_body_includes ">Unarchive<"

    post "/operations/unarchive", { values: "bc2ef23b12e3875f809fd2ec57284df6" }
    assert_equal 302, last_response.status

    get "/operations"
    assert_body_includes "GetExpansion2"
    assert_body_includes "6 Operations"

    get "/operations/archived"
    refute_body_includes "GetExpansion2"
    assert_body_includes "0 Archived Operations"
  end

  def test_it_archives_and_unarchives_client_operations
    skip "Explicitly not testing this" unless @supports_last_used_at
    get "clients/client-1/operations"
    assert_body_includes "GetExpansion2"
    assert_body_includes "2 Operations"
    refute_body_includes "Archived Operation"

    post "clients/client-1/operations/archive", { values: "client-1/GetExpansion2" }
    assert_equal 302, last_response.status

    get "clients/client-1/operations"
    refute_body_includes "GetExpansion2"
    assert_body_includes "1 Operation"
    assert_body_includes "1 Archived Operation"
    assert_body_includes "/clients/client-1/operations/archived"

    get "clients/client-1/operations/archived"
    assert_body_includes "GetExpansion2"
    assert_body_includes "1 Operation<"
    assert_body_includes "1 Archived Operation<"

    post "clients/client-1/operations/unarchive", { values: "client-1/GetExpansion2" }
    assert_equal 302, last_response.status

    get "clients/client-1/operations"
    assert_body_includes "GetExpansion2"
    assert_body_includes "2 Operations"

    get "clients/client-1/operations/archived"
    refute_body_includes "GetExpansion2"
    assert_body_includes "0 Archived Operations"
  end

  def test_it_renders_archived_operation_detail
    skip "Explicitly not testing this" unless @supports_last_used_at

    post "clients/client-1/operations/archive", { values: "client-1/GetExpansion2" }
    assert_equal 302, last_response.status

    get "operations/bc2ef23b12e3875f809fd2ec57284df6"
    assert_body_includes "<h3>GetExpansion2</h3>"
    assert_body_includes "GetExpansion2 (client-1, archived)"
    assert_body_includes "GetExpansion/2 (client-2)"
    assert_body_includes "Archive GetExpansion2"

    post "clients/client-2/operations/archive", { values: "client-2/GetExpansion/2" }
    assert_equal 302, last_response.status

    get "operations/bc2ef23b12e3875f809fd2ec57284df6"
    assert_body_includes "<h3>GetExpansion2 <span class=\"muted\">(archived)</span></h3>"
    assert_body_includes "GetExpansion2 (client-1, archived)"
    assert_body_includes "GetExpansion/2 (client-2, archived)"
    assert_body_includes "Unarchive GetExpansion2"

    post "operations/bc2ef23b12e3875f809fd2ec57284df6/unarchive"
    assert_equal 302, last_response.status

    get "operations/bc2ef23b12e3875f809fd2ec57284df6"
    assert_body_includes "<h3>GetExpansion2</h3>"
    assert_body_includes "GetExpansion2 (client-1)"
    assert_body_includes "GetExpansion/2 (client-2)"
    assert_body_includes "Archive GetExpansion2"
  end

  def test_it_renders_the_index
    get "/index"
    assert_equal 200, last_response.status
    assert_body_includes "Expansion.name"
    if @supports_last_used_at
      @schema.operation_store.flush_pending_last_used_ats
      assert_body_includes @t3.utc.strftime("%Y-%m-%dT%H:%M:%S+00:00") + "</time>"
    else
      refute_body_includes @t3.utc.strftime("%Y-%m-%dT%H:%M:%S+00:00") + "</time>"
    end
    assert_body_includes "Query.card.id"

    get "/index?q=Query.card"
    assert_equal 200, last_response.status
    refute_body_includes "Expansion.name"
    assert_body_includes "Query.card.id"
    assert_body_includes "Query.card"

    get "/index?q=Query.card&page=1&per_page=1"
    assert_equal 200, last_response.status
    assert_body_includes "Query.card"
    assert_body_includes "?q=Query.card&page=2&per_page=1"
    assert_body_includes_link "next &raquo;", "/index?q=Query.card&page=2&per_page=1"
    refute_body_includes "Query.card.id"

    get "/index?q=Query.card&page=2&per_page=1"
    assert_equal 200, last_response.status
    refute_body_includes "Query.card<"
    assert_body_includes "Query.card.id<"
    assert_body_includes "?q=Query.card&page=1&per_page=1"
  end

  def test_it_shows_archived_operation_counts_in_the_index
    skip "Not supported" unless @supports_last_used_at

    get "/index"
    assert_body_includes_in_order(
      "Expansion</a>",
      "<td>3</td>",
      "Expansion.name",
      "<td>2</td>"
    )

    post "/operations/archive", { values: "55bb6cc0f223e03622432b2329f1eac4" }

    get "/index"
    assert_body_includes_in_order(
      "Expansion</a>",
      '2 <span class="muted">(1 archived)</span>',
      "Expansion.name",
      '<td>2</td>'
    )

    post "/operations/archive", { values: "89dcc1ef5c48948f607e8d5dffff310c,bc2ef23b12e3875f809fd2ec57284df6"}

    get "/index"
    assert_body_includes_in_order(
      "Expansion</a>",
      '0 <span class="muted">(3 archived)</span>',
      "Expansion.name",
      '0 <span class="muted">(2 archived)</span>'
    )

    post "/operations/unarchive", { values: "55bb6cc0f223e03622432b2329f1eac4,89dcc1ef5c48948f607e8d5dffff310c,bc2ef23b12e3875f809fd2ec57284df6"}

    get "/index"
    assert_body_includes_in_order(
      "Expansion</a>",
      "<td>3</td>",
      "Expansion.name",
      "<td>2</td>"
    )
  end

  def test_it_renders_index_detail
    get "/index/Query.card"
    assert_equal 200, last_response.status
    assert_body_includes "GetCard"
    # Link to parent
    assert_body_includes_link "Query", "/index/Query"
    # last-used-at
    if @supports_last_used_at
      assert_body_includes @t4.utc.strftime("%Y-%m-%dT%H:%M:%S+00:00") + "</time>"
    else
      refute_body_includes @t4.utc.strftime("%Y-%m-%dT%H:%M:%S+00:00") + "</time>"
    end

    assert_page_includes_link("/index/Card.name", "Card", "/index/Card")
  end

  def test_it_renders_archived_info_in_index_detail
    skip "Not supported" unless @supports_last_used_at

    get "/index/Expansion.name"
    refute_body_includes "(archived)"

    post "/operations/archive", { values: "89dcc1ef5c48948f607e8d5dffff310c" }
    get "/index/Expansion.name"
    assert_body_includes "GetExpansion1</a> <span class=\"muted\">(archived)</span>"
    refute_body_includes "GetExpansion2</a> <span class=\"muted\">(archived)</span>"

    post "/operations/archive", { values: "bc2ef23b12e3875f809fd2ec57284df6"}

    get "/index/Expansion.name"
    assert_body_includes "GetExpansion1</a> <span class=\"muted\">(archived)</span>"
    assert_body_includes "GetExpansion2</a> <span class=\"muted\">(archived)</span>"

    post "/operations/unarchive", { values: "89dcc1ef5c48948f607e8d5dffff310c,bc2ef23b12e3875f809fd2ec57284df6"}

    get "/index/Expansion.name"
    assert_body_includes "GetExpansion1"
    assert_body_includes "GetExpansion2"
    refute_body_includes "GetExpansion1</a> <span class=\"muted\">(archived)</span>"
    refute_body_includes "GetExpansion2</a> <span class=\"muted\">(archived)</span>"
  end
end
