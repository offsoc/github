# frozen_string_literal: true
require "test_helper"

if MODERN_RAILS
  module SelectsAssertions
    include ConnectionHelpers

    def setup
      @prev_ar_config = active_record_config
      database_helpers.setup_database_once
      ActiveRecord::Base.establish_connection(database_helpers.connection_options)
    end

    def teardown
      ActiveRecord::Base.establish_connection(@prev_ar_config)
    end

    def apply_selects(relation)
      relation.to_a # assert that it's a valid ordering
      ordered_rel, orders = GraphQL::Pro::RelationConnection::Order.normalize(relation)
      decorated_relation, _aliased_selects = GraphQL::Pro::RelationConnection::Selects.apply(ordered_rel, orders)
      decorated_relation.to_a # make sure this one is valid, too
      decorated_relation
    end

    # TODO make sure all three databases work with this
    def test_it_works_with_aliased_order_bys
      relation = Expansion
        .select("expansions.*", "date(created_at) AS created_date")
        .order("created_date")
      decorated_relation = apply_selects(relation)
      assert_includes decorated_relation.to_sql, "date(created_at) AS created_date"
      assert_includes decorated_relation.to_sql, "date(created_at) AS cursor_0"
      assert_includes decorated_relation.to_sql, "#{quote_char}expansions#{quote_char}.#{quote_char}id#{quote_char} AS cursor_1"
    end

    def test_it_works_with_order_by_function
      relation = Expansion
        .select("expansions.*", "date(created_at)")
        .order("date(created_at)")
      decorated_relation = apply_selects(relation)
      assert_includes decorated_relation.to_sql, "date(created_at),"
      assert_includes decorated_relation.to_sql, "date(created_at) AS cursor_0"
      assert_includes decorated_relation.to_sql, "#{quote_char}expansions#{quote_char}.#{quote_char}id#{quote_char} AS cursor_1"
    end

    def test_it_works_with_case
      # See https://github.com/rmosolgo/graphql-ruby/issues/3558
      relation = Expansion
        .select("expansions.*", "CASE WHEN created_at IS NOT NULL THEN 1 ELSE 0 END as has_created_at")
        .order("has_created_at")
      decorated_relation = apply_selects(relation)
      assert_includes decorated_relation.to_sql, "CASE WHEN created_at IS NOT NULL THEN 1 ELSE 0 END AS cursor_0"
      assert_includes decorated_relation.to_sql, "#{quote_char}expansions#{quote_char}.#{quote_char}id#{quote_char} AS cursor_1"
    end

    def test_it_works_with_quoting
      relation = Expansion
        .select("expansions.*", "date(created_at) AS #{quote_char}created_date#{quote_char}")
        .order("#{quote_char}created_date#{quote_char}")
      decorated_relation = apply_selects(relation)
      relation_sql = decorated_relation.to_sql
      assert_includes relation_sql, "date(created_at) AS #{quote_char}created_date#{quote_char}"
      assert_includes relation_sql, "date(created_at) AS cursor_0"
      assert_includes relation_sql, "#{quote_char}expansions#{quote_char}.#{quote_char}id#{quote_char} AS cursor_1"
      assert_includes relation_sql, "ORDER BY #{quote_char}created_date#{quote_char}"
    end

    def test_it_works_with_table_aliases
      relation = Printing
        .joins("LEFT OUTER JOIN (SELECT expansions.*, expansions.id AS ordering  from expansions) E on printings.expansion_id = E.id ")
        .order("E.ordering")
      decorated_relation = apply_selects(relation)
      expected_sql = "SELECT #{quoted("printings")}.*, E.ordering AS cursor_0, #{quoted("printings")}.#{quoted("id")} AS cursor_1 FROM #{quoted("printings")} LEFT OUTER JOIN (SELECT expansions.*, expansions.id AS ordering  from expansions) E on printings.expansion_id = E.id ORDER BY E.ordering, #{quoted("printings")}.#{quoted("id")} asc"
      assert_matching_sql expected_sql, decorated_relation.to_sql
    end
  end


  class GraphQLProRelationConnectionSelectsSQLiteTest < Minitest::Test
    include SelectsAssertions

    def database_helpers
      SqliteHelpers
    end

    def test_it_uses_the_right_config
      assert_equal "sqlite3", active_record_config[:adapter]
    end

    def quote_char
      '"'
    end
  end

  class GraphQLProRelationConnectionSelectsPostgresTest < Minitest::Test
    include SelectsAssertions

    def database_helpers
      PostgresHelpers
    end

    def test_it_uses_the_right_config
      assert_equal "postgresql", active_record_config[:adapter]
    end

    def quote_char
      '"'
    end

    def test_it_works_with_casting
      relation = Expansion
        .select("(name::varchar || created_at::varchar) as goofy_string")
        .order(Arel.sql("goofy_string DESC NULLS FIRST"))
      decorated_relation = apply_selects(relation)
      relation_sql = decorated_relation.to_sql
      assert_includes relation_sql, "(name::varchar || created_at::varchar) as goofy_string"
      assert_includes relation_sql, "(name::varchar || created_at::varchar) AS cursor_0"
      assert_includes relation_sql, "#{quote_char}expansions#{quote_char}.#{quote_char}id#{quote_char} AS cursor_1"
    end

    def test_it_handles_postgres_json_access_with_cast
      json_accesses = {
        "author_name" => "(metadata -> 'author_name')::varchar as author_name",
        "author_name2" => "(metadata->>'author_name') as author_name2",
        "(metadata  ->>'author_name3')" => "(metadata  ->>'author_name3')",
      }

      successes = []
      json_accesses.each do |order_by, access_sql|
        rel = Card
          .select("*", Arel.sql(access_sql))
          .order(Arel.sql(order_by))
        decorated_relation = apply_selects(rel)
        relation_sql = decorated_relation.to_sql
        assert_includes relation_sql, "#{access_sql},"
        access_expression = access_sql.split(" as ").first
        assert_includes relation_sql, "#{access_expression} AS cursor_0"
        assert_includes relation_sql, "ORDER BY #{order_by},"
        successes << access_sql
      end
      assert_equal json_accesses.values, successes
    end
  end

  class GraphQLProRelationConnectionSelectsMySqlTest < Minitest::Test
    include SelectsAssertions

    def database_helpers
      MysqlHelpers
    end

    def test_it_uses_the_right_config
      assert_equal "mysql2", active_record_config[:adapter]
    end

    def quote_char
      '`'
    end
  end
end
