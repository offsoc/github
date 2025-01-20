# frozen_string_literal: true
require "test_helper"
if rails_loaded?
  class GraphQLProCanCanIntegrationTest < Minitest::Test
    # can't parallelize because the shared constant `::Ability`
    # with legacy can_can strategy test
    # parallelize_me!

    SqliteHelpers.setup_database_once

    class CanCanCustomer < ActiveRecord::Base
      self.primary_key = :id
      has_many :orders, class_name: "CanCanOrder"
    end
    c1 = CanCanCustomer.create!(name: "customer 1", credit_card_number: "1111")
    c2 = CanCanCustomer.create!(name: "customer 2", credit_card_number: "2222")

    class CanCanOrder < ActiveRecord::Base
      self.primary_key = :id
      belongs_to :customer, class_name: "CanCanCustomer"

      def inspect
        "<Data::Order(#{id}, #{total_amount})>"
      end
    end
    c1.orders.create!(total_amount: 100)
    c1.orders.create!(total_amount: 60)
    c2.orders.create!(total_amount: 75)

    class CanCanStore < ActiveRecord::Base
      self.primary_key = :id
    end
    CanCanStore.create!(name: "Toys-R-Us")

    module TestSchema
      class BaseArgument < GraphQL::Schema::Argument
        include GraphQL::Pro::CanCanIntegration::ArgumentIntegration
        can_can_action(nil)

        def authorized?(obj, value, ctx)
          ctx[:authorized_argument_calls] ||= Hash.new(0)
          result = super
        ensure
          if result.nil?
            # an error was raised
            result = false
          end
          ctx[:authorized_argument_calls][result] += 1
        end
      end

      class BaseField < GraphQL::Schema::Field
        include GraphQL::Pro::CanCanIntegration::FieldIntegration
        can_can_action(nil)
        argument_class BaseArgument
      end

      class BaseUnion < GraphQL::Schema::Union
        include GraphQL::Pro::CanCanIntegration::UnionIntegration
      end

      module BaseInterface
        include GraphQL::Schema::Interface
        include GraphQL::Pro::CanCanIntegration::InterfaceIntegration
      end

      module IdentifiedThing
        include BaseInterface
        can_can_action :read
        field :id, ID, null: false
      end

      class SpyOnField < BaseField
        can_can_action(:spy_on)
      end

      class BaseObjectWithoutAction < GraphQL::Schema::Object
        include GraphQL::Pro::CanCanIntegration::ObjectIntegration
        field_class BaseField
      end

      class BaseObject < BaseObjectWithoutAction
        can_can_action :read
      end

      class Order < BaseObject
        implements IdentifiedThing
        field :total_amount, Integer, null: false
      end

      class Customer < BaseObject
        implements IdentifiedThing
        field :orders, [Order], null: true, scope: false
        field :total_expenditure, Integer, null: true, can_can_action: :supervise_expenses

        def total_expenditure
          object.orders.map(&:total_amount).inject(&:+)
        end

        # This attribute doesn't have a special override, it goes to `true`
        field :name, String, null: false, can_can_attribute: :name
        # This attribute has a special config, it requires extra permission
        field :credit_card_number, String, null: true,
          can_can_action: :read, can_can_attribute: :credit_card_number
      end

      class SpyOnOrder < BaseObject
        field_class SpyOnField
        field :id, ID, null: true
        # Override :spy_on from field class
        field :total_amount, Integer, null: true, can_can_action: nil
      end

      class Store < BaseObjectWithoutAction
        field :name, String, null: true
      end

      class PublicStorefront < BaseObject
        can_can_action(nil)
        field :name, String, null: true
      end

      class Expensable < BaseUnion
        can_can_action :read
        possible_types(Order, Customer)

        def self.resolve_type(obj, ctx)
          if obj.is_a?(CanCanOrder)
            Order
          else
            Customer
          end
        end
      end

      class BaseResolver < GraphQL::Schema::Resolver
        argument_class BaseArgument
        include GraphQL::Pro::CanCanIntegration::ResolverIntegration
      end

      class Multiply < BaseResolver
        can_can_action :multiply
        argument :lhs, Integer, required: true, can_can_action: :lhs
        argument :rhs, Integer, required: true, can_can_action: :rhs
        type Integer, null: true

        def resolve(lhs:, rhs:)
          lhs * rhs
        end
      end

      class Query < BaseObject
        FIELD_ALIAS_KEYWORD = GRAPHQL_19_PLUS ? :resolver_method : :method

        def self.find_field(name, type, model_class)
          field name, type, null: true do
            argument :id, ID, required: true
          end
          define_method(name) { |id:| model_class.find(id) }
        end

        find_field(:customer, Customer, CanCanCustomer)
        find_field(:store, Store, CanCanStore)
        find_field(:storefront, PublicStorefront, CanCanStore)
        find_field(:spy_on_order, SpyOnOrder, CanCanOrder)

        field :orders, [Order], null: false

        def orders
          CanCanOrder.all
        end

        field :add, Integer, null: true do
          argument :lhs, Integer, required: true, can_can_action: :lhs
          argument :rhs, Integer, required: true, can_can_action: :rhs
        end

        def add(lhs:, rhs:)
          lhs + rhs
        end

        field :multiply, resolver: Multiply

        field :expensables, [Expensable], null: true

        def expensables
          CanCanOrder.all + CanCanCustomer.all
        end

        field :identified_things, [IdentifiedThing], null: true, FIELD_ALIAS_KEYWORD => :expensables

        field :custom_can_can_subject, Integer, null: false,
          can_can_action: :custom_subject_ability,
          can_can_subject: :custom_subject

        def custom_can_can_subject
          1
        end
      end

      class BaseMutation < GraphQL::Schema::Mutation
        include GraphQL::Pro::CanCanIntegration::MutationIntegration
        argument_class BaseArgument
        # Without this, it raises
        can_can_action(nil)

        def inspect
          "#{self.class.graphql_name} mutation"
        end

        def unauthorized_by_can_can(owner, obj)
          raise "Failed auth: #{owner}, #{obj.inspect}"
        end
      end

      class ExplicitInputs < GraphQL::Schema::InputObject
        argument_class BaseArgument
        argument :left, Integer, required: true, can_can_action: :explicit_add
        argument :right, Integer, required: true, can_can_action: :explicit_add
      end

      class AddExplicitInputs < BaseMutation
        can_can_action nil
        argument :inputs, ExplicitInputs, required: true
        field :result, Integer, null: true
        field :error, String, null: true
        def resolve(inputs:)
          {
            result: inputs[:left] + inputs[:right]
          }
        end

        def unauthorized_by_can_can(owner, object)
          { error: "Failed auth: #{owner.path}, #{object.class}" }
        end
      end

      class MeasureNames < BaseMutation
        argument :names, [String], required: true,
          can_can_action: :measure_plural

        field :sizes, [Int], null: false

        def resolve(names:)
          {
            sizes: names.map(&:size),
          }
        end
      end

      class OrderSomething < BaseMutation
        can_can_action :purchase
        field :order, Order, null: true

        def resolve
          {order: CanCanOrder.new(total_amount: 88, id: "x")}
        end
      end

      module WithErrors
        def self.included(mutation_class)
          mutation_class.field :errors, [String], null: true
        end

        def unauthorized_by_can_can(owner, value)
          {
            errors: ["Failed auth: #{owner.graphql_name} (#{value.inspect})"],
          }
        end
      end

      class OrderSomethingWithErrors < OrderSomething
        include WithErrors
      end

      class RevalueOrder < BaseMutation
        argument :amount, Integer, required: true
        argument :order_id, ID, required: true, loads: Order, can_can_action: :revalue_order
        field :order, Order, null: true

        def resolve(order:, amount:)
          # Doesn't actually update the database
          new_order = order.dup
          new_order.assign_attributes(id: order.id, total_amount: amount)
          {order: new_order}
        end
      end

      class RevalueOrderWithErrors < RevalueOrder
        include WithErrors
      end

      class Mutation < BaseObject
        field :order_something, mutation: OrderSomething
        field :order_something_with_errors, mutation: OrderSomethingWithErrors
        field :revalue_order, mutation: RevalueOrder
        field :revalue_order_with_errors, mutation: RevalueOrderWithErrors
        field :add_explicit_inputs, mutation: AddExplicitInputs
        field :measure_names, mutation: MeasureNames
      end

      class Schema < GraphQL::Schema
        query(Query)
        mutation(Mutation)

        def self.unauthorized_object(err)
          raise GraphQL::ExecutionError, "Information blocked: #{err.type.graphql_name}"
        end

        def self.object_from_id(id, context)
          data_type, id = id.split(":")
          GraphQLProCanCanIntegrationTest.const_get(data_type).find(id)
        end

        def self.resolve_type(type, obj, ctx)
          type_name = obj.class.name.split("::").last.sub("CanCan", "")
          types[type_name]
        end

        def self.execute(*args, context: {}, **kwargs)
          if context[:funny_ability]
            context[:can_can_ability] = FunnyAbility.new(context[:current_user])
          end
          super
        end
      end
    end

    def exec_query(*args, **kwargs)
      TestSchema::Schema.execute(*args, **kwargs)
    end

    def user(opts = {})
      OpenStruct.new(opts)
    end

    class CanCanAbility
      include CanCan::Ability

      def initialize(user)
        if user
          can :read, Symbol # for Query.add
          # A user can supervise themselves
          can :supervise_expenses, CanCanCustomer, id: user.id
          if user.billing_reader?
            if user.order_ids
              can :read, CanCanOrder, id: user.order_ids
              can :read, CanCanCustomer, id: user.customer_ids
            else
              can :read, CanCanOrder
              can :read, CanCanCustomer
            end

            if user.spy_on_credit_card_number?
              can :read, CanCanCustomer, :credit_card_number
            else
              cannot :read, CanCanCustomer, :credit_card_number
            end
          end
          if user.spy_on_orders?
            can :spy_on, CanCanOrder
          end
          if user.rhs?
            can :rhs, :all
          end
          if user.lhs?
            can :lhs, :all
          end
          if user.multiply?
            can :multiply, :all
          end
          if user.purchaser?
            can :purchase, :all
          end
          if user.revalue_order?
            can :revalue_order, CanCanOrder
          end

          if user.custom_subject_ability?
            can :custom_subject_ability, :custom_subject
          end

          if user.can_explicit_add?
            can :explicit_add, :all
          end

          if user.can_measure_plural?
            can :measure_plural, :all
          end
        end
      end
    end

    class FunnyAbility
      include CanCan::Ability

      def initialize(user)
        can :manage, :all
      end
    end

    def setup
      refute defined?(Ability)
      Object.const_set(:Ability, CanCanAbility)
    end

    def teardown
      Object.send(:remove_const, :Ability)
      refute defined?(Ability)
    end

    def test_it_applies_the_configured_action_and_uses_unauthorized_object_hook
      query_str = <<-GRAPHQL
      {
        customer(id: "1") {
          orders {
            totalAmount
          }
        }
      }
      GRAPHQL

      blocked_res = exec_query(query_str, context: {current_user: user})
      assert_equal ["Information blocked: Customer"], blocked_res["errors"].map { |e| e["message"] }
      assert_nil blocked_res["data"]["customer"]

      allowed_res = exec_query(query_str, context: {current_user: user(billing_reader?: true)})
      assert_equal [100, 60], allowed_res["data"]["customer"]["orders"].map { |o| o["totalAmount"] }
    end

    def test_it_raises_with_no_configuration
      assert_equal false, TestSchema::Store.can_can_action
      err = assert_raises GraphQL::Pro::CanCanIntegration::ActionNotConfiguredError do
        exec_query('{store(id: "1") { name }}', context: {current_user: user})
      end

      assert_includes err.message, "TestSchema::Store", "it has the type name"
    end

    def test_it_overrides_with_nil
      assert_nil TestSchema::PublicStorefront.can_can_action
      res = exec_query('{ storefront(id: "1") { name } }', context: {current_user: user})
      assert_equal "Toys-R-Us", res["data"]["storefront"]["name"]
    end

    def test_it_uses_can_can_subject_config
      res = exec_query("{ customCanCanSubject }", context: { current_user: user() })
      assert_equal ["Information blocked: Query"], res["errors"].map { |e| e["message"] }

      res = exec_query("{ customCanCanSubject }", context: { current_user: user(custom_subject_ability?: true) })
      assert_equal 1, res["data"]["customCanCanSubject"]
    end

    def test_it_applies_accessible_by
      res = exec_query "{ orders { id }}", context: {
        current_user: user(billing_reader?: true, order_ids: [1, 2]),
      }
      assert_equal ["1", "2"], res["data"]["orders"].map { |o| o["id"] }

      res = exec_query "{ orders { id }}", context: {
        current_user: user(billing_reader?: true, order_ids: [1, 3]),
      }
      assert_equal ["1", "3"], res["data"]["orders"].map { |o| o["id"] }
    end

    def test_it_skips_scoping_with_false
      query_str = <<-GRAPHQL
      {
        customer(id: "1") {
          orders {
            totalAmount
          }
        }
      }
      GRAPHQL
      # Customer.orders is not scoped
      allowed_res = exec_query(query_str, context: {current_user: user(billing_reader?: true)})
      assert_equal [100, 60], allowed_res["data"]["customer"]["orders"].map { |o| o["totalAmount"] }
    end

    def test_it_scopes_abstract_types
      query_str = <<-GRAPHQL
      {
        expensables {
          __typename
        }

        identifiedThings {
          id
        }
      }
      GRAPHQL

      res = exec_query(query_str, context: { current_user: user(order_ids: [], billing_reader?: true) })
      assert_equal [], res["data"]["expensables"]
      assert_equal [], res["data"]["identifiedThings"]

      res = exec_query(query_str, context: { current_user: user(order_ids: [2, 3], billing_reader?: true) })
      assert_equal ["Order", "Order"], res["data"]["expensables"].map { |e| e["__typename"]}
      assert_equal ["2", "3"], res["data"]["identifiedThings"].map { |e| e["id"]}

      res = exec_query(query_str, context: { current_user: user(order_ids: [1, 2, 3], customer_ids: [1], billing_reader?: true) })
      assert_equal ["Order", "Order", "Order", "Customer"], res["data"]["expensables"].map { |e| e["__typename"]}
      assert_equal ["1", "2", "3", "1"], res["data"]["identifiedThings"].map { |e| e["id"]}

    end

    def test_it_applies_field_level_actions
      query_str = <<-GRAPHQL
      query($id: ID!){
        customer(id: $id) { totalExpenditure }
      }
      GRAPHQL

      # user can see own expenses
      allowed_res = exec_query(query_str,
        context: {current_user: user(billing_reader?: true, id: 1)},
        variables: {id: "1"}
      )
      assert_equal 160, allowed_res["data"]["customer"]["totalExpenditure"]

      # but a different user can't see this customer's expenses
      denied_res = exec_query(query_str,
                              context: {current_user: user(billing_reader?: true, id: "2")},
                              variables: {id: "1"})
      assert_nil denied_res["data"]["customer"]["totalExpenditure"]
      assert_equal ["Information blocked: Customer"], denied_res["errors"].map { |e| e["message"] }
    end

    def test_it_applies_field_level_attributes
      query_str = <<-GRAPHQL
      query($id: ID!){
        customer(id: $id) {
          name
          creditCardNumber
        }
      }
      GRAPHQL

      allowed_res = exec_query(query_str,
        context: {current_user: user(billing_reader?: true, id: 1, spy_on_credit_card_number?: true)},
        variables: {id: "1"}
      )
      # Name has no special rules attached, it falls back to `true`
      assert_equal "customer 1", allowed_res["data"]["customer"]["name"]
      assert_equal "1111", allowed_res["data"]["customer"]["creditCardNumber"]


      denied_res = exec_query(
        query_str,
        context: {current_user: user(billing_reader?: true, id: 1)},
        variables: {id: "2"}
      )
      assert_equal "customer 2", denied_res["data"]["customer"]["name"]
      assert_nil denied_res["data"]["customer"]["creditCardNumber"]
      assert_equal ["Information blocked: Customer"], denied_res["errors"].map { |e| e["message"] }
    end

    def test_it_gets_field_level_actions_from_class
      query_str = <<-GRAPHQL
      {
        spyOnOrder(id: "1") {
          id
        }
      }
      GRAPHQL

      allowed_res = exec_query(query_str, context: {current_user: user(billing_reader?: true, spy_on_orders?: true)})
      assert_equal "1", allowed_res["data"]["spyOnOrder"]["id"]

      blocked_res = exec_query(query_str, context: {current_user: user(billing_reader?: true)})
      assert_nil blocked_res["data"]["spyOnOrder"]["id"]
    end

    def test_it_overrides_field_level_actions_with_nil
      query_str = <<-GRAPHQL
      {
        spyOnOrder(id: "1") {
          id
          totalAmount
        }
      }
      GRAPHQL

      res = exec_query(query_str, context: {current_user: user(billing_reader?: true)})
      assert_nil res["data"]["spyOnOrder"]["id"]
      # This one has an override of `nil`, so it goes through:
      assert_equal 100, res["data"]["spyOnOrder"]["totalAmount"]
    end

    def test_resolvers_authorize_like_mutations
      query_str = <<-GRAPHQL
      {
        multiply(lhs: 3, rhs: 2)
      }
      GRAPHQL

      # All permissions
      allowed_res = exec_query(query_str, root_value: :sym, context: {current_user: user(lhs?: true, rhs?: true, multiply?: true)})
      assert_equal 6, allowed_res["data"]["multiply"]

      # Mixed permissions
      mixed_res = exec_query(query_str, root_value: :sym, context: {current_user: user(rhs?: true, multiply?: true)})
      assert_nil mixed_res["data"]["multiply"]

      mixed_res = exec_query(query_str, root_value: :sym, context: {current_user: user(rhs?: true, lhs?: true)})
      assert_nil mixed_res["data"]["multiply"]

      mixed_res = exec_query(query_str, root_value: :sym, context: {current_user: user(multiply?: true, lhs?: true)})
      assert_nil mixed_res["data"]["multiply"]
    end

    def test_it_gets_argument_level_actions
      query_str = <<-GRAPHQL
      {
        add(lhs: 1, rhs: 2)
      }
      GRAPHQL

      # All permissions
      allowed_res = exec_query(query_str, root_value: :sym, context: {current_user: user(lhs?: true, rhs?: true)})
      assert_equal 3, allowed_res["data"]["add"]
      assert_equal 2, allowed_res.context[:authorized_argument_calls][true]
      refute allowed_res.context[:authorized_argument_calls].key?(false)

      # Mixed permissions
      mixed_res = exec_query(query_str, root_value: :sym, context: {current_user: user(rhs?: true)})
      assert_nil mixed_res["data"]["add"]
      assert_equal 1, mixed_res.context[:authorized_argument_calls][false]
      # This could be brittle; it so happens that rhs wasn't checked first.
      refute mixed_res.context[:authorized_argument_calls].key?(true)

      mixed_res = exec_query(query_str, root_value: :sym, context: {current_user: user(lhs?: true)})
      assert_nil mixed_res["data"]["add"]
      assert_equal 1, mixed_res.context[:authorized_argument_calls][true]
      assert_equal 1, mixed_res.context[:authorized_argument_calls][false]

      # No permissions
      blocked_res = exec_query(query_str, root_value: :sym, context: {current_user: user})
      assert_nil blocked_res["data"]["add"]
      assert_equal 1, blocked_res.context[:authorized_argument_calls][false]
      refute blocked_res.context[:authorized_argument_calls].key?(true)
    end

    def test_it_checks_mutation_level_actions
      query_str = "mutation { orderSomething { order { totalAmount } } }"
      err = assert_raises RuntimeError do
        exec_query(query_str, context: {current_user: user(billing_reader?: true)})
      end

      msg = "Failed auth: GraphQLProCanCanIntegrationTest::TestSchema::OrderSomething, OrderSomething mutation"
      assert_equal msg, err.message

      allowed_res = exec_query(query_str, context: {current_user: user(purchaser?: true, billing_reader?: true)})
      assert_equal 88, allowed_res["data"]["orderSomething"]["order"]["totalAmount"]
    end

    def test_it_checks_type_actions_and_argument_actions_on_loaded_objects
      query_str = <<-GRAPHQL
      mutation {
        revalueOrder(orderId: "CanCanOrder:1", amount: 701) {
          order {
            totalAmount
          }
        }
      }
      GRAPHQL

      # all permissions
      allowed_res = exec_query(query_str, context: {current_user: user(billing_reader?: true, revalue_order?: true)})
      assert_equal 701, allowed_res["data"]["revalueOrder"]["order"]["totalAmount"]

      graphql_error_permissions = [
        # arg permission only
        {revalue_order?: true},
        # no permissions
        {},
      ]
      # This is a bit weird, it goes to the schema's handler
      graphql_error_permissions.each do |perm|
        blocked_res = exec_query(query_str, context: {current_user: user(perm)})
        assert_equal ["Information blocked: Order"], blocked_res["errors"].map { |e| e["message"] }, "It returns an error with #{perm}"
        assert_nil blocked_res["data"]["revalueOrder"], "It doesn't run the mutation with #{perm}"
      end

      raised_error_permissions = [
        # type permission only
        {billing_reader?: true},
      ]

      raised_error_permissions.each do |perms|
        err = assert_raises RuntimeError, "It raises with permissions: #{perms}" do
          exec_query(query_str, context: {current_user: user(perms)})
        end
        assert_includes err.message, "Data::Order", "it fails with permissions: #{perms}"
      end
    end

    def test_it_works_with_input_objects
      if Gem::Version.new(GraphQL::VERSION) < Gem::Version.new("1.10.0")
        skip "1.10+ only"
      end

      query_str = <<-GRAPHQL
      mutation {
        addExplicitInputs(inputs: {left: 1, right: 2}) { result error }
      }
      GRAPHQL

      unauth_res = exec_query(query_str, context: { current_user: user })
      assert_nil unauth_res["data"]["addExplicitInputs"].fetch("result")
      assert_equal "Failed auth: AddExplicitInputs.inputs, GraphQLProCanCanIntegrationTest::TestSchema::ExplicitInputs", unauth_res["data"]["addExplicitInputs"]["error"]

      auth_res = exec_query(query_str, context: { current_user: user(can_explicit_add?: true) })
      assert_equal 3, auth_res["data"]["addExplicitInputs"]["result"]
      assert_nil auth_res["data"]["addExplicitInputs"]["error"]
    end

    def test_it_works_with_array_arguments
      query_str = <<-GRAPHQL
      mutation {
        measureNames(names: ["Sasquatch", "Loch Ness Monster"]) { sizes }
      }
      GRAPHQL
      err = assert_raises RuntimeError do
        exec_query(query_str, context: {current_user: user})
      end
      assert_includes err.message, 'Failed auth'
      assert_includes err.message, '["Sasquatch", "Loch Ness Monster"]'

      res = exec_query(query_str, context: {current_user: user(can_measure_plural?: true)})
      assert_equal [9, 17], res["data"]["measureNames"]["sizes"]
    end

    def test_it_can_add_errors_as_data
      query_str = "mutation { orderSomethingWithErrors { order { totalAmount } errors } }"
      res = exec_query(query_str, context: {current_user: user(billing_reader?: true)})
      msg = "Failed auth: OrderSomethingWithErrors (OrderSomethingWithErrors mutation)"
      assert_equal [msg], res["data"]["orderSomethingWithErrors"]["errors"]

      query_str = <<-GRAPHQL
      mutation {
        revalueOrderWithErrors(orderId: "CanCanOrder:1", amount: 701) {
          order { totalAmount }
          errors
        }
      }
      GRAPHQL
      res = exec_query(query_str, context: {current_user: user(billing_reader?: true)})
      msg = "Failed auth: orderId (<Data::Order(1, 100)>)"
      assert_equal [msg], res["data"]["revalueOrderWithErrors"]["errors"]
    end

    def test_it_uses_a_custom_ability_class
      query_str = <<-GRAPHQL
      {
        customer(id: "1") {
          orders {
            totalAmount
          }
        }
      }
      GRAPHQL

      funny_user = user(funny_permission?: true)

      blocked_res = exec_query(query_str, context: {current_user: funny_user})
      assert_equal ["Information blocked: Customer"], blocked_res["errors"].map { |e| e["message"] }

      allowed_res = exec_query(
        query_str,
        context: {
          current_user: funny_user,
          funny_ability: true,
        },
      )
      assert_equal [100, 60], allowed_res["data"]["customer"]["orders"].map { |o| o["totalAmount"] }
    end

    def test_introspection_works
      res = exec_query(GraphQL::Introspection::INTROSPECTION_QUERY)
      assert res.key?("data")
      refute res.key?("errors")
    end

    class CustomCurrentUserSchema < GraphQL::Schema
      class CustomAbility
        include CanCan::Ability

        def initialize(user)
          can :read, :all
          if user.can_view
            can :manage, :all
          end
        end
      end

      class Context < GraphQL::Query::Context
        def can_can_ability
          @ability ||= CustomAbility.new(self[:viewer])
        end
      end

      class Field < GraphQL::Schema::Field
        include GraphQL::Pro::CanCanIntegration::FieldIntegration
      end

      class Query < GraphQL::Schema::Object
        field_class(Field)
        include GraphQL::Pro::CanCanIntegration::ObjectIntegration
        can_can_action :read

        field :int, Integer, null: true, can_can_action: :view_int

        def int
          4
        end
      end

      query(Query)
      context_class(Context)
    end

    def test_it_uses_custom_current_user
      res = CustomCurrentUserSchema.execute("{ int }", root_value: :something, context: { viewer: user(can_view: true)})
      assert_equal 4, res["data"]["int"]

      res2 = CustomCurrentUserSchema.execute("{ int }", root_value: :something, context: { viewer: user(can_view: false)})
      assert_nil res2["data"]["int"]
    end
  end
end
