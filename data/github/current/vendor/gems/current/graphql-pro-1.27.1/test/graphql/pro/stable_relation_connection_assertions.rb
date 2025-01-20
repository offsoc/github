# frozen_string_literal: true
require "test_helper"

if defined?(GraphQL::Pagination)
  module StableRelationConnectionAssertions
    class ExampleSchema < GraphQL::Schema
      class Cuisine < GraphQL::Schema::Enum
        value :CHINESE, value: "chinese"
        value :DINER, value: "diner"
        value :NEW_AMERICAN, value: "new_american"
      end

      class Neighborhood < GraphQL::Schema::Object
        field :name, String, null: false
      end

      class Restaurant < GraphQL::Schema::Object
        field :id, Int, null: false
        field :name, String, null: false
        field :cuisine, Cuisine, null: false
        field :price_range, Int, null: false
        field :billiards_tables_count, Int, null: true
        field :opened_at, GraphQL::Types::ISO8601DateTime, null: false
        field :neighborhood, Neighborhood, null: false
      end

      class RestaurantConnectionWithTotalCount < GraphQL::Types::Relay::BaseConnection
        edge_type(Restaurant.edge_type)
        field :total_count, Integer, null: false

        def total_count
          object.items.unscoped.count
        end
      end

      class Direction < GraphQL::Schema::Enum
        value "NORTH", value: "north"
        value "SOUTH", value: "south"
        value "EAST", value: "east"
        value "WEST", value: "west"
        value "CENTER", value: "center"
      end

      class Neighborhood < GraphQL::Schema::Object
        field :direction, Direction, null: false
        field :restaurants, Restaurant.connection_type, null: false
      end

      class RestaurantOrderField < GraphQL::Schema::Enum
        value "ID", value: "id"
        value "NAME", value: "name"
        value "CUISINE", value: "cuisine"
        value "PRICE_RANGE", value: "price_range"
        value "OPENED_AT", value: "opened_at"
        value "BILLIARDS_TABLES_COUNT", value: "billiards_tables_count"
        value "BILLIARDS_TABLES_COUNT_NULLS_FIRST", value: "billiards_tables_count_nulls_first"
        value "BILLIARDS_TABLES_COUNT_NULLS_LAST", value: "billiards_tables_count_nulls_last"
        value "NEIGHBORHOOD", value: "neighborhood"
        value "NEIGHBORHOOD_THEN_NAME", value: "neighborhood_then_name"
        value "RESTAURANT_ARRAY", value: "restaurant_array"
        value "BILLIARDS_TABLES_IS_NOT_NULL", value: "billiards_tables_is_not_null"
      end

      class RestaurantOrderDirection < GraphQL::Schema::Enum
        value "ASC", value: :asc
        value "DESC", value: :desc
      end

      class RestaurantOrder < GraphQL::Schema::InputObject
        argument :by, RestaurantOrderField, required: true
        argument :dir, RestaurantOrderDirection, required: true
      end

      class CuisineStat < GraphQL::Schema::Object
        field :name, String, null: false, method: :cuisine_name
        field :average_price_range, Float, null: false
      end

      class Query < GraphQL::Schema::Object
        field :restaurants, RestaurantConnectionWithTotalCount, connection: true, null: false do
          argument :order, [RestaurantOrder], required: false
        end

        def restaurants(order: nil)
          relation = StableRelationConnectionAssertions::Restaurant.all
          Array(order).each do |o|
            relation = case o[:by]
            when "neighborhood"
              relation.joins(:neighborhood).order("neighborhoods.name" => o[:dir])
            when "billiards_tables_count_nulls_first"
              relation.order(Arel.sql("billiards_tables_count #{o[:dir]} NULLS FIRST"))
            when "billiards_tables_count_nulls_last"
              relation.order(Arel.sql("billiards_tables_count #{o[:dir]} NULLS LAST"))
            when "neighborhood_then_name"
              arel_expression = Arel::Nodes::InfixOperation.new(
                '||',
                Arel::Nodes::InfixOperation.new(
                  '||',
                  Arel::Nodes::NamedFunction.new('trim', [StableRelationConnectionAssertions::Neighborhood.arel_table[:name]]),
                  Arel::Nodes::SqlLiteral.new("' '")
                ),
                Arel::Nodes::NamedFunction.new('trim', [StableRelationConnectionAssertions::Restaurant.arel_table[:name]]),
              )
              arel_expression = o[:dir] == :desc ? arel_expression.desc : arel_expression.asc
              relation.joins(:neighborhood).order(arel_expression)
            when "restaurant_array"
              relation.order(Arel.sql("ARRAY[restaurants.cuisine, restaurants.name] #{o[:dir]}"))
            when "billiards_tables_is_not_null"
              inverse_dir = o.dir == :desc ? "ASC" : "DESC"
              relation.order(Arel.sql("billiards_tables_count IS NOT NULL #{inverse_dir}, billiards_tables_count #{o.dir}"))
            else
              relation.order(o[:by] => o[:dir])
            end
          end
          relation
        end

        field :restaurants_max_page_size, RestaurantConnectionWithTotalCount, connection: true, max_page_size: 2, null: false, resolver_method: :restaurants do
          argument :order, [RestaurantOrder], required: false
        end

        field :restaurants_by_particular_preference, Restaurant.connection_type, null: false

        def restaurants_by_particular_preference
          relation = StableRelationConnectionAssertions::Restaurant.all
          relation.order(Arel.sql(<<-SQL)).order("name asc")
            CASE
            WHEN cuisine = 'diner' THEN 1
            WHEN cuisine = 'new_american' THEN 2
            WHEN cuisine = 'chinese' THEN 3
            ELSE 0
            END DESC
          SQL
        end

        field :first_restaurants, Restaurant.connection_type

        def first_restaurants
          rel = StableRelationConnectionAssertions::Restaurant.all
          rel = rel.joins("INNER JOIN(#{rel.select(:id).limit(3).to_sql}) as subquery on subquery.id = #{rel.klass.table_name}.id")
          rel
        end

        field :cuisine_stats, CuisineStat.connection_type, null: false do
          argument :order, String, required: false
        end

        def cuisine_stats(order: nil)
          relation = StableRelationConnectionAssertions::Restaurant.all
          relation = relation
            .group("cuisine")
            .select("cuisine as cuisine_name, avg(price_range) as average_price_range")

          if order
            # IRL this is SQL injection -- but this is just a test!
            relation = relation.order(order)
          end

          relation
        end

        field :neighborhood, Neighborhood, null: true do
          argument :name, String, required: true
        end

        def neighborhood(name:)
          StableRelationConnectionAssertions::Neighborhood.where(name: name).first
        end
      end

      class AddRestaurant < GraphQL::Schema::RelayClassicMutation
        field :neighborhood, Neighborhood, null: false
        field :new_restaurant_edge, Restaurant.edge_type, null: false

        argument :name, String, required: true
        argument :cuisine, Cuisine, required: true
        argument :price_range, Int, required: true
        argument :neighborhood, String, required: true

        def resolve(neighborhood:, **restaurant_attrs)
          neighborhood = StableRelationConnectionAssertions::Neighborhood.where(name: neighborhood).first
          restaurants = neighborhood.restaurants
          new_restaurant = restaurants.create!(restaurant_attrs)
          if GraphQL::VERSION > "1.12.4"
            range_add = GraphQL::Relay::RangeAdd.new(
              parent: neighborhood,
              collection: restaurants,
              item: new_restaurant,
              context: context,
            )

            {
              neighborhood: neighborhood,
              new_restaurant_edge: range_add.edge,
            }
          else
            new_restaurant_relation = neighborhood.restaurants.where(id: new_restaurant.id)
            conn_class = context.schema.connections.wrapper_for(new_restaurant_relation)
            example_connection = conn_class.new(new_restaurant_relation, parent: neighborhood, context: context)
            new_restaurant_edge = example_connection.edge_class.new(example_connection.items.first, example_connection)
            {
              neighborhood: neighborhood,
              new_restaurant_edge: new_restaurant_edge,
            }
          end
        end
      end

      class Mutation < GraphQL::Schema::Object
        field :add_restaurant, mutation: AddRestaurant
      end

      query(Query)
      mutation(Mutation)
    end

    NEIGHBORHOODS = [
      { name: "29 North", direction: "north" },
      { name: "Downtown Mall", direction: "center" },
      { name: "Barracks Road", direction: "west" },
    ]

    RESTAURANTS = [
      # `Sam's Kitchen` is before `The Villa` by name and by ID, but not by `opened_at`
      { name: "Sam's Kitchen", cuisine: "diner", neighborhood_idx: 0, price_range: 2, billiards_tables_count: nil, opened_at: DateTime.parse("2005-01-01 09:00:00.00002") },
      { name: "Peter Chang's", cuisine: "chinese", neighborhood_idx: 2, price_range: 3, billiards_tables_count: nil, opened_at: DateTime.parse("2010-01-01 09:00:00.00000") },
      { name: "Taste of China", cuisine: "chinese", neighborhood_idx: 0, price_range: 2, billiards_tables_count: nil, opened_at: DateTime.parse("2011-01-01 09:00:00.00000") },
      { name: "Rapture", cuisine: "new_american", neighborhood_idx: 1, price_range: 4, billiards_tables_count: 6, opened_at: DateTime.parse("1998-01-01 09:00:00.00000") },
      { name: "The Villa", cuisine: "diner", neighborhood_idx: 2, price_range: 2, billiards_tables_count: 0, opened_at: DateTime.parse("2005-01-01 09:00:00.00001") },
    ]

    RESTAURANT_NAMES_BY_ID = RESTAURANTS.map { |r| r[:name] }

    class Restaurant < ActiveRecord::Base
      self.primary_key = :id
      belongs_to :neighborhood, foreign_key: [:neighborhood_name, :neighborhood_direction]
    end

    class Neighborhood < ActiveRecord::Base
      self.primary_keys = [:name, :direction]
      has_many :restaurants, foreign_key: [:neighborhood_name, :neighborhood_direction]
    end

    def define_active_record_schema
      ActiveRecord::Schema.define do
        self.verbose = false
        create_table :restaurants, primary_key: :id do |t|
          t.column :name, :string
          t.column :cuisine, :string
          t.column :neighborhood_name, :string
          t.column :neighborhood_direction, :string
          t.column :price_range, :integer
          t.column :opened_at, :datetime, precision: 6
          t.column :billiards_tables_count, :integer
          t.timestamps
        end

        create_table :neighborhoods, primary_key: :id do |t|
          t.column :name, :string
          t.column :direction, :string
          t.timestamps
        end
      end
      created_neighborhoods = NEIGHBORHOODS.map { |n| Neighborhood.create!(n) }
      RESTAURANTS.each { |r|
        r2 = r.merge(neighborhood: created_neighborhoods[r[:neighborhood_idx]])
        r2.delete(:neighborhood_idx)
        Restaurant.create!(r2)
      }
    end

    def exec_query(*args, **kwargs)
      ExampleSchema.execute(*args, **kwargs)
    end

    RESTAURANTS_QUERY = <<-GRAPHQL
    query($first: Int, $after: String, $last: Int, $before: String, $order: [RestaurantOrder!]) {
      restaurants(first: $first, after: $after, last: $last, before: $before, order: $order) {
        nodes { id name priceRange }
        pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
      }
    }
    GRAPHQL

    REVERSED_RESTAURANTS_QUERY = <<-GRAPHQL
    query($first: Int, $after: String, $last: Int, $before: String, $order: [RestaurantOrder!]) {
      restaurants(first: $first, after: $after, last: $last, before: $before, order: $order) {
        pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
        nodes { id name priceRange }
      }
    }
    GRAPHQL

    def self.included(child_class)
      child_class.extend(ClassMethods)
    end

    module ClassMethods
      attr_accessor :setup_database_once, :own_ar_config, :surrounding_ar_config
    end

    def ar_connection(config)
      ActiveRecord::Base.establish_connection(config)
    end

    def setup
      # Try to run this setup once per suite, to keep things running fast.
      if !self.class.setup_database_once
        # Other tests use a different database connection; store that configuration
        # so that when this suite is done, we can reconnect to that database.
        self.class.surrounding_ar_config = active_record_config
        prepare_database_once
        self.class.own_ar_config = active_record_config
        define_active_record_schema
        self.class.setup_database_once = true
      else
        ActiveRecord::Base.establish_connection(self.class.own_ar_config)
      end
    end

    def teardown
      # Reconnect to the database used by the rest of the tests.
      ActiveRecord::Base.establish_connection(self.class.surrounding_ar_config)
    end

    def test_it_paginates_forwards_and_backwards_by_id
      run_query_and_assert_id_order(RESTAURANTS_QUERY)
    end

    def test_it_paginates_forwards_and_backwards_by_id_when_page_info_is_first
      run_query_and_assert_id_order(REVERSED_RESTAURANTS_QUERY)
    end

    def run_query_and_assert_id_order(query_str)
      ## FORWARD PAGINATION
      # Check first page
      res = exec_query(query_str, variables: { first: 3 })
      conn = res["data"]["restaurants"]
      assert_equal RESTAURANT_NAMES_BY_ID.first(3), conn["nodes"].map { |r| r["name"] }
      assert_equal true, conn["pageInfo"]["hasNextPage"]
      assert_equal false, conn["pageInfo"]["hasPreviousPage"]
      last_cursor = conn["pageInfo"]["endCursor"]

      # Check last page with overflow
      res = exec_query(query_str, variables: { first: 3, after: last_cursor })
      conn = res["data"]["restaurants"]
      assert_equal RESTAURANT_NAMES_BY_ID.last(2), conn["nodes"].map { |r| r["name"] }
      assert_equal false, conn["pageInfo"]["hasNextPage"]
      assert_equal true, conn["pageInfo"]["hasPreviousPage"]


      # Check last page at pagination boundary
      res = exec_query(query_str, variables: { first: 2, after: last_cursor })
      conn = res["data"]["restaurants"]
      assert_equal RESTAURANT_NAMES_BY_ID.last(2), conn["nodes"].map { |r| r["name"] }
      assert_equal false, conn["pageInfo"]["hasNextPage"]
      assert_equal true, conn["pageInfo"]["hasPreviousPage"]

      # Check middle page
      res = exec_query(query_str, variables: { first: 1, after: last_cursor })
      conn = res["data"]["restaurants"]
      assert_equal [RESTAURANT_NAMES_BY_ID[3]], conn["nodes"].map { |r| r["name"] }
      assert_equal true, conn["pageInfo"]["hasNextPage"]
      assert_equal true, conn["pageInfo"]["hasPreviousPage"]

      # Select all
      res = exec_query(query_str, variables: { first: 10 })
      conn = res["data"]["restaurants"]
      assert_equal RESTAURANT_NAMES_BY_ID, conn["nodes"].map { |r| r["name"] }
      assert_equal false, conn["pageInfo"]["hasNextPage"]
      assert_equal false, conn["pageInfo"]["hasPreviousPage"]

      ## BACKWARD PAGINATION
      # First page
      res = exec_query(query_str, variables: { last: 2 })
      conn = res["data"]["restaurants"]
      assert_equal RESTAURANT_NAMES_BY_ID.last(2), conn["nodes"].map { |r| r["name"] }
      assert_equal false, conn["pageInfo"]["hasNextPage"]
      assert_equal true, conn["pageInfo"]["hasPreviousPage"]
      first_cursor = conn["pageInfo"]["startCursor"]

      # Middle page
      res = exec_query(query_str, variables: { last: 2, before: first_cursor })
      conn = res["data"]["restaurants"]
      assert_equal RESTAURANT_NAMES_BY_ID[1, 2], conn["nodes"].map { |r| r["name"] }
      assert_equal true, conn["pageInfo"]["hasNextPage"]
      assert_equal true, conn["pageInfo"]["hasPreviousPage"]
      first_cursor = conn["pageInfo"]["startCursor"]

      # Last page with overflow
      res = exec_query(query_str, variables: { last: 2, before: first_cursor })
      conn = res["data"]["restaurants"]
      assert_equal RESTAURANT_NAMES_BY_ID[0, 1], conn["nodes"].map { |r| r["name"] }
      assert_equal true, conn["pageInfo"]["hasNextPage"]
      assert_equal false, conn["pageInfo"]["hasPreviousPage"]

      # Last page to boundary
      res = exec_query(query_str, variables: { last: 1, before: first_cursor })
      conn = res["data"]["restaurants"]
      assert_equal RESTAURANT_NAMES_BY_ID[0, 1], conn["nodes"].map { |r| r["name"] }
      assert_equal true, conn["pageInfo"]["hasNextPage"]
      assert_equal false, conn["pageInfo"]["hasPreviousPage"]

      # Select all
      res = exec_query(query_str, variables: { last: 10 })
      conn = res["data"]["restaurants"]
      assert_equal RESTAURANT_NAMES_BY_ID, conn["nodes"].map { |r| r["name"] }
      assert_equal false, conn["pageInfo"]["hasNextPage"]
      assert_equal false, conn["pageInfo"]["hasPreviousPage"]

      ## NO PAGINATION
      res = exec_query(query_str)
      conn = res["data"]["restaurants"]
      assert_equal RESTAURANT_NAMES_BY_ID, conn["nodes"].map { |r| r["name"] }
    end

    def test_it_ignores_blank_cursors
      query_str = RESTAURANTS_QUERY
      res = exec_query(query_str, variables: { first: 3, after: "" })
      conn = res["data"]["restaurants"]
      assert_equal RESTAURANT_NAMES_BY_ID.first(3), conn["nodes"].map { |r| r["name"] }
    end

    NULLABLE_SORT_QUERY_STR = <<-GRAPHQL
      query(
          $first: Int,
          $after: String,
          $last: Int,
          $before: String,
          $by: RestaurantOrderField!,
          $dir: RestaurantOrderDirection!,
        ) {
        restaurants(first: $first, after: $after, last: $last, before: $before, order: {by: $by, dir: $dir}) {
          nodes {
            name
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    GRAPHQL

    # These expectation constants are overriden by Postgres tests,
    # since postgres orders `null` differently.
    NAMES_BY_BILLIARD_TABLES_ASC = NAMES_BY_BILLIARD_TABLES_ASC_NULLS_FIRST = [
      "Sam's Kitchen",    # => null
      "Peter Chang's",    # => null
      "Taste of China",   # => null
      "The Villa",        # => 0
      "Rapture",          # => 6
    ]

    NAMES_BY_BILLIARD_TABLES_ASC_NULLS_LAST = [
      "The Villa",        # => 0
      "Rapture",          # => 6
      "Sam's Kitchen",    # => null
      "Peter Chang's",    # => null
      "Taste of China",   # => null
    ]

    NAMES_BY_BILLIARD_TABLES_DESC = NAMES_BY_BILLIARD_TABLES_DESC_NULLS_LAST = [
      "Rapture",          # => 6
      "The Villa",        # => 0
      "Sam's Kitchen",    # => null
      "Peter Chang's",    # => null
      "Taste of China",   # => null
    ]

    NAMES_BY_BILLIARD_TABLES_DESC_NULLS_FIRST = [
      "Sam's Kitchen",    # => null
      "Peter Chang's",    # => null
      "Taste of China",   # => null
      "Rapture",          # => 6
      "The Villa",        # => 0
    ]

    def test_it_paginates_by_field_with_null_implicitly_ascending
      expected_names = self.class::NAMES_BY_BILLIARD_TABLES_ASC

      # Implicit null handling, forward pagination
      last_cursor = paginate_forwards(expected_names)

      # Implicit null handling, backward pagination
      paginate_backwards(expected_names, last_cursor)
    end

    def test_it_paginates_by_field_with_null_implicitly_descending
      # The ones _with_ a value change order, and come to the top.
      # The ones with null move to the bottom, but keep their order
      # because of the library-added sort by `id ASC`.
      expected_names = self.class::NAMES_BY_BILLIARD_TABLES_DESC
      # Implicit null handling, reverse sort
      last_cursor = paginate_forwards(expected_names, dir: "DESC")

      # Implicit null handling, reverse sort, backward pagination
      paginate_backwards(expected_names, last_cursor, dir: "DESC")
    end

    def test_it_paginates_by_field_with_null_explicitly_first
      expected_names = self.class::NAMES_BY_BILLIARD_TABLES_ASC_NULLS_FIRST
      last_cursor = paginate_forwards(expected_names, by: "BILLIARDS_TABLES_COUNT_NULLS_FIRST")
      # TODO ActiveRecord doesn't support `reverse_order` for NULLS (FIRST|LAST)
      assert_raises ActiveRecord::IrreversibleOrderError do
        paginate_backwards(expected_names, last_cursor, by: "BILLIARDS_TABLES_COUNT_NULLS_FIRST")
      end

      expected_names = self.class::NAMES_BY_BILLIARD_TABLES_DESC_NULLS_FIRST
      last_cursor = paginate_forwards(expected_names, by: "BILLIARDS_TABLES_COUNT_NULLS_FIRST", dir: "DESC")
      # TODO ActiveRecord doesn't support `reverse_order` for NULLS (FIRST|LAST)
      assert_raises ActiveRecord::IrreversibleOrderError do
        paginate_backwards(expected_names, last_cursor, by: "BILLIARDS_TABLES_COUNT_NULLS_FIRST")
      end
    end

    def database_quote
      '"' # overridden for mysql
    end

    def test_it_quotes_names
      log = StringIO.new
      _res = with_sql_log(io: log) do
        exec_query(RESTAURANTS_QUERY, variables: { first: 3 })
      end
      q = database_quote
      assert_includes log.string, "#{q}restaurants#{q}.*, #{q}restaurants#{q}.#{q}id#{q} AS cursor_0 FROM #{q}restaurants#{q} ORDER BY #{q}restaurants#{q}.#{q}id#{q} asc"
    end

    def test_it_paginates_by_field_with_null_explicitly_last
      expected_names = self.class::NAMES_BY_BILLIARD_TABLES_ASC_NULLS_LAST

      last_cursor = paginate_forwards(expected_names, by: "BILLIARDS_TABLES_COUNT_NULLS_LAST")
      # TODO ActiveRecord doesn't support `reverse_order` for NULLS (FIRST|LAST)
      assert_raises ActiveRecord::IrreversibleOrderError do
        paginate_backwards(expected_names, last_cursor, by: "BILLIARDS_TABLES_COUNT_NULLS_LAST")
      end

      expected_names = self.class::NAMES_BY_BILLIARD_TABLES_DESC_NULLS_LAST
      last_cursor = paginate_forwards(expected_names, by: "BILLIARDS_TABLES_COUNT_NULLS_LAST", dir: "DESC")
      # TODO ActiveRecord doesn't support `reverse_order` for NULLS (FIRST|LAST)
      assert_raises ActiveRecord::IrreversibleOrderError do
        paginate_backwards(expected_names, last_cursor, by: "BILLIARDS_TABLES_COUNT_NULLS_LAST")
      end
    end

    def test_it_paginates_with_is_not_null
      expected_names = self.class::NAMES_BY_BILLIARD_TABLES_ASC_NULLS_LAST
      last_cursor = paginate_forwards(expected_names, by: "BILLIARDS_TABLES_IS_NOT_NULL")
      paginate_backwards(expected_names, last_cursor, by: "BILLIARDS_TABLES_IS_NOT_NULL")

      expected_names = self.class::NAMES_BY_BILLIARD_TABLES_DESC_NULLS_FIRST
      last_cursor = paginate_forwards(expected_names, by: "BILLIARDS_TABLES_IS_NOT_NULL", dir: "DESC")
      paginate_backwards(expected_names, last_cursor, by: "BILLIARDS_TABLES_IS_NOT_NULL", dir: "DESC")
    end

    def paginate_forwards(expected_names, by: "BILLIARDS_TABLES_COUNT", dir: "ASC")
      query_str = NULLABLE_SORT_QUERY_STR
      # Load items 2 at a time and make sure they match expected_names
      res = exec_query(query_str, variables: { first: 2, by: by, dir: dir })
      conn = res["data"]["restaurants"]
      assert_equal expected_names.first(2), conn["nodes"].map { |n| n["name"] }
      last_cursor = conn["pageInfo"]["endCursor"]

      res = exec_query(query_str, variables: { first: 2, after: last_cursor, by: by, dir: dir })
      conn = res["data"]["restaurants"]
      assert_equal expected_names[2,2], conn["nodes"].map { |n| n["name"] }
      last_cursor = conn["pageInfo"]["endCursor"]

      res = exec_query(query_str, variables: { first: 2, after: last_cursor, by: by, dir: dir })
      conn = res["data"]["restaurants"]
      assert_equal expected_names.last(1), conn["nodes"].map { |n| n["name"] }
      last_cursor
    end

    def paginate_backwards(expected_names, last_cursor, by: "BILLIARDS_TABLES_COUNT", dir: "ASC")
      query_str = NULLABLE_SORT_QUERY_STR
      res = exec_query(query_str, variables: { last: 2, before: last_cursor, by: by, dir: dir })
      conn = res["data"]["restaurants"]
      assert_equal expected_names[1,2], conn["nodes"].map { |n| n["name"] }
      first_cursor = conn["pageInfo"]["startCursor"]

      res = exec_query(query_str, variables: { last: 2, before: first_cursor, by: by, dir: dir })
      conn = res["data"]["restaurants"]
      assert_equal expected_names[0,1], conn["nodes"].map { |n| n["name"] }
    end

    def test_it_paginates_by_millisecond
      query_str = RESTAURANTS_QUERY
      expected_names = [
        "Rapture",
        "The Villa",     # <= here's where they'd be ordered differently if ms was ignored
        "Sam's Kitchen",
        "Peter Chang's",
        "Taste of China"
      ]
      res = exec_query(query_str, variables: { first: 2, order: [{ by: "OPENED_AT", dir: "ASC" }, { by: "NAME", dir: "ASC" }]})
      names = res["data"]["restaurants"]["nodes"].map { |r| r["name"] }
      last_cursor = res["data"]["restaurants"]["pageInfo"]["endCursor"]
      assert_equal expected_names.first(2), names

      res = exec_query(query_str, variables: { first: 2, after: last_cursor, order: [{ by: "OPENED_AT", dir: "ASC" }, { by: "NAME", dir: "ASC" }]})
      names = res["data"]["restaurants"]["nodes"].map { |r| r["name"] }
      assert_equal expected_names[2, 2], names


      res = exec_query(query_str, variables: { first: 5, order: [{ by: "OPENED_AT", dir: "ASC" }, { by: "NAME", dir: "ASC" }]})
      names = res["data"]["restaurants"]["nodes"].map { |r| r["name"] }
      assert_equal expected_names, names
    end

    def test_it_works_with_total_count
      query_str = <<-GRAPHQL
      query($first: Int!, $after: String) {
        restaurants(first: $first, after: $after, order: [{by: CUISINE, dir: DESC}, {by: PRICE_RANGE, dir: ASC}]) {
          nodes {
            name
          }
          pageInfo {
            endCursor
          }
          totalCount
        }
      }
      GRAPHQL

      expected_names = [
        "Rapture",
        "Sam's Kitchen",
        "The Villa",
        "Taste of China",
        "Peter Chang's",
      ]

      res = exec_query(query_str, variables: { first: 2 })
      conn = res["data"]["restaurants"]
      assert_equal expected_names.first(2), conn["nodes"].map { |n| n["name"] }
      assert_equal 5, conn["totalCount"]
      last_cursor = conn["pageInfo"]["endCursor"]

      res = exec_query(query_str, variables: { first: 2, after: last_cursor })
      conn = res["data"]["restaurants"]
      assert_equal expected_names[2,2], conn["nodes"].map { |n| n["name"] }
      assert_equal 5, conn["totalCount"]
      last_cursor = conn["pageInfo"]["endCursor"]

      res = exec_query(query_str, variables: { first: 2, after: last_cursor })
      conn = res["data"]["restaurants"]
      assert_equal expected_names.last(1), conn["nodes"].map { |n| n["name"] }
      assert_equal 5, conn["totalCount"]
    end

    def test_it_paginates_duplicate_cursor_values_by_using_id
      res = exec_query(RESTAURANTS_QUERY, variables: {first: 2, order: [{by: "PRICE_RANGE", dir: "ASC"}]})
      expected_names = [
        "Sam's Kitchen",
        "Taste of China",
        "The Villa",
        "Peter Chang's",
        "Rapture"
      ]
      names = res["data"]["restaurants"]["nodes"].map { |n| n["name"] }
      assert_equal expected_names.first(2), names
      last_cursor = res["data"]["restaurants"]["pageInfo"]["endCursor"]

      res = exec_query(RESTAURANTS_QUERY, variables: {first: 3, after: last_cursor, order: [{by: "PRICE_RANGE", dir: "ASC"}]})
      names = res["data"]["restaurants"]["nodes"].map { |n| n["name"] }
      assert_equal expected_names.last(3), names
    end

    def test_it_applies_max_page_size
      query_str = <<-GRAPHQL
      query($first: Int, $after: String, $last: Int, $before: String) {
        restaurantsMaxPageSize(first: $first, after: $after, last: $last, before: $before) {
          nodes {
            name
          }
          totalCount
          pageInfo {
            startCursor
            endCursor
          }
        }
      }
      GRAPHQL

      # Test with neither first nor last
      res = exec_query(query_str)
      assert_equal RESTAURANT_NAMES_BY_ID.first(2), res["data"]["restaurantsMaxPageSize"]["nodes"].map { |n| n["name"] }

      res = exec_query(query_str, variables: { first: 5 })
      assert_equal RESTAURANT_NAMES_BY_ID.first(2), res["data"]["restaurantsMaxPageSize"]["nodes"].map { |n| n["name"] }
      assert_equal 5, res["data"]["restaurantsMaxPageSize"]["totalCount"]
      last_cursor = res["data"]["restaurantsMaxPageSize"]["pageInfo"]["endCursor"]

      res = exec_query(query_str, variables: { first: 5, after: last_cursor })
      assert_equal RESTAURANT_NAMES_BY_ID[2,2], res["data"]["restaurantsMaxPageSize"]["nodes"].map { |n| n["name"] }
      assert_equal 5, res["data"]["restaurantsMaxPageSize"]["totalCount"]
      last_cursor = res["data"]["restaurantsMaxPageSize"]["pageInfo"]["endCursor"]

      res = exec_query(query_str, variables: { first: 5, after: last_cursor })
      assert_equal RESTAURANT_NAMES_BY_ID.last(1), res["data"]["restaurantsMaxPageSize"]["nodes"].map { |n| n["name"] }
      assert_equal 5, res["data"]["restaurantsMaxPageSize"]["totalCount"]

      res = exec_query(query_str, variables: { last: 5 })
      assert_equal RESTAURANT_NAMES_BY_ID.last(2), res["data"]["restaurantsMaxPageSize"]["nodes"].map { |n| n["name"] }
      assert_equal 5, res["data"]["restaurantsMaxPageSize"]["totalCount"]
      next_cursor = res["data"]["restaurantsMaxPageSize"]["pageInfo"]["startCursor"]

      res = exec_query(query_str, variables: { last: 5, before: next_cursor })
      assert_equal RESTAURANT_NAMES_BY_ID[1,2], res["data"]["restaurantsMaxPageSize"]["nodes"].map { |n| n["name"] }
      assert_equal 5, res["data"]["restaurantsMaxPageSize"]["totalCount"]
      next_cursor = res["data"]["restaurantsMaxPageSize"]["pageInfo"]["startCursor"]

      res = exec_query(query_str, variables: { last: 5, before: next_cursor })
      assert_equal RESTAURANT_NAMES_BY_ID.first(1), res["data"]["restaurantsMaxPageSize"]["nodes"].map { |n| n["name"] }
      assert_equal 5, res["data"]["restaurantsMaxPageSize"]["totalCount"]
    end

    def test_it_handles_max_page_size_and_before_and_has_next_page
      query_str = <<-GRAPHQL
      query($first: Int, $after: String, $last: Int, $before: String) {
        restaurantsMaxPageSize(first: $first, after: $after, last: $last, before: $before) {
          nodes {
            name
          }
          totalCount
          pageInfo {
            startCursor
            endCursor
            hasNextPage
          }
        }
      }
      GRAPHQL

      # Test with neither first nor last
      res = exec_query(query_str)
      assert_equal RESTAURANT_NAMES_BY_ID.first(2), res["data"]["restaurantsMaxPageSize"]["nodes"].map { |n| n["name"] }
      assert_equal true, res["data"]["restaurantsMaxPageSize"]["pageInfo"]["hasNextPage"]
      end_cursor = res["data"]["restaurantsMaxPageSize"]["pageInfo"]["endCursor"]

      res = exec_query(query_str, variables: { before: end_cursor })
      assert_equal RESTAURANT_NAMES_BY_ID.first(1), res["data"]["restaurantsMaxPageSize"]["nodes"].map { |n| n["name"] }
      assert_equal true, res["data"]["restaurantsMaxPageSize"]["pageInfo"]["hasNextPage"]
    end

    def test_it_handles_max_page_size_and_after_and_has_previous_page
      query_str = <<-GRAPHQL
      query($first: Int, $after: String, $last: Int, $before: String) {
        restaurantsMaxPageSize(first: $first, after: $after, last: $last, before: $before) {
          nodes {
            name
          }
          totalCount
          pageInfo {
            startCursor
            endCursor
            hasPreviousPage
            hasNextPage
          }
        }
      }
      GRAPHQL

      # Test with neither first nor last
      res = exec_query(query_str)
      assert_equal RESTAURANT_NAMES_BY_ID.first(2), res["data"]["restaurantsMaxPageSize"]["nodes"].map { |n| n["name"] }
      assert_equal false, res["data"]["restaurantsMaxPageSize"]["pageInfo"]["hasPreviousPage"]
      assert_equal true, res["data"]["restaurantsMaxPageSize"]["pageInfo"]["hasNextPage"]
      end_cursor = res["data"]["restaurantsMaxPageSize"]["pageInfo"]["endCursor"]

      res = exec_query(query_str, variables: { after: end_cursor })
      assert_equal RESTAURANT_NAMES_BY_ID[2, 2], res["data"]["restaurantsMaxPageSize"]["nodes"].map { |n| n["name"] }
      assert_equal true, res["data"]["restaurantsMaxPageSize"]["pageInfo"]["hasPreviousPage"]
      assert_equal true, res["data"]["restaurantsMaxPageSize"]["pageInfo"]["hasNextPage"]

      # Also, with explicit last
      res = exec_query(query_str, variables: { after: end_cursor, last: 2 })
      assert_equal RESTAURANT_NAMES_BY_ID.last(2), res["data"]["restaurantsMaxPageSize"]["nodes"].map { |n| n["name"] }
      assert_equal true, res["data"]["restaurantsMaxPageSize"]["pageInfo"]["hasPreviousPage"]
      assert_equal false, res["data"]["restaurantsMaxPageSize"]["pageInfo"]["hasNextPage"]
    end

    def test_it_handles_order_by_joined_table
      # TODO graphql-ruby's single-item array input is broken
      by_neighborhood = [{ by: "NEIGHBORHOOD", dir: "ASC" }]
      res = exec_query(RESTAURANTS_QUERY, variables: { first: 3, order: by_neighborhood })
      expected_names = [
        # 29 North
        "Sam's Kitchen",
        "Taste of China",
        # Barracks Road
        "Peter Chang's",
        "The Villa",
        # Downtown Mall,
        "Rapture"
      ]

      names = res["data"]["restaurants"]["nodes"].map { |n| n["name"] }
      assert_equal expected_names.first(3), names
      last_cursor = res["data"]["restaurants"]["pageInfo"]["endCursor"]

      res = exec_query(RESTAURANTS_QUERY, variables: { first: 3, after: last_cursor, order: by_neighborhood })
      names = res["data"]["restaurants"]["nodes"].map { |n| n["name"] }
      assert_equal expected_names.last(2), names
    end

    def test_it_handles_order_by_case
      res = exec_query <<-GRAPHQL
      {
        restaurantsByParticularPreference(first: 5) {
          nodes {
            name
          }
        }
      }
      GRAPHQL

      expected_names = [
        "Peter Chang's",
        "Taste of China",
        "Rapture",
        "Sam's Kitchen",
        "The Villa",
      ]

      assert_equal expected_names, res["data"]["restaurantsByParticularPreference"]["nodes"].map { |r| r["name"] }
    end

    def test_it_handles_offset_based_cursors
      check_offset_based_cursor_compat(RESTAURANTS_QUERY)
    end

    def test_it_handles_offset_based_cursors_with_reversed_query
      check_offset_based_cursor_compat(REVERSED_RESTAURANTS_QUERY)
    end

    def check_offset_based_cursor_compat(query_str)
      make_cursor = ->(idx) { Base64.urlsafe_encode64(idx.to_s) }

      res = exec_query(query_str, variables: { first: 2, after: make_cursor.call(2) })
      assert_equal RESTAURANT_NAMES_BY_ID[2,2], res["data"]["restaurants"]["nodes"].map { |n| n["name"] }

      res = exec_query(query_str, variables: { first: 2, after: make_cursor.call(4) })
      assert_equal RESTAURANT_NAMES_BY_ID.last(1), res["data"]["restaurants"]["nodes"].map { |n| n["name"] }

      res = exec_query(query_str, variables: { last: 2, before: make_cursor.call(4) })
      assert_equal RESTAURANT_NAMES_BY_ID[1,2], res["data"]["restaurants"]["nodes"].map { |n| n["name"] }

      res = exec_query(query_str, variables: { last: 2, before: make_cursor.call(1) })
      assert_equal [], res["data"]["restaurants"]["nodes"].map { |n| n["name"] }
    end

    def test_it_works_with_group_by
      query_str = <<-GRAPHQL
      query($first: Int, $after: String, $last: Int, $before: String, $order: String) {
        cuisineStats(first: $first, after: $after, last: $last, before: $before, order: $order) {
          nodes {
            name
            averagePriceRange
          }
          pageInfo {
            endCursor
          }
        }
      }
      GRAPHQL

      # Raises if a group-by query doesn't provide an `order`.
      # It has to assume that the given order is sufficient.
      # (When there's no `group by`, we add the primary key to order.)
      assert_raises(GraphQL::Pro::RelationConnection::InvalidRelationError) do
        exec_query(query_str)
      end

      res = exec_query(query_str, variables: { first: 1, order: "cuisine" })
      conn = res["data"]["cuisineStats"]
      assert_equal ["chinese"], conn["nodes"].map { |c| c["name"] }
      assert_equal [2.5], conn["nodes"].map { |c| c["averagePriceRange"] }
      last_cursor = conn["pageInfo"]["endCursor"]

      res = exec_query(query_str, variables: { first: 2, after: last_cursor, order: "cuisine" })
      conn = res["data"]["cuisineStats"]
      assert_equal ["diner", "new_american"], conn["nodes"].map { |c| c["name"] }
      assert_equal [2.0, 4.0], conn["nodes"].map { |c| c["averagePriceRange"] }
    end

    def test_it_works_with_composite_primary_keys
      query_str = <<-GRAPHQL
      query($after: String) {
        neighborhood(name: "29 North") {
          restaurants(first: 1, after: $after) {
            nodes {
              name
            }
            pageInfo {
              endCursor
            }
          }
        }
      }
      GRAPHQL

      res = exec_query(query_str)
      assert_equal ["Sam's Kitchen"], res["data"]["neighborhood"]["restaurants"]["nodes"].map { |n| n["name"] }
      last_cursor = res["data"]["neighborhood"]["restaurants"]["pageInfo"]["endCursor"]

      res = exec_query(query_str, variables: { after: last_cursor })
      assert_equal ["Taste of China"], res["data"]["neighborhood"]["restaurants"]["nodes"].map { |n| n["name"] }
    end

    def test_it_works_with_range_add
      query_str = <<-GRAPHQL
      mutation {
        addRestaurant(input: {
          neighborhood: "Downtown Mall",
          name: "Marco & Luca",
          cuisine: CHINESE,
          priceRange: 1,
        }) {
          newRestaurantEdge {
            node {
              name
            }
            cursor
          }
          neighborhood {
            name
          }
        }
      }
      GRAPHQL
      res = exec_query(query_str)
      assert_equal "Downtown Mall", res["data"]["addRestaurant"]["neighborhood"]["name"]
      assert_equal "Marco & Luca", res["data"]["addRestaurant"]["newRestaurantEdge"]["node"]["name"]
      new_cursor = res["data"]["addRestaurant"]["newRestaurantEdge"]["cursor"]
      expected_cursor = "[#{Restaurant.last.id}]"
      assert_equal expected_cursor, Base64.decode64(new_cursor)
    ensure
      Restaurant.where(name: "Marco & Luca").delete_all
    end

    def test_it_works_with_arel_expression
      query_str = <<-GRAPHQL
        query($first: Int, $after: String, $last: Int, $before: String, $order: [RestaurantOrder!]) {
          restaurants(first: $first, after: $after, last: $last, before: $before, order: $order) {
            nodes { name neighborhood { name } }
            pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
          }
        }
      GRAPHQL

      res = exec_query(query_str, variables: { "order" => [{ "by" => "NEIGHBORHOOD_THEN_NAME", "dir" => "DESC" }]})
      names = res["data"]["restaurants"]["nodes"].map { |n| "#{n["neighborhood"]["name"]} #{n["name"]}" }
      expected_names = [
        "Downtown Mall Rapture",
        "Barracks Road The Villa",
        "Barracks Road Peter Chang's",
        "29 North Taste of China",
        "29 North Sam's Kitchen",
      ]
      assert_equal expected_names, names
    end

    def test_it_works_with_postgres_array
      query_str = <<-GRAPHQL
        query($first: Int, $after: String, $last: Int, $before: String, $order: [RestaurantOrder!]) {
          restaurants(first: $first, after: $after, last: $last, before: $before, order: $order) {
            nodes { cuisine name }
            pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
          }
        }
      GRAPHQL

      get_names = ->(res) {
        res["data"]["restaurants"]["nodes"].map { |n| "#{n["cuisine"]} #{n["name"]}" }
      }

      order = [{ "by" => "RESTAURANT_ARRAY", "dir" => "ASC" }]
      res = exec_query(query_str, variables: { "order" => order, first: 2 })
      names = get_names.call(res)
      expected_names = [
        "CHINESE Peter Chang's",
        "CHINESE Taste of China",
        "DINER Sam's Kitchen",
        "DINER The Villa",
        "NEW_AMERICAN Rapture",
      ]
      assert_equal expected_names[0,2], names

      last_cursor = res["data"]["restaurants"]["pageInfo"]["endCursor"]
      res2 = exec_query(query_str, variables: { order: order, first: 3, after: last_cursor })
      names2 = get_names.call(res2)
      assert_equal expected_names[2,3], names2



      order2 = [{ "by" => "RESTAURANT_ARRAY", "dir" => "DESC" }]
      res3 = exec_query(query_str, variables: { "order" => order2, first: 2 })
      names3 = get_names.call(res3)
      assert_equal expected_names[3,2].reverse, names3
    end

    def test_it_returns_start_cursor_standalone
      query_str = <<-GRAPHQL
      query($first: Int!, $after: String) {
        restaurants(first: $first, after: $after, order: [{by: CUISINE, dir: DESC}, {by: PRICE_RANGE, dir: ASC}]) {
          pageInfo {
            endCursor
          }
        }
      }
      GRAPHQL

      res = exec_query(query_str, variables: { first: 3 })
      last_cursor = res["data"]["restaurants"]["pageInfo"]["endCursor"]
      assert_equal "WyJkaW5lciIsMiw1XQ", last_cursor

      # make sure bad cursors are handled well, too
      cursor_decoded = Base64.decode64(last_cursor)
      bogus_cursor = Base64.encode64(cursor_decoded.sub("]", '"]')).strip
      res = exec_query(query_str, variables: { first: 3, after: bogus_cursor })
      expected_errors = [
        "Invalid cursor for `after: \"#{bogus_cursor}\"`. Fetch a new cursor and try again.",
      ]
      assert_equal expected_errors, res["errors"].map { |e| e["message"] }
      page_info = res["data"]["restaurants"]["pageInfo"]
      assert_nil page_info["startCursor"]
      assert_nil page_info["endCursor"]
    end

    def test_it_handles_invalid_json_cursors_with_a_nice_error
      res = exec_query(RESTAURANTS_QUERY, variables: { first: 3 })
      last_cursor = res["data"]["restaurants"]["pageInfo"]["endCursor"]
      cursor_decoded = Base64.decode64(last_cursor)
      bogus_cursor = Base64.encode64(cursor_decoded.sub("]", '"]')).strip
      res = exec_query(RESTAURANTS_QUERY, variables: { first: 3, after: bogus_cursor })
      expected_errors = [
        "Invalid cursor for `after: \"#{bogus_cursor}\"`. Fetch a new cursor and try again.",
      ]
      assert_equal expected_errors, res["errors"].map { |e| e["message"] }
      page_info = res["data"]["restaurants"]["pageInfo"]
      assert_nil page_info["startCursor"]
      assert_nil page_info["endCursor"]
      assert_equal false, page_info["hasNextPage"]
      assert_equal false, page_info["hasPreviousPage"]
    end

    def test_it_preserves_user_defined_limit
      query_str = <<-GRAPHQL
        query($first: Int, $after: String, $last: Int, $before: String) {
          firstRestaurants(first: $first, after: $after, last: $last, before: $before) {
            nodes { cuisine name }
            pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
          }
        }
      GRAPHQL
      res = exec_query(query_str, variables: { first: 4 })
      assert_equal 3, res["data"]["firstRestaurants"]["nodes"].size
      assert_equal RESTAURANT_NAMES_BY_ID.first(3), res["data"]["firstRestaurants"]["nodes"].map { |n| n["name"] }
      end_cursor = res["data"]["firstRestaurants"]["pageInfo"]["endCursor"]
      res = exec_query(query_str, variables: { first: 4, after: end_cursor })
      assert_equal [], res["data"]["firstRestaurants"]["nodes"].map { |n| n["name"] }

      end_cursor = res["data"]["firstRestaurants"]["pageInfo"]["endCursor"]
      res = exec_query(query_str, variables: { last: 2, before: end_cursor })
      assert_equal RESTAURANT_NAMES_BY_ID[1, 2], res["data"]["firstRestaurants"]["nodes"].map { |n| n["name"] }

      # Multiple paging:
      res = exec_query(query_str, variables: { first: 2 })
      assert_equal 2, res["data"]["firstRestaurants"]["nodes"].size
      assert_equal RESTAURANT_NAMES_BY_ID.first(2), res["data"]["firstRestaurants"]["nodes"].map { |n| n["name"] }
      end_cursor = res["data"]["firstRestaurants"]["pageInfo"]["endCursor"]
      res = exec_query(query_str, variables: { first: 2, after: end_cursor })
      assert_equal 1, res["data"]["firstRestaurants"]["nodes"].size
      assert_equal RESTAURANT_NAMES_BY_ID[2,1], res["data"]["firstRestaurants"]["nodes"].map { |n| n["name"] }
    end

    def test_it_handles_bogus_cursors
      query_str = <<-GRAPHQL
        query {
          restaurants(after: "test") {
            pageInfo {
              endCursor
            }
            edges {
              node {
                name
              }
            }
            nodes {
              name
            }
          }
        }
      GRAPHQL
      res = exec_query(query_str)
      assert_equal ["Invalid cursor for `after: \"test\"`. Fetch a new cursor and try again."], res["errors"].map { |e| e["message"] }
    end
  end
end
