# frozen_string_literal: true
# rubocop:disable Naming/MethodName
require 'test_helper'

module FilterAssertions
  include ConnectionHelpers

  def setup
    @prev_ar_config = active_record_config
    database_helpers.setup_database_once
    ActiveRecord::Base.establish_connection(database_helpers.connection_options)
  end

  def teardown
    ActiveRecord::Base.establish_connection(@prev_ar_config)
  end

  def apply_filter_to(relation, after: nil, before: nil, allow_eq: false)
    relation.to_a # assert that it's a valid ordering
    ordered_rel, orders = GraphQL::Pro::RelationConnection::Order.normalize(relation)
    # In order not to break existing tests,
    # ignore the added selects here. Let's just make sure that
    # `HAVING` works properly.
    _decorated_relation, aliased_selects = GraphQL::Pro::RelationConnection::Selects.apply(ordered_rel, orders)

    filtered_rel = GraphQL::Pro::RelationConnection::Filter.filter_relation(
      relation: ordered_rel,
      order_values: orders,
      aliased_selects: aliased_selects,
      before: before,
      after: after,
      allow_eq: allow_eq,
      small_nulls: false
    )
    filtered_rel.to_a # assert that it's valid
    filtered_rel
  end

  def test_it_gracefully_handles_cursors_with_too_many_values
    relation = Expansion.all
    err = assert_raises GraphQL::ExecutionError do
      apply_filter_to(relation, after: "[10, 100]")
    end
    assert_equal "The provided cursor was invalid, please fetch a new cursor and try again", err.message
  end

  def test_it_doesnt_use_OR_IS_NULL_for_primary_keys
    relation = Expansion.all
    filtered_rel = apply_filter_to(relation, after: "[10]")
    expected_sql = "SELECT #{quoted("expansions")}.* FROM #{quoted("expansions")} WHERE (#{quoted("expansions")}.#{quoted("id")} > #{stringify_mysql('10')}) ORDER BY #{quoted("expansions")}.#{quoted("id")} asc"
    assert_matching_sql expected_sql, filtered_rel.to_sql
  end

  def test_it_adds_OR_IS_NULL_for_nullable_columns
    relation = Card.joins(:expansions).order("expansions.name")
    filtered_rel = apply_filter_to(relation, after: '["abc"]')
    expected_sql = "SELECT #{quoted("cards")}.* FROM #{quoted("cards")} " \
      "INNER JOIN #{quoted("printings")} ON #{quoted("printings")}.#{quote_char}card_name#{quote_char} = #{quoted("cards")}.#{quoted("name")} " \
      "AND #{quoted("printings")}.#{quote_char}card_mana_cost#{quote_char} = #{quoted("cards")}.#{quote_char}mana_cost#{quote_char} " \
      "INNER JOIN #{quoted("expansions")} ON #{quoted("expansions")}.#{quoted("id")} = #{quoted("printings")}.#{quote_char}expansion_id#{quote_char} " \
      "WHERE ((#{quoted("expansions")}.#{quoted("name")} > 'abc' OR #{quoted("expansions")}.#{quoted("name")} IS NULL)) " \
      "ORDER BY expansions.name, #{quoted("cards")}.#{quoted("mana_cost")} asc"
    assert_matching_sql expected_sql, filtered_rel.to_sql

    relation = Expansion.order(name: :desc)
    filtered_rel = apply_filter_to(relation, after: '["abc"]')
    expected_sql = "SELECT #{quoted("expansions")}.* FROM #{quoted("expansions")} WHERE (#{quoted("expansions")}.#{quoted("name")} < 'abc') ORDER BY #{quoted("expansions")}.#{quoted("name")} DESC, #{quoted("expansions")}.#{quoted("id")} asc"
    assert_matching_sql expected_sql, filtered_rel.to_sql
  end

  def test_it_doesnt_add_OR_IS_NULL_for_null_false_columns
    relation = Card.order(rarity: :desc)
    filtered_rel = apply_filter_to(relation, after: '["uncommon"]')
    expected_sql = "SELECT #{quoted("cards")}.* FROM #{quoted("cards")} WHERE (#{quoted("cards")}.#{quoted("rarity")} < 'uncommon') ORDER BY #{quoted("cards")}.#{quoted("rarity")} DESC, #{quoted("cards")}.#{quoted("name")} asc, #{quoted("cards")}.#{quoted("mana_cost")} asc"
    assert_matching_sql expected_sql, filtered_rel.to_sql
  end

  def test_it_rescues_JSON_parse_errors
    relation = Card.order(rarity: :desc)
    err = assert_raises GraphQL::Pro::StableRelationConnection::InvalidCursorError do
      apply_filter_to(relation, after: '[uncommon"]')
    end
    assert_equal "Invalid cursor for `after`. Fetch a new cursor and try again.", err.message
    assert_equal :after, err.argument_name
  end

  def test_it_works_with_column_aliases
    relation = Card.select("length(name) as letter_count").order("letter_count")
    filtered_rel = apply_filter_to(relation)
    expected_sql = "SELECT length(name) as letter_count FROM #{quoted("cards")} ORDER BY letter_count, #{quoted("cards")}.#{quoted("name")} asc, #{quoted("cards")}.#{quoted("mana_cost")} asc"
    assert_matching_sql expected_sql, filtered_rel.to_sql
  end

  def test_it_adds_OR_IS_NULL_for_grouped_columns
    relation = Card.group("rarity").select("sum(length(name)) as letter_count").order("letter_count")
    filtered_rel = apply_filter_to(relation, after: "[10]")
    expected_sql = "SELECT sum(length(name)) as letter_count FROM #{quoted("cards")} GROUP BY #{quoted("cards")}.#{quoted("rarity")} HAVING (sum(length(name)) > #{stringify_mysql('10')} OR sum(length(name)) IS NULL) ORDER BY letter_count"
    assert_matching_sql expected_sql, filtered_rel.to_sql
  end

  def test_it_adds_OR_IS_NULL_for_dynamic_columns
    relation = Card.order(Arel.sql("CASE WHEN 1 = 1 THEN 100 ELSE 99 END"))
    filtered_rel = apply_filter_to(relation, after: "[10]")
    expected_sql = "SELECT #{quoted("cards")}.* FROM #{quoted("cards")} WHERE ((CASE WHEN 1 = 1 THEN 100 ELSE 99 END > #{stringify_mysql('10')} OR CASE WHEN 1 = 1 THEN 100 ELSE 99 END IS NULL)) ORDER BY CASE WHEN 1 = 1 THEN 100 ELSE 99 END, #{quoted("cards")}.#{quoted("name")} asc, #{quoted("cards")}.#{quoted("mana_cost")} asc"
    assert_matching_sql expected_sql, filtered_rel.to_sql


    relation = Expansion.order(Arel.sql("LENGTH(name)"))
    filtered_rel = apply_filter_to(relation, after: "[10]")
    expected_sql = "SELECT #{quoted("expansions")}.* FROM #{quoted("expansions")} WHERE ((LENGTH(name) > #{stringify_mysql('10')} OR LENGTH(name) IS NULL)) ORDER BY LENGTH(name), #{quoted("expansions")}.#{quoted("id")} asc"
    assert_matching_sql expected_sql, filtered_rel.to_sql
  end

  def stringify_mysql(value)
    value
  end
end

class GraphQLProRelationConnectionFilterSQLiteTest < Minitest::Test
  include FilterAssertions

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

class GraphQLProRelationConnectionFilterPostgresTest < Minitest::Test
  include FilterAssertions

  def database_helpers
    PostgresHelpers
  end

  def test_it_uses_the_right_config
    assert_equal "postgresql", active_record_config[:adapter]
  end

  def quote_char
    '"'
  end
end

class GraphQLProRelationConnectionFilterMySqlTest < Minitest::Test
  include FilterAssertions

  def database_helpers
    MysqlHelpers
  end

  def test_it_uses_the_right_config
    assert_equal "mysql2", active_record_config[:adapter]
  end

  def quote_char
    '`'
  end

  def stringify_mysql(value)
    "'#{value}'"
  end
end
