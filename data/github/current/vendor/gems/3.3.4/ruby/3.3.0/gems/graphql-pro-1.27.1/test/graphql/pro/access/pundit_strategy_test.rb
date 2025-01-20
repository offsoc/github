# frozen_string_literal: true
require_relative "../access_test"

# Found by runtime object
class SandwichPolicy
  def initialize(user, obj)
    @user = user
    @obj = obj
  end

  def admin?
    @user.allowed_ids.include?(@obj.id)
  end

  def creator?
    @obj.id == "5"
  end

  def never?
    false
  end

  def always?
    true
  end
end


class NeverPolicy
  def initialize(u, o); end
  def never?; false; end
end

class PastaPolicy < NeverPolicy; end
class PizzaPolicy < NeverPolicy; end
class SaladPolicy < NeverPolicy; end

# Found by type name
class ToppingPolicy
  def initialize(user, obj); end
  def admin?; false; end
end

# Found by config
class SandwichPricePolicy
  def initialize(user, obj); end
  def admin?; false; end
end

class DefaultPolicy
  def initialize(user, obj); end
  def always?;  true;   end
  def never?;   false;  end
  def admin?;   false;  end
end

module PunditNamespace
  class QueryPolicy
    def initialize(*); end
    def admin?(*); true; end
  end

  class IntPolicy
    def initialize(*); end
    def thing?(*); true; end
  end

  class StringPolicy
    def initialize(*); end
    def thing2?(*); false; end
  end
end

class GraphQLProAccessPunditTest < Minitest::Test
  include ::GraphQLProAccessBase

  def auth_strategy
    :pundit
  end

  def current_user
    OpenStruct.new(allowed_ids: ["2", "5"])
  end

  def add_default_policy
    Object.const_set(:SchemaDefaultPolicy, DefaultPolicy)
    defined?(::SchemaDefaultPolicy) || raise("Failed to define default policy")
  end

  def remove_default_policy
    Object.send(:remove_const, :SchemaDefaultPolicy)
    defined?(::SchemaDefaultPolicy) && raise("Failed to remove default policy")
  end

  class BaseSchema < GraphQL::Schema
  end

  def test_it_raises_for_unknown_policies_on_fields
    assert_raises(GraphQL::Pro::Access::PunditStrategyNotFoundError) {
      q = GraphQL::ObjectType.define {
        name "Query"
        # Unknown explict policy
        field :thing, types.String, view: {role: :admin, policy_name: "Unknown" }
      }
      BaseSchema.define(query: q, authorization: :pundit).execute("{ __typename }")
    }

    assert_raises(GraphQL::Pro::Access::PunditStrategyNotFoundError) {
      q = GraphQL::ObjectType.define {
        name "Query"
        # Unknown implicit policy
        field :thing, types.String, view: :admin
      }
      BaseSchema.define(query: q, authorization: :pundit).execute("{ __typename }")
    }
  end

  def test_it_raises_for_unknown_policies_on_types
    t = nil
    assert_raises(GraphQL::Pro::Access::PunditStrategyNotFoundError) {
      t = SandwichType.graphql_definition.redefine(name: "XYZ", view: :admin)
      q = GraphQL::ObjectType.define {
        name "Query"
        field :thing, t
      }
      BaseSchema.define(query: q, authorization: :pundit).execute("{ __typename }")
    }

    assert_raises(GraphQL::Pro::Access::PunditStrategyNotFoundError) {
      t = SandwichType.graphql_definition.redefine(name: "XYZ", view: {role: :admin, policy_name: "XPolicy"})
      q = GraphQL::ObjectType.define {
        name "Query"
        field :thing, t
      }
      BaseSchema.define(query: q, authorization: :pundit).execute("{ __typename }")
    }
  end

  def test_it_raises_for_unknown_policies_on_parents
    t = nil
    err = assert_raises(GraphQL::Pro::Access::PunditStrategyNotFoundError) {
      t = SandwichType.graphql_definition.redefine(name: "XYZ", authorize: { parent_role: :admin })
      q = GraphQL::ObjectType.define {
        name "Query"
        field :thing, t
      }
      BaseSchema.define(query: q, authorization: :pundit).execute("{ __typename }")
    }

    expected_msg = %|Failed to find parent Pundit policy for: XYZ. Tried "XYZPolicy", specify with: `authorize: { parent_role: :admin, parent_pundit_policy_name: 'YourPolicy' }`|
    assert_equal expected_msg, err.message

    err = assert_raises(GraphQL::Pro::Access::PunditStrategyNotFoundError) {
      t = SandwichType.graphql_definition.redefine(name: "XYZ", authorize: { parent_role: :admin, parent_pundit_policy_name: "ABCPolicy" })
      q = GraphQL::ObjectType.define {
        name "Query"
        field :thing, t
      }
      BaseSchema.define(query: q, authorization: :pundit).execute("{ __typename }")
    }

    expected_msg = %|Failed to find parent Pundit policy for: XYZ. Tried "ABCPolicy", specify with: `authorize: { parent_role: :admin, parent_pundit_policy_name: 'YourPolicy' }`|
    assert_equal expected_msg, err.message
  end

  def test_it_raises_for_unknown_default_policy
    err = assert_raises(GraphQL::Pro::Access::PunditStrategyNotFoundError) {
      q = GraphQL::ObjectType.define {
        name "Query"
        field :thing, types.Int
      }
      BaseSchema.define(query: q) do
        authorization :pundit, fallback: { view: { role: :admin } }
      end.execute("{ __typename }")
    }

    expected_msg = %|Failed to find Pundit policy for: Schema default. Tried "SchemaDefaultPolicy", specify with: `view: { role: :admin, pundit_policy_name: 'YourPolicy' }`|
    assert_equal expected_msg, err.message
  end

  def test_it_finds_the_default_policy
    add_default_policy
    q = GraphQL::ObjectType.define {
      name "Query"
      field :thing, types.Int
    }
    BaseSchema.define(query: q) do
      authorization :pundit, fallback: { view: { role: :admin } }
    end.execute("{ __typename }")

    assert true, "It didn't raise"
  ensure
    remove_default_policy
  end

  def test_it_finds_namespaced_policies
    q = GraphQL::ObjectType.define {
      name "Query"
      view role: :admin
      field :thing, types.Int, view: :thing
    }
    schema = BaseSchema.define(query: q) do
      authorization :pundit, namespace: PunditNamespace
    end

    root = OpenStruct.new(thing: 1, thing2: "this should be nilled by policy")
    res = schema.execute("{ __typename thing }", root_value: root)

    assert_equal "Query", res["data"]["__typename"]
    assert_equal 1, res["data"]["thing"]
    assert_nil res["data"]["thing2"]
  end

  def test_it_finds_the_namespaced_default_policy
    PunditNamespace.const_set(:SchemaDefaultPolicy, DefaultPolicy)
    q = GraphQL::ObjectType.define {
      name "Query"
      field :thing, types.Boolean
    }
    s = BaseSchema.define(query: q) do
      authorization :pundit, fallback: { view: { role: :admin } }, namespace: PunditNamespace
    end

    res = s.execute("{ thing }")
    assert_equal 1, res["errors"].length
  ensure
    PunditNamespace.send(:remove_const, :SchemaDefaultPolicy)
  end
end
