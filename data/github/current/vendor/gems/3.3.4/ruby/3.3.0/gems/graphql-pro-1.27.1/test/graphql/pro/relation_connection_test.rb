# frozen_string_literal: true
require "test_helper"

if MODERN_RAILS
  class GraphQLProRelationConnectionTest < Minitest::Test
    include ConnectionHelpers

    def cards_field_name
      "auto_cards"
    end

    def get_cursor_by_index(res, idx)
      edges = res["data"]["expansion"][cards_field_name]["edges"]
      edges[idx]["cursor"]
    end

    def get_names(res, field_name: cards_field_name)
      res["data"]["expansion"][field_name]["edges"].map { |e| e["node"]["name"] }
    end

    def assert_page_info(res, key, expected_value)
      assert_equal expected_value, get_page_info(res, key)
    end

    def get_page_info(res, key)
      res["data"]["expansion"][cards_field_name]["pageInfo"][key]
    end

    def exec_query(query_str, options)
      Schema.execute(query_str, **options)
    end

    def setup
      reset_data
    end

    def destroy_card(name)
      Card.find_by(name: name).destroy
    end

    def get_cards_query
      GET_CARDS_TEMPLATE % {field: cards_field_name}
    end

    # When we're testing the default sort, bc primary key includes name
    SHM_BY_PRIMARY_KEY = SHM_BY_NAME

    def test_it_works_without_supplying_first_or_last
      res = exec_query(get_cards_query, variables: {"sym" => "SHM"})
      assert_equal SHM_BY_PRIMARY_KEY[0, 5], get_names(res)

      no_page_size_query = GET_CARDS_TEMPLATE % {field: "auto_cards_without_max_page_size"}
      res = exec_query(no_page_size_query, variables: {"sym" => "SHM"})
      assert_equal SHM_BY_PRIMARY_KEY, get_names(res, field_name: "auto_cards_without_max_page_size")
    end

    def test_it_pages_by_id
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 4})
      assert_equal SHM_BY_PRIMARY_KEY[0, 4], get_names(res)
      assert_page_info(res, "hasNextPage", true)
      assert_page_info(res, "hasPreviousPage", false)
      assert_page_info(res, "startCursor", get_cursor_by_index(res, 0))
      assert_page_info(res, "endCursor", get_cursor_by_index(res, -1))

      last_cursor = get_cursor_by_index(res, -1)
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 4, "after" => last_cursor})
      assert_equal SHM_BY_PRIMARY_KEY[4, 4], get_names(res)
      assert_page_info(res, "hasNextPage", true)
      # bi-directional by default
      prev_page = TESTING_NEW_PAGINATION ? true : false
      assert_page_info(res, "hasPreviousPage", prev_page)
      assert_page_info(res, "startCursor", get_cursor_by_index(res, 0))
      assert_page_info(res, "endCursor", get_cursor_by_index(res, -1))

      with_bidirectional_pagination {
        res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 4, "after" => last_cursor})
        assert_page_info(res, "hasNextPage", true)
        assert_page_info(res, "hasPreviousPage", true)
      }

      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "last" => 4, "after" => last_cursor})
      assert_equal SHM_BY_PRIMARY_KEY[5, 4], get_names(res)
      assert_page_info(res, "hasNextPage", false)
      assert_page_info(res, "hasPreviousPage", true)
      assert_page_info(res, "startCursor", get_cursor_by_index(res, 0))
      assert_page_info(res, "endCursor", get_cursor_by_index(res, -1))

      destroy_card(SHM_BY_PRIMARY_KEY[3])
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 4, "after" => last_cursor})
      assert_equal SHM_BY_PRIMARY_KEY[4, 4], get_names(res)

      last_cursor = get_cursor_by_index(res, -1)
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 4, "after" => last_cursor})
      assert_equal SHM_BY_PRIMARY_KEY[8, 1], get_names(res)
    end

    def test_it_pages_backwards_by_id
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "last" => 4})
      assert_equal SHM_BY_PRIMARY_KEY[5, 4], get_names(res)

      first_cursor = get_cursor_by_index(res, 0)
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "last" => 3, "before" => first_cursor})
      assert_equal SHM_BY_PRIMARY_KEY[2, 3], get_names(res)
      # bi-directional by default
      next_page = TESTING_NEW_PAGINATION ? true : false
      assert_page_info(res, "hasNextPage", next_page)
      assert_page_info(res, "hasPreviousPage", true)

      with_bidirectional_pagination {
        res = exec_query(get_cards_query, variables: {"sym" => "SHM", "last" => 3, "before" => first_cursor})
        assert_page_info(res, "hasNextPage", true)
        assert_page_info(res, "hasPreviousPage", true)
      }
      # "Graven Cairns" when sorting by `id`
      # "Lockjaw Snapper" when sorting by `name,mana_cost`
      name_for_cursor = SHM_BY_PRIMARY_KEY[4]
      destroy_card(name_for_cursor)
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "last" => 4, "before" => first_cursor})
      assert_equal SHM_BY_PRIMARY_KEY[0, 4], get_names(res)
    end

    def test_it_pages_by_custom_sort
      orders = [{"by" => "name", "dir" => "asc"}]
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 4, "orders" => orders})
      assert_equal SHM_BY_NAME[0, 4], get_names(res)

      last_cursor = get_cursor_by_index(res, -1)
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 4, "after" => last_cursor, "orders" => orders})
      assert_equal SHM_BY_NAME[4, 4], get_names(res)

      destroy_card("Lockjaw Snapper")
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 4, "after" => last_cursor, "orders" => orders})
      assert_equal SHM_BY_NAME[5, 4], get_names(res)

      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "last" => 3, "before" => last_cursor, "orders" => orders})
      assert_equal SHM_BY_NAME[0, 3], get_names(res)

      first_cursor = get_cursor_by_index(res, 0)
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "last" => 3, "before" => first_cursor, "orders" => orders})
      assert_equal [], get_names(res)
    end

    def test_it_pages_by_millisecond
      orders = [{"by" => "created_at", "dir" => "asc"}, {"by" => "id", "dir" => "desc"}]
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 4, "orders" => orders})
      assert_equal SHM_BY_ID[0, 4], get_names(res)
      last_cursor = get_cursor_by_index(res, 3)

      res2 = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 4, "orders" => orders, "after" => last_cursor})
      assert_equal SHM_BY_ID[4, 4], get_names(res2)

      orders = [{"by" => "created_at", "dir" => "desc"}, {"by" => "id", "dir" => "asc"}]
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 4, "orders" => orders})
      assert_equal SHM_BY_ID[5, 4].reverse, get_names(res)
      last_cursor = get_cursor_by_index(res, 3)

      res2 = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 4, "orders" => orders, "after" => last_cursor})
      assert_equal SHM_BY_ID[1, 4].reverse, get_names(res2)
    end

    def test_it_pages_by_multiple_sort
      shm_by_colors_name = [
        "Heartmender",
        "Goldenglow Moth",
        "Spectral Procession",
        "Oona's Gatewarden",
        "Sygg, River Cuttthroat",
        "Hollowsage",
        "Graven Cairns",
        "Lockjaw Snapper",
        "Reflecting Pool",
      ]

      orders = [{"by" => "colors_s", "dir" => "desc"}, {"by" => "name", "dir" => "asc"}]

      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 3, "orders" => orders})
      assert_equal shm_by_colors_name[0, 3], get_names(res)

      last_cursor = get_cursor_by_index(res, -1)

      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "last" => 3, "before" => last_cursor, "orders" => orders})
      assert_equal shm_by_colors_name[0, 2], get_names(res)

      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 3, "after" => last_cursor, "orders" => orders})
      assert_equal shm_by_colors_name[3, 3], get_names(res)

      last_cursor = get_cursor_by_index(res, -1)

      destroy_card("Hollowsage")
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 2, "after" => last_cursor, "orders" => orders})
      assert_equal shm_by_colors_name[6, 2], get_names(res)

      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "last" => 3, "before" => last_cursor, "orders" => orders})
      assert_equal shm_by_colors_name[2, 3], get_names(res)

      first_cursor = get_cursor_by_index(res, 0)
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "last" => 3, "before" => first_cursor, "orders" => orders})
      assert_equal shm_by_colors_name[0, 2], get_names(res)
    end

    def test_it_handles_duplicate_cursor_values_by_using_id
      # Let the default ordering be applied
      orders = [{"by" => "converted_mana_cost", "dir" => "asc"}]
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 3, "orders" => orders})
      assert_equal SHM_BY_CMC[0, 3], get_names(res)

      last_cursor = get_cursor_by_index(res, -1)
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 3, "after" => last_cursor, "orders" => orders})
      assert_equal SHM_BY_CMC[3, 3], get_names(res)

      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 3, "after" => last_cursor, "orders" => orders})
      assert_equal SHM_BY_CMC[3, 3], get_names(res)
    end

    def test_it_handles_explicit_primary_key_sorts
      orders = [{"by" => "id", "dir" => "desc"}]
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 5, "orders" => orders})
      assert_equal SHM_BY_ID[4, 5].reverse, get_names(res)

      orders = [{"by" => "id", "dir" => "asc"}]
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "last" => 7, "orders" => orders})
      assert_equal SHM_BY_ID[4, 5], get_names(res)
    end

    def test_it_handles_before_and_after_cursors
      reverse_by_name = SHM_BY_NAME.reverse
      orders = [{"by" => "name", "dir" => "desc"}]
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 5, "orders" => orders})
      assert_equal reverse_by_name[0, 5], get_names(res)

      from_cursor = get_cursor_by_index(res, 1)
      to_cursor = get_cursor_by_index(res, -2)
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 5, "after" => from_cursor, "before" => to_cursor, "orders" => orders})
      assert_equal reverse_by_name[2, 1], get_names(res)
      # Is this right?
      assert_page_info(res, "hasNextPage", false)
      # bi-directional by default
      prev_page = TESTING_NEW_PAGINATION ? true : false
      assert_page_info(res, "hasPreviousPage", prev_page)
    end

    def test_it_handles_pagination_at_boundaries
      orders = [{"by" => "name", "dir" => "asc"}]
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 5, "orders" => orders})
      assert_equal 5, get_names(res).size
      first_cursor = get_cursor_by_index(res, 1)
      last_cursor = get_cursor_by_index(res, -1)
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 5, "orders" => orders, "after" => last_cursor})
      assert_equal 4, get_names(res).size
      last_cursor = get_cursor_by_index(res, -1)

      with_bidirectional_pagination do
        res = exec_query(get_cards_query, variables: {"sym" => "SHM", "last" => 1, "orders" => orders, "before" => last_cursor})
        page_info = res["data"]["expansion"][cards_field_name]["pageInfo"]
        assert_equal true, page_info["hasNextPage"]
        assert_equal true, page_info["hasPreviousPage"]

        res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 1, "orders" => orders, "after" => first_cursor})
        page_info = res["data"]["expansion"][cards_field_name]["pageInfo"]
        assert_equal true, page_info["hasNextPage"]
        assert_equal true, page_info["hasPreviousPage"]
      end
    end

    def test_it_applies_max_page_size
      orders = [{"by" => "id", "dir" => "desc"}]
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 7, "orders" => orders})
      assert_equal SHM_BY_ID[4, 5].reverse, get_names(res)

      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "last" => 7, "orders" => orders})
      assert_equal SHM_BY_ID[0, 5].reverse, get_names(res)
    end

    def test_it_handles_order_by_joined_table
      orders = [{"by" => "expansion_name", "dir" => "asc"}, {"by" => "name", "dir" => "asc"}]
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 4, "orders" => orders})
      assert_equal SHM_BY_NAME[0, 4], get_names(res)

      last_cursor = get_cursor_by_index(res, -1)
      log = StringIO.new
      with_sql_log(io: log) do
        res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 4, "after" => last_cursor, "orders" => orders})
      end

      expected_ordering = "ORDER BY expansions.name asc, \"cards\".\"name\" ASC"
      assert_includes log.string, expected_ordering
      assert_equal SHM_BY_NAME[4, 4], get_names(res)
    end

    def test_it_handles_order_by_case
      # Hardcoded to match the code in connection_helpers.rb
      long_name, short_name = SHM_BY_NAME.partition { |n| n.length > 14 }
      wacky_order = long_name.sort + short_name.sort

      # Asc
      orders = [{"by" => "cast_stmt", "dir" => "asc"}, {"by" => "name", "dir" => "asc"}]
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 4, "orders" => orders})
      assert_equal wacky_order[0, 4], get_names(res)

      last_cursor = get_cursor_by_index(res, -1)
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 4, "orders" => orders, "after" => last_cursor})
      assert_equal wacky_order[4, 4], get_names(res)

      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "last" => 2, "orders" => orders, "before" => last_cursor})
      assert_equal wacky_order[1, 2], get_names(res)

      # Desc
      orders = [{"by" => "cast_stmt", "dir" => "desc"}, {"by" => "name", "dir" => "desc"}]
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 4, "orders" => orders})
      assert_equal wacky_order[-4, 4].reverse, get_names(res)

      last_cursor = get_cursor_by_index(res, -1)
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 4, "orders" => orders, "after" => last_cursor})
      assert_equal wacky_order[-8, 4].reverse, get_names(res)

      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "last" => 2, "orders" => orders, "before" => last_cursor})
      assert_equal wacky_order[-3, 2].reverse, get_names(res)
    end

    def test_it_accepts_offset_based_cursors
      check_accepts_offset_cursor(GraphQL::Schema::Base64Encoder)
      check_accepts_offset_cursor(EncryptedCursorEncoder)
    end

    def check_accepts_offset_cursor(encoder)
      orders = []
      last_cursor = encoder.encode("3", nonce: true)
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 3, "after" => last_cursor, "orders" => orders})
      assert_equal SHM_BY_PRIMARY_KEY[3, 3], get_names(res)
      assert_page_info(res, "hasNextPage", true)
      # bi-directional by default
      reverse_page = TESTING_NEW_PAGINATION ? true : false
      assert_page_info(res, "hasPreviousPage", reverse_page)
      # It returns a value-based cursor:
      card_id = Card.find_by(name: SHM_BY_PRIMARY_KEY[5]).id
      expected_cursor = card_id.to_json
      end_cursor = get_page_info(res, "endCursor")
      assert_equal expected_cursor, EncryptedCursorEncoder.decode(end_cursor, nonce: true)

      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "last" => 2, "before" => last_cursor, "orders" => orders})
      assert_equal SHM_BY_PRIMARY_KEY[0, 2], get_names(res)
      assert_page_info(res, "hasNextPage", reverse_page)
      assert_page_info(res, "hasPreviousPage", false)
      # It returns a value-based cursor:
      card_id = Card.find_by(name: SHM_BY_PRIMARY_KEY[0]).id
      expected_cursor = card_id.to_json
      start_cursor = get_page_info(res, "startCursor")
      assert_equal expected_cursor, EncryptedCursorEncoder.decode(start_cursor, nonce: true)
    end

    if TESTING_NEW_PAGINATION
      def test_it_handles_blank_cursors
        orders = []
        last_cursor = ""
        res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 3, "after" => last_cursor, "orders" => orders})
        assert_equal SHM_BY_PRIMARY_KEY[0, 3], get_names(res)
      end
    end

    def test_it_includes_custom_fields
      res = exec_query(get_cards_query, variables: {"sym" => "SHM", "first" => 4})
      assert_equal 9, res["data"]["expansion"][cards_field_name]["totalCount"]

      custom_data = if TESTING_NEW_PAGINATION
        ["", "", "p:5", "", "4", "", "", ""]
      else
        ["ConnectionHelpers::Expansion", cards_field_name, "p:5", "a:2", "4", "", "", ""]
      end
      assert_equal custom_data, res["data"]["expansion"][cards_field_name]["customData"]
    end

    def test_it_runs_count_only
      query_str = <<-GRAPHQL
      query getCards(
        $sym: String!
        ) {
        expansion(sym: $sym) {
          #{cards_field_name}(first: 4) {
            totalCount
          }
        }
      }
      GRAPHQL

      res = exec_query(query_str, variables: {"sym" => "SHM"})
      assert_equal 9, res["data"]["expansion"][cards_field_name]["totalCount"]
    end

    def get_each_grouped_value(res, name)
      res["data"]["expansion"]["rarity_infos"]["edges"].map { |e| e["node"][name] }
    end

    def assert_grouped_page_info(res, next_page, prev_page)
      assert_equal next_page, res["data"]["expansion"]["rarity_infos"]["pageInfo"]["hasNextPage"], "has expected next page"
      assert_equal prev_page, res["data"]["expansion"]["rarity_infos"]["pageInfo"]["hasPreviousPage"], "has expected previous page"
    end

    GROUPED_QUERY_STRING = <<-GRAPHQL
    query GetRarity($first: Int, $after: String, $last: Int, $before: String, $order: Boolean) {
      expansion(sym: "SHM") {
        rarity_infos(first: $first, after: $after, last: $last, before: $before, order: $order) {
          edges {
            node {
              rarity
              name
              name_len
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    }
    GRAPHQL

    def test_it_works_with_grouped_stuff
      query_str = GROUPED_QUERY_STRING
      res = exec_query(query_str, variables: {"first" => 1})
      assert_equal ["Spectral Procession"], get_each_grouped_value(res, "name")
      assert_equal ["UNCOMMON"], get_each_grouped_value(res, "rarity")
      assert_grouped_page_info(res, true, false)

      next_cursor = res["data"]["expansion"]["rarity_infos"]["pageInfo"]["endCursor"]
      res = exec_query(query_str, variables: {"first" => 1, "last" => 1, "after" => next_cursor})
      assert_equal ["Sygg, River Cuttthroat"], get_each_grouped_value(res, "name")
      assert_equal ["RARE"], get_each_grouped_value(res, "rarity")
      reverse_page = TESTING_NEW_PAGINATION ? true : false
      assert_grouped_page_info(res, true, reverse_page)

      res = exec_query(query_str, variables: {"first" => 12, "after" => next_cursor})
      assert_equal ["Sygg, River Cuttthroat", "Goldenglow Moth"], get_each_grouped_value(res, "name")
      assert_equal ["RARE", "COMMON"], get_each_grouped_value(res, "rarity")
      assert_grouped_page_info(res, false, reverse_page)

      next_cursor = res["data"]["expansion"]["rarity_infos"]["pageInfo"]["endCursor"]
      res = exec_query(query_str, variables: {"last" => 1, "before" => next_cursor})
      assert_equal ["Sygg, River Cuttthroat"], get_each_grouped_value(res, "name")
      assert_equal ["RARE"], get_each_grouped_value(res, "rarity")
      assert_grouped_page_info(res, reverse_page, true)

      res = exec_query(query_str, variables: {"last" => 5, "before" => next_cursor})
      assert_equal ["Spectral Procession", "Sygg, River Cuttthroat"], get_each_grouped_value(res, "name")
      assert_equal ["UNCOMMON", "RARE"], get_each_grouped_value(res, "rarity")
      assert_grouped_page_info(res, reverse_page, false)

      head_cursor = res["data"]["expansion"]["rarity_infos"]["pageInfo"]["startCursor"]
      res = exec_query(query_str, variables: {"last" => 1, "first" => 1, "before" => next_cursor, "after" => head_cursor})
      assert_equal ["Sygg, River Cuttthroat"], get_each_grouped_value(res, "name")
      # I'm not entirely sure hasPreviousPage=false is the right behavior
      assert_grouped_page_info(res, false, reverse_page)

      res = exec_query(query_str, variables: {"last" => 1})
      assert_equal ["Goldenglow Moth"], get_each_grouped_value(res, "name")
      assert_grouped_page_info(res, false, true)
    end

    def test_it_blows_up_on_unordered_relations
      query_str = GROUPED_QUERY_STRING
      assert_raises(GraphQL::Pro::RelationConnection::InvalidRelationError) {
        exec_query(query_str, variables: {"last" => 1, "order" => false})
      }
    end

    def test_it_has_compound_primary_keys
      assert_equal ["name", "mana_cost"], ConnectionHelpers::Card.primary_key
    end

    def test_it_works_with_range_add
      query_s = "
      mutation($name: String!, $expansionSym: String!) {
        addCard(input: { name: $name, expansionSym: $expansionSym }) {
          expansion {
            sym
          }
          newCardEdge {
            node {
              name
            }
            cursor
          }
        }
      }
      "

      res = exec_query(query_s, variables: { "name" => "Kulrath Knight", expansionSym: "SHM" })
      assert_equal "Kulrath Knight", res["data"]["addCard"]["newCardEdge"]["node"]["name"]
      assert_instance_of String, res["data"]["addCard"]["newCardEdge"]["cursor"]
      assert_equal "SHM", res["data"]["addCard"]["expansion"]["sym"]
    ensure
      ConnectionHelpers::Card.last.destroy
    end
  end
end
