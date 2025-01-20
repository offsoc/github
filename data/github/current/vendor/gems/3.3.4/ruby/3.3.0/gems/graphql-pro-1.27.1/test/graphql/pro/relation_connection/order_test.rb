# frozen_string_literal: true
require "test_helper"

if MODERN_RAILS
  class GraphQLProRelationConnectionOrderTest < Minitest::Test
    include ConnectionHelpers

    def create_orders(relation)
      relation.to_a # assert that it's a valid ordering
      ordered_rel, orders = GraphQL::Pro::RelationConnection::Order.normalize(relation)
      ordered_rel.to_a # make sure this one is valid, too
      orders
    end

    def assert_orders(relation, expected, including: [])
      orders = create_orders(relation)
      plain_orders = orders.map { |m| [m.table_name, m.name, m.dir] + including.map { |meth| m.public_send(meth) } }
      assert_equal(expected, plain_orders)
    end

    def test_it_defaults_to_primary_key
      assert_orders(Expansion.all, [["expansions", "id", :asc]])

      # Seems like reverse_order was not supported well in 4.1
      if ActiveRecord.version.to_s < "4.2"
        expected_orders = [["expansions", "id", :asc]]
      else
        expected_orders = [["expansions", "id", :desc]]
      end
      assert_orders(Expansion.all.reverse_order, expected_orders)
    end

    def setup
      PostgresHelpers.setup_database_once
      SqliteHelpers.setup_database_once
    end

    def test_it_handles_nil_primary_key_for_materialized_views
      relation = Expansion.all
      def relation.primary_key
        nil
      end

      assert_raises(GraphQL::Pro::RelationConnection::InvalidRelationError) do
        assert_orders(relation, [])
      end

      relation = relation.order("name")
      def relation.primary_key
        nil
      end

      assert_orders(relation, [[false, "name", :asc]])
    end

    def test_it_handles_asc_and_desc
      assert_orders(Expansion.order("name"), [[false, "name", :asc], ["expansions", "id", :asc]])

      assert_orders(Expansion.order("name ASC"), [[false, "name", :asc], ["expansions", "id", :asc]])

      assert_orders(Expansion.order(name: :desc), [["expansions", "name", :desc], ["expansions", "id", :asc]])

      assert_orders(Expansion.order("name DESC"), [[false, "name", :desc], ["expansions", "id", :asc]])

      assert_orders(Expansion.order(name: :desc, id: :asc), [["expansions", "name", :desc], ["expansions", "id", :asc]])
    end

    def test_it_infers_table_name
      missing_pk_order = ["cards", "mana_cost", :asc]
      assert_orders(Card.joins(:expansions).order("expansions.name"), [["expansions", "name", :asc], missing_pk_order])
      assert_orders(Card.joins(:expansions).order(Arel.sql("expansions.name DESC")), [["expansions", "name", :desc], missing_pk_order])
    end

    def test_it_infers_from_case
      missing_pk_orders = [["cards", "name", :asc], ["cards", "mana_cost", :asc]]
      rel = Card.order(Arel.sql("CASE WHEN 1 THEN 100 ELSE 99 END"))
      assert_orders(rel, [[false, "CASE WHEN 1 THEN 100 ELSE 99 END", :asc], *missing_pk_orders])
      assert_orders(Card.order(Arel.sql("
        CASE
        WHEN 1 THEN 100
        ELSE 99
        END DESC
      ")), [[false, "CASE
        WHEN 1 THEN 100
        ELSE 99
        END", :desc], *missing_pk_orders])
      assert_orders(Card.order(Arel.sql("case when 1 then 100 else 99 end asc")), [[false, "case when 1 then 100 else 99 end", :asc], *missing_pk_orders])
    end

    def test_it_handles_comma_separated_sorts
      rel = Expansion.order("name asc, sym desc")
      expected_orders = [
        [false, "name", :asc],
        [false, "sym", :desc],
        ["expansions", "id", :asc],
      ]
      assert_orders(rel, expected_orders)
    end

    def test_it_handles_arel_nulls_first_and_last
      order1 = Expansion.arel_table[:name].asc.nulls_first
      order2 = Expansion.arel_table[:sym].desc.nulls_last
      rel = Expansion.order(order1, order2)
      orders = create_orders(rel)
      assert_equal [false, true, nil], orders.map(&:nulls_last)


      rel = Expansion.order(Arel.sql("LENGTH(name)").asc.nulls_first)
      orders = create_orders(rel)
      assert_equal [false, nil], orders.map(&:nulls_last)
    end

    def test_it_handles_null_first_and_last
      rel = Expansion.order(Arel.sql("name asc NULLS FIRST, sym desc nulls last"))
      orders = create_orders(rel)
      assert_equal [false, true, nil], orders.map(&:nulls_last)

      rel = Expansion.order(Arel.sql("LENGTH(name) NULLS FIRST"))
      orders = create_orders(rel)
      assert_equal [false, nil], orders.map(&:nulls_last)
    end

    def test_it_does_is_not_null
      rel = Expansion.order(Arel.sql("name IS NOT NULL DESC, name ASC"))
      expected_orders = [
        [false, "name", :desc, true],
        [false, "name", :asc, false],
        ["expansions", "id", :asc, false]
      ]
      assert_orders(rel, expected_orders, including: [:is_not_null])
    end

    def test_it_does_something_with_complex_sorts
      if ActiveRecord.version.to_s < "4.2"
        expected_orders = [[false, "LENGTH(name)", :asc], ["expansions", "id", :asc]]
      else
        expected_orders = [[false, "LENGTH(name)", :desc], ["expansions", "id", :asc]]
      end
      assert_orders(Expansion.order(Arel.sql("LENGTH(name)")).reverse_order, expected_orders)
    end

    def test_it_handles_least_functions
      PostgresHelpers.with_connection do
        # This requires `postgis`
        query = <<-SQL
        LEAST(
          ST_Distance(ST_GeographyFromText('POINT (-96.709345 40.814435)'), ST_GeographyFromText('POINT (-96.709345 40.814435)')),
          ST_Distance(ST_GeographyFromText('POINT (-96.709345 40.814435)'), ST_GeographyFromText('POINT (-96.709345 40.814435)'))
        )
        SQL
        rel = Expansion.order(Arel.sql(query))

        expected_orders = [
          [false, query.strip, :asc],
          ["expansions", "id", :asc],
        ]
        assert_orders rel, expected_orders
      end
    end

    def test_it_handles_custom_functions
      PostgresHelpers.with_connection do
        # This requires the function to be defined
        query = <<-SQL
          public.find_in_array(expansions.id, '{"24", "22", "14", "19", "21", "23", "20", "17", "9", "7", "1", "3", "18", "8", "12", "15", "6", "5", "16", "11", "13", "10", "2", "4"}')
        SQL

        rel = Expansion.order(Arel.sql(query))

        expected_orders = [
          [false, query.strip, :asc],
          ["expansions", "id", :asc],
        ]
        assert_orders rel, expected_orders
      end
    end

    def test_it_handles_this_tough_query
      PostgresHelpers.with_connection do
        rel = Card.select(Arel.sql("cards.*, max(printings.created_at) date_created"))
          .joins(Arel.sql("INNER JOIN printings on cards.name = printings.card_name"))
            .group('cards.id')
            .order(Arel.sql('max(printings.created_at) DESC NULLS LAST'))

        ordered_rel, orders = GraphQL::Pro::RelationConnection::Order.normalize(rel)
        assert_equal 1, orders.size
        assert_equal false, orders.first.table_name
        assert_equal :desc, orders.first.dir
        assert_equal "max(printings.created_at)", orders.first.name
        # Make sure it runs properly:
        assert_equal [], ordered_rel.to_a
      end
    end

    def test_it_handles_postgres_json_access_with_cast
      PostgresHelpers.with_connection do
        rel = Card.select("*, (metadata ->> 'author_name') as author_name")
          .order("author_name")

        ordered_rel, orders = GraphQL::Pro::RelationConnection::Order.normalize(rel)
        assert_equal [], ordered_rel.to_a

        assert_equal 3, orders.size
        assert_equal false, orders.first.table_name
        assert_equal :asc, orders.first.dir
        assert_equal "author_name", orders.first.name
      end
    end

    def test_it_handles_arel_literal_sql_orders
      relation = Expansion.order(Arel.sql("COALESCE(id, 0) - id").desc)
      assert_orders(relation, [[false, "COALESCE(id, 0) - id", :desc], ["expansions", "id", :asc]])
    end

    def test_it_handles_arel_attributes
      relation = Expansion.joins(:printings).order(Printing.arel_table[:card_name], :sym)
      assert_orders(relation, [["printings", "card_name", :asc], ["expansions", "sym", :asc], ["expansions", "id", :asc]])
    end

    def test_it_handles_arel_sql_literals
      relation = Expansion.order(Arel::Nodes::SqlLiteral.new("\"expansions\".\"sym\""))
      assert_orders(relation, [["expansions", "sym", :asc], ["expansions", "id", :asc]])
    end

    def test_it_raises_on_unrecognized_orders
      relation = Expansion.order(1)
      err = assert_raises GraphQL::Pro::RelationConnection::InvalidRelationError do
        assert_orders(relation, :unreached)
      end

      assert_includes err.message, "Relation SQL:"
    end

    def test_it_handles_arel_infix_operations
      arel_expression = Arel::Nodes::InfixOperation.new(
        '||',
        Arel::Nodes::InfixOperation.new(
          '||',
          Arel::Nodes::NamedFunction.new('trim', [Expansion.arel_table[:sym]]),
          Arel::Nodes::SqlLiteral.new("' '")
        ),
        Arel::Nodes::NamedFunction.new('trim', [Expansion.arel_table[:name]])
      )

      relation = Expansion.order(arel_expression.desc)

      expected_orders = [
        [false, "trim(\"expansions\".\"sym\") || ' ' || trim(\"expansions\".\"name\")", :desc],
        ["expansions", "id", :asc],
      ]

      assert_orders(relation, expected_orders)
    end

    def test_it_handles_grouped_relations
      rel = Card.group("rarity").select("sum(length(name)) as letter_count").order("letter_count")
      expected_orders = [
        [false, "letter_count", :asc]
      ]
      assert_orders(rel, expected_orders)
    end
  end
end
