# frozen_string_literal: true
require "test_helper"


module GraphQLProAccessBase
  if defined?(AccessHelpers)
    include AccessHelpers
  end

  def current_user
    raise NotImplementedError
  end

  def current_user_key
    :current_user
  end

  def exec_query(str, default_auth: false)
    schema = build_schema(default_auth: default_auth)
    schema.execute(str, context: { current_user_key => current_user })
  end

  def test_it_hides_marked_objects
    query_str = <<-GRAPHQL
    {
      s1: sandwich(id: 1) {
        bread
        price
        toppings { name }
      }
    }
    GRAPHQL

    res = exec_query(query_str)

    assert_equal false, res.key?("data")
    assert_equal 1, res["errors"].length
    assert_equal "Field 'price' doesn't exist on type 'Sandwich'", res["errors"][0]["message"]

    res = exec_query %|
    {
      __type(name: "Entree") {
        possibleTypes { name }
      }
    }
    |

    found_types = res["data"]["__type"]["possibleTypes"].map { |t| t["name"]}
    assert_equal ["Pasta", "Pizza", "Sandwich"], found_types.sort

    res = exec_query %|
    {
      __type(name: "Salad") {
        name
      }
    }
    |

    assert_nil res["data"]["__type"]
  end

  def test_it_returns_not_authorized_for_marked_objects
    query_str = <<-GRAPHQL
    {
      sandwich(id: 2) {
        bread
        toppings { name }
      }

      pizza(id: 4) {
        price
      }
    }
    GRAPHQL

    res = exec_query(query_str)
    assert_equal false, res.key?("data")
    assert_equal 1, res["errors"].length
    assert_equal "Not authorized for fields: Sandwich.toppings, Query.pizza", res["errors"][0]["message"]
  end

  def test_it_returns_null_for_failed_authorize_checks
    # The assumption here is that current_user
    # will be permitted to access 2 but not 1 or 3
    query_str = <<-GRAPHQL
    {
      s1: sandwich(id: 1) { bread }
      s2: sandwich(id: 2) { bread }
      s3: no_sandwich(id: 2) { bread }
      p1: pasta(id: 3) { price }
      # lazy values:
      e1: entree(id: 1) { ... sandwichFields }
      e2: entree(id: 2) { ... sandwichFields }
      entrees(ids: [1,2,3]) {
        ... sandwichFields
        ... pastaFields
      }
      # list of lists:
      list_entrees(id_lists: [[3,1,2], [1,2,2]]) {
        ... sandwichFields
        ... pastaFields
      }
    }

    fragment sandwichFields on Sandwich { bread }
    fragment pastaFields on Pasta { price }
    GRAPHQL

    res = exec_query(query_str)

    assert_nil res["data"]["s1"]
    assert_equal({"bread" => "WHEAT"}, res["data"]["s2"])
    assert_nil res["data"]["s3"]
    assert_nil res["data"]["p1"]

    assert_nil res["data"]["e1"]
    assert_equal({"bread" => "WHEAT"}, res["data"]["e2"])
    assert_equal([{"bread" => "WHEAT"}], res["data"]["entrees"])
    expected_lists = [
      [{"bread" => "WHEAT"}],
      [{"bread" => "WHEAT"}, {"bread" => "WHEAT"}],
    ]
    assert_equal(expected_lists, res["data"]["list_entrees"])
  end

  def test_it_returns_nil_when_a_list_returns_nil
    query_str = <<~GRAPHQL
    {
      nil_entrees {
        __typename
      }
    }
    GRAPHQL

    res = exec_query(query_str)
    assert_nil res["data"]["nil_entrees"]
  end

  def test_it_adds_an_error_when_authorize_nullifies_a_non_null_field
    query_type = GraphQL::ObjectType.define do
      name "Query"
      field :required_string, !types.String, authorize: { role: :never, pundit_policy_name: "NeverPolicy" } do
        resolve ->(o, a, c) { "stuff" }
      end
    end
    auth = self.auth_args
    schema = GraphQL::Schema.define do
      query(query_type)
      authorization(*auth)
    end
    query_str = <<-GRAPHQL
    { required_string }
    GRAPHQL

    res = schema.execute(query_str, context: { current_user_key => current_user })
    assert_nil res["data"]
    assert_equal "Cannot return null for non-nullable field Query.required_string", res["errors"][0]["message"]
  end

  def test_it_authorizes_by_parent
    query_str = <<-GRAPHQL
    {
      s2: sandwich(id: 2) { ...SandwichFields }
      s5: sandwich(id: 5) { ...SandwichFields }
    }

    fragment SandwichFields on Sandwich {
      bread
      fat_calories
      carbohydrate_calories
    }
    GRAPHQL

    res = exec_query(query_str)

    assert_equal "WHEAT", res["data"]["s2"]["bread"]
    assert_nil res["data"]["s2"]["fat_calories"]
    assert_nil res["data"]["s2"]["carbohydrate_calories"]

    assert_equal "WHEAT", res["data"]["s5"]["bread"]
    assert_equal 250, res["data"]["s5"]["fat_calories"]
    assert_equal 140, res["data"]["s5"]["carbohydrate_calories"]
  end

  def test_it_applies_role_and_parent_role
    query_str = <<-GRAPHQL
    {
      s5: sandwich(id: 5) {
        bread
        fat_calories
        protein_calories
      }
    }
    GRAPHQL

    res = exec_query(query_str)
    assert_equal "WHEAT", res["data"]["s5"]["bread"]
    assert_equal 250, res["data"]["s5"]["fat_calories"]
    assert_nil res["data"]["s5"]["protein_calories"]
  end

  def test_applies_default_role
    query_str = <<-GRAPHQL
    {
      s2: sandwich(id: 2) { ...SandwichFields }
      s5: sandwich(id: 5) { ...SandwichFields }
    }

    fragment SandwichFields on Sandwich {
      bread
      fat_calories
      carbohydrate_calories
    }
    GRAPHQL

    # This is the same:
    res = exec_query(query_str, default_auth: {access: {role: :always, pundit_policy_name: "DefaultPolicy"}})
    assert_equal "WHEAT", res["data"]["s2"]["bread"]
    assert_nil res["data"]["s2"]["fat_calories"]
    assert_nil res["data"]["s2"]["carbohydrate_calories"]
    assert_equal "WHEAT", res["data"]["s5"]["bread"]
    assert_equal 250, res["data"]["s5"]["fat_calories"]
    assert_equal 140, res["data"]["s5"]["carbohydrate_calories"]

    res = exec_query(query_str, default_auth: {view: {role: :always, pundit_policy_name: "DefaultPolicy"}, authorize: {role: :never, pundit_policy_name: "DefaultPolicy"}})
    # `bread` is blocked but the others are watched by their `parent_role`
    assert_equal({"bread"=>nil, "fat_calories"=>nil, "carbohydrate_calories"=>nil}, res["data"]["s2"])
    assert_equal({"bread"=>nil, "fat_calories"=>250, "carbohydrate_calories"=>140}, res["data"]["s5"])

    res = exec_query(query_str, default_auth: {access: { role: :never, pundit_policy_name: "DefaultPolicy"}})

    expected_errors = [
      # Sandwich.fat_calories and Bread are allowed by their own settings
      "Not authorized for fields: Query.sandwich, Sandwich.carbohydrate_calories"
    ]
    assert_equal expected_errors, res["errors"].map { |e| e["message"] }

    res = exec_query(query_str, default_auth: {view: { role: :never, pundit_policy_name: "DefaultPolicy"}})
    expected_errors = [
      "Field 'sandwich' doesn't exist on type 'Query'",
      "Field 'sandwich' doesn't exist on type 'Query'",
      "Field 'fat_calories' doesn't exist on type 'Sandwich'",
      "Fragment SandwichFields was defined, but not used",
    ]
    assert_equal expected_errors, res["errors"].map { |e| e["message"] }
  end

  def test_it_disallows_parent_for_non_runtime_checks
    t = SandwichType.graphql_definition.redefine(view: {parent_role: :admin})
    assert_raises(GraphQL::Pro::Access::InvalidConfigurationError) { t.name }

    t2 = SandwichType.graphql_definition.redefine(access: {parent_role: :admin})
    assert_raises(GraphQL::Pro::Access::InvalidConfigurationError) { t2.name }
  end

  def test_it_calls_unauthorized_object_handler
    schema = build_schema.graphql_definition.redefine do
      unauthorized_object ->(obj, ctx) {
        case obj
        when OpenStruct
          ctx.add_error(GraphQL::ExecutionError.new("#{obj.model_name} is inaccessible"))
          if obj.id == "3"
            next(OpenStruct.new(bread: "Dummy", model_name: "Sandwich"))
          end
        end
      }
    end

    query_str = "{
      no_sandwich(id: 1) { bread }
      no_sandwich2: no_sandwich(id: 3) { bread }
      entrees(ids: [1,3]) {
        ... on Sandwich {
          bread
        }
      }
    }"
    res = schema.execute(query_str, context: { current_user_key => current_user })
    expected_errs = [
      {
        "message"=>"Sandwich is inaccessible",
        "locations"=>[{"line"=>2, "column"=>7}],
        "path"=>["no_sandwich"]
      },
      {
        "message"=>"Pasta is inaccessible",
        "locations"=>[{"line"=>3, "column"=>7}],
        "path"=>["no_sandwich2"]
      },
      {
        "message"=>"Sandwich is inaccessible",
        "locations"=>[{"line"=>4, "column"=>7}],
        "path"=>["entrees"]
      },
      {
        "message"=>"Pasta is inaccessible",
        "locations"=>[{"line"=>4, "column"=>7}],
        "path"=>["entrees"]
      },
    ]

    assert_nil res["data"]["no_sandwich"]
    assert_equal({"bread" => "NONSENSE"}, res["data"]["no_sandwich2"])
    assert_equal([{"bread" => "NONSENSE"}], res["data"]["entrees"])
    assert_equal expected_errs, res["errors"]
  end

  def test_it_can_run_the_introspection_query
    res = exec_query(GraphQL::Introspection::INTROSPECTION_QUERY)
    assert res.key?("data")
  end

  def test_it_runs_fallback_while_skipping_introspection
    query_str = <<-GRAPHQL
      {
        __typename
        __schema { queryType { name } }
        __type(name: "Sandwich") { name }
      }
    GRAPHQL

    err_query_str = <<-GRAPHQL
      {
        sandwich(id: 2) { bread }
      }
    GRAPHQL

    # allow_introspection doesn't support view
    default_auths = [:access, :authorize]

    counter = 0
    default_auths.each do |key|
      default_auth = {key => { role: :never, pundit_policy_name: "DefaultPolicy" }}
      # Introspection ignores the setting
      res = exec_query(query_str, default_auth: default_auth)
      assert_equal "Query", res["data"]["__typename"]
      assert_equal "Query", res["data"]["__schema"]["queryType"]["name"]
      assert_equal "Sandwich", res["data"]["__type"]["name"]

      # Normal queries are subject to the setting
      res2 = exec_query(err_query_str, default_auth: default_auth)
      case key
      when :access
        assert_equal 1, res2["errors"].length
        assert_equal false, res2.key?("data")
      when :authorize
        # Sandwich is authorized by an overriding local policy
        assert_nil res2["data"]["sandwich"]["bread"]
      else
        raise "Unexpected key #{key}"
      end
      counter += 1
    end

    # Make sure they ran as expected
    assert_equal 2, counter
  end

  def test_it_works_for_mutations
    str = <<-GRAPHQL
    mutation {
      addSandwich(input: { fat_calories: 599 }) {
        admin
        always
        sandwich {
          bread
          fat_calories
        }
      }
    }
    GRAPHQL

    res = exec_query(str)
    mutation_result = res["data"]["addSandwich"]
    assert_nil mutation_result["admin"]
    assert_equal true, mutation_result["always"]
    assert_nil mutation_result["sandwich"]
  end

  def test_it_hides_mutation_fields
    str = <<-GRAPHQL
    mutation {
      addSecret {
        __typename
      }
    }
    GRAPHQL

    res = exec_query(str)
    assert_equal ["Field 'addSecret' doesn't exist on type 'Mutation'"], res["errors"].map { |e| e["message"] }
  end
end
