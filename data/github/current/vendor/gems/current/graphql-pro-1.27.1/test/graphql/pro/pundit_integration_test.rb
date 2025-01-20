# frozen_string_literal: true
require "test_helper"

class GraphQLProPunditIntegrationTest < Minitest::Test
  parallelize_me!

  SqliteHelpers.setup_database_once

  class PunditIntegrationSchema < GraphQL::Schema
    module Data
      class Relation
        def initialize(items, model_name: items.first.class.name)
          @items = items
          @model_name = model_name
        end

        def model_name
          @model_name
        end

        def none
          self.class.new([], model_name: model_name)
        end

        extend Forwardable
        def_delegators :@items, :each, :map, :to_a, :[], :length
      end

      class PunditBeast < ActiveRecord::Base
        self.primary_key = :id

        def self.find(name)
          self.where(name: name).first
        end

        def current_whereabouts
          OpenStruct.new(description: current_whereabouts_description)
        end
      end

      PunditBeast.create!(name: "Sasquatch", nickname: "Big Foot", current_whereabouts_description: "The Great White North")
      PunditBeast.create!(name: "Loch Ness Monster", nickname: "Nessie", current_whereabouts_description: "Depths of Loch Ness")

      class Lair
        attr_reader :name

        def initialize(name:)
          @name = name
        end

        def self.find(name)
          LAIRS.find { |l| l.name == name }
        end

        def self.all
          Relation.new(LAIRS)
        end

        LAIRS = [
          Lair.new(name: "Canadian Wilderness"),
          Lair.new(name: "Loch Ness"),
        ]
      end

      class BasePolicy
        def initialize(user, object)
          @user = user
          @object = object
        end
      end

      class CustomPolicyClassWithoutScope < BasePolicy
        def custom_role?
          @user.has_custom_role
        end

        def beast_viewer?
          @user.has_custom_beast_viewer
        end
      end

      class CustomPolicyClass < CustomPolicyClassWithoutScope
        class Scope
          def initialize(user, items)
            @user = user
            @items = items
          end

          def resolve
            if @user.can_list_beast
              @items
            else
              []
            end
          end
        end
      end

      class CustomFindBeastPolicy < BasePolicy
        def beast_viewer?
          @user.can_view_beast
        end

        def beast_tracker?
          @user.can_track_beast
        end

        def measure_plural?
          @user.can_measure_plural
        end

        def field_viewer?
          @user.can_view_fields
        end

        def left_beast?
          @user.can_left_beast
        end

        def right_beast?
          @user.can_right_beast
        end

        class Scope
          def initialize(user, items)
            @user = user
            @items = items
          end

          def resolve
            if @user.can_list_beast
              @items
            else
              @items.none
            end
          end
        end
      end

      class SecretBeastPolicy < BasePolicy
        def has_secret?
          @user.has_secret
        end

        # This is the method for the object type
        alias :beast_viewer? :has_secret?
      end

      class CustomMeasureBeastNamePolicy < BasePolicy
        def measure_beast_name_custom?
          @user.custom_policy_mutation_can_view_beast
        end
      end

      class SpookyThingPolicy < BasePolicy
        class Scope
          def initialize(user, items)
            @user = user
            @items = items
          end

          def resolve
            @items.to_a.reject { |d| d.is_a?(Data::Lair) }
          end
        end
      end

      class SpookyThingCustomPolicy < BasePolicy
        class Scope
          def initialize(user, items)
            @user = user
            @items = items
          end

          def resolve
            beasts = @items.to_a.reject { |d| d.is_a?(Data::Lair) }
            beasts << PunditBeast.new(name: "Gojira", nickname: nil)
            beasts
          end
        end
      end

      class NamedThingPolicy < BasePolicy
        class Scope
          def initialize(user, items)
            @user = user
            @items = items
          end

          def resolve
            beasts = @items.to_a.reject { |d| d.is_a?(Data::Lair) }
            beasts << PunditBeast.new(name: "Kraken", nickname: nil)
            beasts
          end
        end
      end

      class NamedThingCustomPolicy < BasePolicy
        class Scope
          def initialize(user, items)
            @user = user
            @items = items
          end

          def resolve
            beasts = @items.to_a.reject { |d| d.is_a?(Data::Lair) }
            # Add a unique beast back in
            beasts << PunditBeast.new(name: "Godzilla", nickname: nil)
            beasts
          end
        end
      end

      class CustomFindAdderPolicy < BasePolicy
        def adder?
          @user.can_add
        end

        def lhs_adder?
          @user.can_add_lhs
        end

        def rhs_adder?
          @user.can_add_rhs
        end
      end
    end

    module CustomPunditPolicyLookup
      def pundit_policy(context, object)
        # Allow explicit overrides:
        if pundit_policy_class
          super
        elsif object.is_a?(Data::PunditBeast)
          Data::CustomFindBeastPolicy.new(context[:current_user], object)
        else
          super
        end
      end

      def scope_by_pundit_policy(context, items)
        if context[:use_default_scoping]
          super
        elsif items.is_a?(ActiveRecord::Relation) && items.model == Data::PunditBeast
          scope = Data::CustomFindBeastPolicy::Scope.new(context[:current_user], items)
          scope.resolve
        else
          super
        end
      end
    end

    class BaseArgument < GraphQL::Schema::Argument
      include GraphQL::Pro::PunditIntegration::ArgumentIntegration
      pundit_role nil
      include CustomPunditPolicyLookup

      def authorized?(obj, value, ctx)
        ctx[:authorize_argument_calls] ||= Hash.new(0)
        result = super
      ensure
        if result.nil?
          # An error was raised
          result = false
        end
        ctx[:authorize_argument_calls][result] += 1
      end
    end

    class BaseFieldWithoutRole < GraphQL::Schema::Field
      include GraphQL::Pro::PunditIntegration::FieldIntegration
      argument_class BaseArgument
      include CustomPunditPolicyLookup
    end

    class BaseField < BaseFieldWithoutRole
      pundit_role nil
    end

    class BaseObject < GraphQL::Schema::Object
      field_class BaseField
      include GraphQL::Pro::PunditIntegration::ObjectIntegration
      # don't set a base role -- want to test role missing below
      # pundit_role nil
      extend CustomPunditPolicyLookup
    end

    class BaseUnion < GraphQL::Schema::Union
      include GraphQL::Pro::PunditIntegration::UnionIntegration
      extend CustomPunditPolicyLookup
    end

    module BaseInterface
      include GraphQL::Schema::Interface
      include GraphQL::Pro::PunditIntegration::InterfaceIntegration
      definition_methods do
        include CustomPunditPolicyLookup
      end
    end

    module NamedThing
      include BaseInterface
      field :name, String, null: true
    end

    module NamedThingCustomPolicy
      include BaseInterface
      pundit_policy_class Data::NamedThingCustomPolicy
      field :name, String, null: true
    end

    class Whereabouts < BaseObject
      pundit_role nil
      field :description, String, null: false
    end

    class Beast < BaseObject
      pundit_role :beast_viewer
      implements NamedThing
      implements NamedThingCustomPolicy
      field :name, String, null: false
      field :nickname, String, null: false
      field :current_whereabouts, Whereabouts, null: true, pundit_role: :beast_tracker
      field :query_class_name, String, null: false
      def query_class_name
        # This is to make sure that context isn't `#to_h`'d
        context.query.class.name
      end
    end

    class FieldWithRole < BaseField
      pundit_role :field_viewer
    end

    class BeastWithCustomField < Beast
      field_class FieldWithRole
      field :current_whereabouts_with_field_role, Whereabouts, null: true, method: :current_whereabouts
      field :current_whereabouts_with_field_role_and_override, Whereabouts, null: true, method: :current_whereabouts, pundit_role: nil
    end

    class BeastWithCustomPolicyClass < Beast
      pundit_policy_class "GraphQLProPunditIntegrationTest::PunditIntegrationSchema::Data::CustomPolicyClass"
    end

    class BeastWithoutScopeClass < Beast
      pundit_policy_class "GraphQLProPunditIntegrationTest::PunditIntegrationSchema::Data::CustomPolicyClassWithoutScope"
    end

    class BeastWithInheritedCustomPolicyClass < BeastWithCustomPolicyClass
    end

    class BeastWithOverriddenCustomPolicyClass < BeastWithCustomPolicyClass
      pundit_policy_class nil
    end

    class BeastWithInheritedRole < Beast
    end

    class BeastWithOptOut < Beast
      pundit_role nil
    end

    class BeastWithInheritedOptOut < BeastWithOptOut
    end

    class BeastWithOverriddenPolicyClass < Beast
      pundit_policy_class Data::SecretBeastPolicy
      field :secret_nickname, String, null: false, pundit_role: :has_secret, method: :nickname
    end

    class Lair < BaseObject
      # Missing a role
      implements NamedThing
      implements NamedThingCustomPolicy
      field :name, String, null: false
    end

    class LairWithMissingPolicy < Lair
      pundit_role :lair_viewer
    end

    class FieldWithoutRoleObject < BaseObject
      field :field_without_role, Integer, null: true
    end

    class SpookyThing < BaseUnion
      possible_types Lair, Beast
    end

    class SpookyThingCustomPolicy < BaseUnion
      pundit_policy_class Data::SpookyThingCustomPolicy
      possible_types Lair, Beast
    end

    class BaseResolver < GraphQL::Schema::Resolver
      argument_class BaseArgument
      include GraphQL::Pro::PunditIntegration::ResolverIntegration
    end

    class AddResolver < BaseResolver
      pundit_role(:adder)
      pundit_policy_class(Data::CustomFindAdderPolicy)
      argument :lhs, Integer, required: true, pundit_role: :lhs_adder, pundit_policy_class: Data::CustomFindAdderPolicy
      argument :rhs, Integer, required: true, pundit_role: :rhs_adder, pundit_policy_class: Data::CustomFindAdderPolicy
      type Integer, null: true
      def resolve(lhs:, rhs:)
        lhs + rhs
      end
    end

    class Query < BaseObject
      FIELD_ALIAS_KEYWORD = GRAPHQL_19_PLUS ? :resolver_method : :method
      pundit_role nil
      def self.lookup_item_field(data_class, name, return_type, **field_options)
        field name, return_type, null: true, **field_options do
          argument :name, String, required: true
        end

        define_method(name) do |kwargs|
          data_class.find(kwargs[:name])
        end
      end

      lookup_item_field(Data::PunditBeast, :beast, Beast)
      lookup_item_field(Data::PunditBeast, :beast_with_custom_policy_class, BeastWithCustomPolicyClass)
      lookup_item_field(Data::PunditBeast, :beast_with_inherited_custom_policy_class, BeastWithInheritedCustomPolicyClass)
      lookup_item_field(Data::PunditBeast, :beast_with_overridden_custom_policy_class, BeastWithOverriddenCustomPolicyClass)
      lookup_item_field(Data::PunditBeast, :beast_with_inherited_role, BeastWithInheritedRole)
      lookup_item_field(Data::PunditBeast, :beast_with_opt_out, BeastWithOptOut)
      lookup_item_field(Data::PunditBeast, :beast_with_inherited_opt_out, BeastWithInheritedOptOut)
      lookup_item_field(Data::PunditBeast, :beast_with_custom_field, BeastWithCustomField)
      lookup_item_field(Data::PunditBeast, :beast_with_overridden_policy_class, BeastWithOverriddenPolicyClass)

      field :beasts, [Beast], null: false

      def beasts
        Data::PunditBeast.all
      end

      field :null_beasts, [Beast], null: true

      def null_beasts
        nil
      end

      field :beasts_without_scope, [Beast], null: false, scope: false, FIELD_ALIAS_KEYWORD => :beasts
      field :beasts_connection, Beast.connection_type, null: false

      def beasts_connection
        GraphQL::Execution::Lazy.new { beasts }
      end

      field :beasts_connection_with_string, BeastWithCustomPolicyClass.connection_type, null: false,
        FIELD_ALIAS_KEYWORD => :beasts

      field :eager_beasts_connection, Beast.connection_type, null: false

      def eager_beasts_connection
        beasts
      end

      field :beasts_array, [Beast], null: false

      def beasts_array
        Data::PunditBeast.all.to_a
      end

      field :beasts_array_with_opt_out, [Beast], scope: false , resolver_method: :beasts_array

      field :beasts_with_custom_policy_array, [BeastWithCustomPolicyClass], resolver_method: :beasts_array

      field :hash_beasts_with_custom_policy_array, [BeastWithCustomPolicyClass]
      def hash_beasts_with_custom_policy_array
        [
          {
            name: "Frankenstein's Monster",
            nickname: "Frank",
          }
        ]
      end

      field :beasts_array_without_scope_class, [BeastWithoutScopeClass], resolver_method: :beasts_array

      lookup_item_field(Data::Lair, :lair, Lair)
      lookup_item_field(Data::Lair, :lair_with_missing_policy, LairWithMissingPolicy)
      field :lairs, [Lair], null: true

      def lairs
        Data::Lair.all
      end

      field :field_without_role_object, FieldWithoutRoleObject, null: false

      def field_without_role_object
        {}
      end

      field :add, Integer, null: true, pundit_role: :adder, pundit_policy_class: Data::CustomFindAdderPolicy do
        argument :lhs, Integer, required: true, pundit_role: :lhs_adder, pundit_policy_class: Data::CustomFindAdderPolicy
        argument :rhs, Integer, required: true, pundit_role: :rhs_adder, pundit_policy_class: Data::CustomFindAdderPolicy
      end

      def add(lhs:, rhs:)
        lhs + rhs
      end

      field :add2, mutation: AddResolver

      field :spooky_things, [SpookyThing], null: true

      def spooky_things
        Data::Relation.new(Data::Lair::LAIRS + Data::PunditBeast.all, model_name: "GraphQLProPunditIntegrationTest::PunditIntegrationSchema::Data::SpookyThing")
      end

      field :spooky_things_custom_policy, [SpookyThingCustomPolicy], null: true, resolver_method: :spooky_things

      field :named_things, [NamedThing], null: true

      def named_things
        Data::Relation.new(Data::Lair::LAIRS + Data::PunditBeast.all, model_name: "GraphQLProPunditIntegrationTest::PunditIntegrationSchema::Data::NamedThing")
      end

      field :named_things_custom_policy, [NamedThingCustomPolicy], null: true, resolver_method: :named_things

      field :skip, Beast, null: true

      def skip
        context.skip
      end

      field :custom_policy_class, String, null: true,
        pundit_role: :custom_role,
        pundit_policy_class: "GraphQLProPunditIntegrationTest::PunditIntegrationSchema::Data::CustomPolicyClass"

      def custom_policy_class
        "👍"
      end
    end

    class BaseMutationPayload < BaseObject
      pundit_role nil
    end

    class BaseMutation < GraphQL::Schema::RelayClassicMutation
      include GraphQL::Pro::PunditIntegration::MutationIntegration
      argument_class BaseArgument
      field_class BaseField
      object_class BaseMutationPayload
      pundit_role nil
    end

    class MeasureBeastName < BaseMutation
      argument :beast_id, String, required: true, loads: Beast
      argument :without_vowels, Boolean, default_value: false, required: false, pundit_role: :vowel_filter
      argument :never_attempted, Boolean, required: false, pundit_role: :this_should_not_be_implemented_or_raise_an_error
      field :size, Integer, null: true

      def policy_class
        Class.new(Data::BasePolicy) do
          def vowel_filter?
            @user.can_remove_vowels
          end
        end
      end

      def resolve(beast:, without_vowels:)
        name = if without_vowels
          beast.name.gsub(/[ioeau]/i, "")
        else
          beast.name
        end
        # No side-effect, just want to make sure it was reached
        {size: name.size}
      end
    end

    class MeasureBeastNames < BaseMutation
      argument :beast_ids, [ID], required: true, loads: Beast,
        pundit_role: :measure_plural,
        pundit_policy_class: Data::CustomFindBeastPolicy
      field :sizes, [Int], null: false

      def resolve(beasts:)
        {
          sizes: beasts.map { |b| b.name.size },
        }
      end
    end

    class MeasureBeastNamesByDefault < BaseMutation
      argument :beast_ids, [ID], required: true, loads: Beast
      field :sizes, [Int], null: false

      def load_beasts(ids)
        Data::PunditBeast.where(name: ids)
      end

      def resolve(beasts:)
        {
          sizes: beasts.map { |b| b.name.size },
        }
      end
    end

    class MeasureBeastNameCustomPolicy < BaseMutation
      argument :beast_id, String, required: true, loads: Beast
      field :size, Integer, null: true

      pundit_policy_class Data::CustomMeasureBeastNamePolicy
      pundit_role :measure_beast_name_custom

      def resolve(beast:)
        # Add 10 so we're sure it's going through here
        { size: beast.name.size + 10 }
      end
    end

    class AddBeastNames < BaseMutation
      argument :left_beast_id, String, required: true, loads: Beast, pundit_role: :left_beast
      argument :right_beast_id, String, required: true, loads: Beast, pundit_role: :right_beast
      field :size, Integer, null: true

      def resolve(left_beast:, right_beast:)
        {size: left_beast.name.size + right_beast.name.size}
      end
    end

    class PreviewBeast < BaseMutation
      pundit_role :preview_beast
      argument :name, String, required: true
      field :beast, Beast, null: true

      def resolve(name:)
        {beast: Data::PunditBeast.new(name: name, nickname: "")}
      end
    end

    class PreviewBeastPolicy < Data::BasePolicy
      def preview_beast?
        @user.preview_beast
      end

      def preview_beast_custom?
        @user.preview_beast_custom
      end
    end

    # Add an inherited class but an overriden role below
    class PreviewBeastOverride < PreviewBeast
      pundit_policy_class PreviewBeastPolicy
      pundit_role :bogus
    end

    class PreviewBeastCustom < PreviewBeastOverride
      pundit_role :preview_beast_custom
    end

    class PreviewBeastWithErrors < PreviewBeast
      def self.policy_class
        self.const_get(:Policy)
      end

      # Test that .policy_class is used
      class Policy < PreviewBeastPolicy
      end

      field :errors, [String], null: true

      def unauthorized_by_pundit(owner, value)
        {errors: ["#{owner.path} requires #{owner.pundit_role} for #{value.inspect}"]}
      end
    end

    class BasePlainMutation < GraphQL::Schema::Mutation
      include GraphQL::Pro::PunditIntegration::MutationIntegration
      argument_class BaseArgument
      field_class BaseField
      object_class BaseMutationPayload
      pundit_role nil
    end

    class BaseInputObject < GraphQL::Schema::InputObject
      argument_class BaseArgument
    end

    class AddInputs < BasePlainMutation
      argument :input1, Integer, required: false, pundit_role: :addable
      argument :input2, Integer, required: false, pundit_role: :addable
      field :result, Integer, null: false

      def self.pundit_policy_class
        Class.new(Data::BasePolicy) do
          def addable?; @user.addable; end
        end
      end

      def resolve(input1: nil, input2: nil)
        {result: (input1 || 0) + (input2 || 0)}
      end
    end

    class ExplicitInputs < BaseInputObject
      class ExplicitAddablePolicy
        def initialize(user, value)
          @user = user
        end

        def explicit_addable?
          @user.explicit_addable
        end
      end

      argument :left, Integer, required: true, pundit_role: :explicit_addable, pundit_policy_class: ExplicitAddablePolicy
      argument :right, Integer, required: true, pundit_role: :explicit_addable, pundit_policy_class: ExplicitAddablePolicy
    end

    class AddExplicitInputs < BasePlainMutation
      pundit_role nil
      argument :inputs, ExplicitInputs, required: true
      field :result, Integer, null: true
      field :errors, [String], null: true

      def resolve(inputs:)
        {
          result: inputs[:left] + inputs[:right]
        }
      end

      def unauthorized_by_pundit(owner, value)
        { errors: ["Unauthorized: #{owner.class}, #{value.class}"] }
      end
    end

    class AddBeastNamesManualInput < BaseInputObject
      # This is required in 1.9 where the object isn't passed through:
      extra_options = GRAPHQL_110_PLUS ? {} : { pundit_policy_class: Data::CustomFindBeastPolicy }

      argument :left_beast_id, ID, required: true,
        loads: Beast,
        pundit_role: :left_beast, **extra_options
      argument :right_beast_id, ID, required: true,
        loads: Beast,
        pundit_role: :right_beast, **extra_options
    end

    # Just like AddBeastNames above, but not relay
    class AddBeastNamesWithManualInputObject < BasePlainMutation
      argument :input, AddBeastNamesManualInput, required: true
      field :size, Integer, null: true

      def resolve(input:)
        left_beast = input[:left_beast]
        right_beast = input[:right_beast]
        {size: left_beast.name.size + right_beast.name.size}
      end
    end

    # Just like AddBeastNames above, but not relay
    class AddBeastNamesWithoutRelay < BasePlainMutation
      argument :left_beast_id, ID, required: true,
        loads: Beast,
        pundit_role: :left_beast
      argument :right_beast_id, ID, required: true, loads: Beast, pundit_role: :right_beast
      field :size, Integer, null: true

      def resolve(left_beast:, right_beast:)
        {size: left_beast.name.size + right_beast.name.size}
      end
    end

    class MutationRoot < BaseObject
      pundit_role nil
      # Make sure that the type's role is called
      field :measure_beast_name, mutation: MeasureBeastName
      field :measure_beast_names, mutation: MeasureBeastNames
      field :measure_beast_names_by_default, mutation: MeasureBeastNamesByDefault
      field :measure_beast_name_custom_policy, mutation: MeasureBeastNameCustomPolicy
      # Make sure that either fail can halt; both passes allow continuing
      field :add_beast_names, mutation: AddBeastNames
      # Has a mutation-level policy
      field :preview_beast, mutation: PreviewBeast
      field :preview_beast_custom, mutation: PreviewBeastCustom
      # Returns errors as data:
      field :preview_beast_with_errors, mutation: PreviewBeastWithErrors
      # Test a non-relay-classic mutation
      field :add_inputs, mutation: AddInputs
      field :add_explicit_inputs, mutation: AddExplicitInputs
      field :add_beast_names_without_relay, mutation: AddBeastNamesWithoutRelay
      field :add_beast_names_with_manual_input_object, mutation: AddBeastNamesWithManualInputObject
    end

    query(Query)
    mutation(MutationRoot)

    def self.unauthorized_object(err)
      raise GraphQL::ExecutionError, "Unauthorized #{err.object.class.name.split("::").last.downcase} for #{err.type.graphql_name}"
    end

    def self.object_from_id(id, ctx)
      Data::PunditBeast.find(id)
    end

    def self.resolve_type(type, obj, ctx)
      if obj.is_a?(Data::PunditBeast)
        Beast
      elsif obj.is_a?(Data::Lair)
        Lair
      else
        raise "Dunno what to do with: #{obj}"
      end
    end
  end

  def exec_query(*args, **opts)
    PunditIntegrationSchema.execute(*args, **opts)
  end

  def user(opts = {})
    OpenStruct.new(opts)
  end

  def test_it_routes_failed_checks_to_the_handler
    query_str = <<-GRAPHQL
    {
      beast(name: "Loch Ness Monster") {
        __typename
        nickname
      }
    }
    GRAPHQL

    res = exec_query(query_str, context: {current_user: user(can_view_beast: true)})
    assert_equal "Beast", res["data"]["beast"]["__typename"]
    assert_equal "Nessie", res["data"]["beast"]["nickname"]

    res = exec_query(query_str, context: {current_user: user(can_view_beast: false)})
    assert_nil res["data"].fetch("beast")
    assert_equal ["Unauthorized punditbeast for Beast"], res["errors"].map { |e| e["message"] }
  end

  def test_it_doesnt_hashify_context
    query_str = <<-GRAPHQL
    {
      beast(name: "Loch Ness Monster") {
        queryClassName
      }
    }
    GRAPHQL

    res = exec_query(query_str, context: {current_user: user(can_view_beast: true)})
    assert_equal "GraphQL::Query", res["data"]["beast"]["queryClassName"]
  end

  def test_it_raises_role_missing_when_no_role_was_configured
    query_str = <<-GRAPHQL
    {
      lair(name: "Loch Ness") {
        __typename
        name
      }
    }
    GRAPHQL

    assert_raises GraphQL::Pro::PunditIntegration::RoleNotConfiguredError do
      exec_query(query_str)
    end
  end

  def test_it_raises_policy_missing_when_no_policy_found
    query_str = <<-GRAPHQL
    {
      lairWithMissingPolicy(name: "Loch Ness") {
        __typename
        name
      }
    }
    GRAPHQL

    assert_raises GraphQL::Pro::PunditIntegration::PolicyNotFoundError do
      exec_query(query_str)
    end
  end

  def test_it_uses_inherited_roles
    query_str = <<-GRAPHQL
    {
      beastWithInheritedRole(name: "Loch Ness Monster") {
        __typename
        nickname
      }
    }
    GRAPHQL

    res = exec_query(query_str, context: {current_user: user(can_view_beast: true)})
    assert_equal "BeastWithInheritedRole", res["data"]["beastWithInheritedRole"]["__typename"]
    assert_equal "Nessie", res["data"]["beastWithInheritedRole"]["nickname"]

    res = exec_query(query_str, context: {current_user: user(can_view_beast: false)})
    assert_nil res["data"].fetch("beastWithInheritedRole")
    assert_equal ["Unauthorized punditbeast for BeastWithInheritedRole"], res["errors"].map { |e| e["message"] }
  end

  def test_it_uses_owner_class_for_fields
    query_str = <<-GRAPHQL
    {
      beastWithOverriddenPolicyClass(name: "Loch Ness Monster") {
        secretNickname
      }
    }
    GRAPHQL

    auth_res = exec_query(query_str, context: { current_user: user(has_secret: true) })
    assert_equal "Nessie", auth_res["data"].fetch("beastWithOverriddenPolicyClass").fetch("secretNickname")

    unauth_res = exec_query(query_str, context: { current_user: user(has_secret: false) })
    assert_nil unauth_res["data"].fetch("beastWithOverriddenPolicyClass")
  end

  def test_it_works_with_input_objects
    if Gem::Version.new(GraphQL::VERSION) < Gem::Version.new("1.10.0")
      skip "1.10+ only"
    end

    query_str = <<-GRAPHQL
    mutation {
      addExplicitInputs(inputs: {left: 1, right: 2}) { result errors }
    }
    GRAPHQL

    unauth_res = exec_query(query_str, context: { current_user: user })
    assert_nil unauth_res["data"]["addExplicitInputs"].fetch("result")
    assert_equal ["Unauthorized: GraphQLProPunditIntegrationTest::PunditIntegrationSchema::BaseArgument, GraphQLProPunditIntegrationTest::PunditIntegrationSchema::ExplicitInputs"], unauth_res["data"]["addExplicitInputs"]["errors"]

    auth_res = exec_query(query_str, context: { current_user: user(explicit_addable: true) })
    assert_equal 3, auth_res["data"]["addExplicitInputs"]["result"]
  end

  def test_it_uses_custom_policy_class_for_object
    query_str = <<-GRAPHQL
    {
      beastWithCustomPolicyClass(name: "Loch Ness Monster") {
        __typename
      }
    }
    GRAPHQL

    unauth_res = exec_query(query_str, context: { current_user: user(has_custom_beast_viewer: false) })
    assert_nil unauth_res["data"].fetch("beastWithCustomPolicyClass")

    auth_res = exec_query(query_str, context: { current_user: user(has_custom_beast_viewer: true) })
    assert_equal "BeastWithCustomPolicyClass", auth_res["data"].fetch("beastWithCustomPolicyClass").fetch("__typename")
  end

  def test_it_uses_object_policy_when_loading_input_object_type
    if Gem::Version.new(GraphQL::VERSION) < Gem::Version.new("1.10.0")
      skip "1.10+ only"
    end

    query_str = <<-GRAPHQL
    mutation {
      addBeastNamesWithManualInputObject(input: { rightBeastId: "Sasquatch", leftBeastId: "Loch Ness Monster" }) {
        size
      }
    }
    GRAPHQL

    # No permissions
    res = exec_query(query_str, context: {current_user: user})
    assert_nil res["data"]["addBeastNamesWithManualInputObject"]
    assert_equal ["Unauthorized punditbeast for Beast"], res["errors"].map { |e| e["message"] }

    # Mixed permissions
    res = exec_query(query_str, context: {current_user: user(can_view_beast: true, can_left_beast: true)})
    err_message = res["errors"].first["message"]
    assert_equal "Unauthorized addbeastnamesmanualinput for input", err_message, "It calls the schema hook"

    res = exec_query(query_str, context: {current_user: user(can_view_beast: true, can_right_beast: true)})
    err_message = res["errors"].first["message"]
    assert_equal "Unauthorized addbeastnamesmanualinput for input", err_message, "It calls the schema hook"

    # All permissions
    res = exec_query(query_str, context: {current_user: user(can_view_beast: true, can_left_beast: true, can_right_beast: true)})
    assert_equal 26, res["data"]["addBeastNamesWithManualInputObject"]["size"]
  end

  def test_it_uses_inherited_policy_classes
    query_str = <<-GRAPHQL
    {
      beastWithInheritedCustomPolicyClass(name: "Loch Ness Monster") {
        __typename
      }
    }
    GRAPHQL

    unauth_res = exec_query(query_str, context: { current_user: user(has_custom_beast_viewer: false) })
    assert_nil unauth_res["data"].fetch("beastWithInheritedCustomPolicyClass")

    auth_res = exec_query(query_str, context: { current_user: user(has_custom_beast_viewer: true) })
    assert_equal "BeastWithInheritedCustomPolicyClass", auth_res["data"].fetch("beastWithInheritedCustomPolicyClass").fetch("__typename")
  end

  def test_it_uses_overriden_policy_classes
    # This one will use the default lookup to find PunditBeastPolicy,
    # so it switches on `can_view_beast`
    query_str = <<-GRAPHQL
    {
      beastWithOverriddenCustomPolicyClass(name: "Loch Ness Monster") {
        __typename
      }
    }
    GRAPHQL

    unauth_res = exec_query(query_str, context: { current_user: user(can_view_beast: false) })
    assert_nil unauth_res["data"].fetch("beastWithOverriddenCustomPolicyClass")

    auth_res = exec_query(query_str, context: { current_user: user(can_view_beast: true) })
    assert_equal "BeastWithOverriddenCustomPolicyClass", auth_res["data"].fetch("beastWithOverriddenCustomPolicyClass").fetch("__typename")
  end

  def test_it_opts_out_with_nil
    query_str = <<-GRAPHQL
    {
      beastWithOptOut(name: "Loch Ness Monster") {
        __typename
        nickname
      }
    }
    GRAPHQL

    res = exec_query(query_str, context: {current_user: nil})
    assert_equal "BeastWithOptOut", res["data"]["beastWithOptOut"]["__typename"]
    assert_equal "Nessie", res["data"]["beastWithOptOut"]["nickname"]
  end

  def test_it_inherits_nil_opt_out
    query_str = <<-GRAPHQL
    {
      beastWithInheritedOptOut(name: "Loch Ness Monster") {
        __typename
        nickname
      }
    }
    GRAPHQL

    res = exec_query(query_str, context: {current_user: nil})
    assert_equal "BeastWithInheritedOptOut", res["data"]["beastWithInheritedOptOut"]["__typename"]
    assert_equal "Nessie", res["data"]["beastWithInheritedOptOut"]["nickname"]
  end

  def test_it_has_field_level_policy
    query_str = <<-GRAPHQL
    {
      beast(name: "Sasquatch") {
        currentWhereabouts {
          description
        }
      }
    }
    GRAPHQL

    assert_equal :beast_tracker, PunditIntegrationSchema::Beast.fields["currentWhereabouts"].pundit_role
    # Unauthorized:
    res = exec_query(query_str, context: {current_user: user(can_view_beast: true)})
    assert_nil res["data"]["beast"]["currentWhereabouts"]

    # Authorized:
    res = exec_query(query_str, context: {current_user: user(can_view_beast: true, can_track_beast: true)})
    assert_equal "The Great White North", res["data"]["beast"]["currentWhereabouts"]["description"]
  end

  def test_it_has_field_level_policy_class
    query_str = <<-GRAPHQL
    {
      customPolicyClass
    }
    GRAPHQL

    # Unauthorized
    res = exec_query(query_str, root_value: 1, context: { current_user: user(has_custom_role: false)})
    assert_nil res["data"].fetch("customPolicyClass")

    # Authorized
    res = exec_query(query_str, root_value: 1, context: { current_user: user(has_custom_role: true)})
    assert_equal "👍", res["data"].fetch("customPolicyClass")
  end

  def test_it_can_inherit_field_policies_from_field_class
    query_str = <<-GRAPHQL
    {
      beastWithCustomField(name: "Sasquatch") {
        currentWhereaboutsWithFieldRole {
          description
        }
      }
    }
    GRAPHQL

    assert_equal :field_viewer, PunditIntegrationSchema::BeastWithCustomField.fields["currentWhereaboutsWithFieldRole"].pundit_role

    # Unauthorized:
    res = exec_query(query_str, context: {current_user: user(can_view_beast: true)})
    assert_nil res["data"]["beastWithCustomField"]["currentWhereaboutsWithFieldRole"]
    # Authorized:
    res = exec_query(query_str, context: {current_user: user(can_view_beast: true, can_view_fields: true)})
    assert_equal "The Great White North", res["data"]["beastWithCustomField"]["currentWhereaboutsWithFieldRole"]["description"]
  end

  def test_it_can_override_inherited_field_class_policies
    query_str = <<-GRAPHQL
    {
      beastWithCustomField(name: "Sasquatch") {
        currentWhereaboutsWithFieldRoleAndOverride {
          description
        }
      }
    }
    GRAPHQL
    assert_nil PunditIntegrationSchema::BeastWithCustomField.fields["currentWhereaboutsWithFieldRoleAndOverride"].pundit_role

    # Authorized since override is nil:
    res = exec_query(query_str, context: {current_user: user(can_view_beast: true)})
    assert_equal "The Great White North", res["data"]["beastWithCustomField"]["currentWhereaboutsWithFieldRoleAndOverride"]["description"]
  end

  def test_scopes_are_applied_to_lists
    query_str = <<-GRAPHQL
    {
      beasts {
        nickname
      }
    }
    GRAPHQL

    res = exec_query(query_str, context: {
                                  current_user: user(
                                    can_view_beast: true,
                                    can_list_beast: true,
                                  ),
                                })
    assert_equal ["Big Foot", "Nessie"], res["data"]["beasts"].map { |b| b["nickname"] }

    res = exec_query(query_str, context: {
                                  current_user: user(
                                    # This causes the scope to lock down:
                                    can_list_beast: false,
                                    # This would add errors ... _except_
                                    # that the list was already filtered by this point.
                                    can_view_beast: false,
                                  ),
                                })
    # Scope was applied before authorization, so no errors:
    assert_equal [], res.fetch("data").fetch("beasts")
    refute res.key?("errors")
  end

  def test_scoping_nil_returns_nil
    query_str = <<-GRAPHQL
    {
      nullBeasts {
        nickname
      }
    }
    GRAPHQL

    res = exec_query(query_str)
    refute res.key?("errors")
    assert_nil res["data"]["nullBeasts"]
  end

  def test_scopes_can_be_opted_out_of
    query_str = <<-GRAPHQL
    {
      beastsWithoutScope {
        nickname
      }
      beasts {
        nickname
      }
    }
    GRAPHQL

    # This user has permission to view each one (`can_view_beast`),
    # just so that later errors don't kick in.
    # It doesn't have permission to read the list, so one case is filtered.
    res = exec_query(query_str, context: {
                                  current_user: user(
                                    can_list_beast: false,
                                    can_view_beast: true,
                                  ),
                                })
    assert_equal ["Big Foot", "Nessie"], res["data"]["beastsWithoutScope"].map { |b| b["nickname"] }
    assert_equal [], res["data"]["beasts"]
  end

  def test_arrays_are_not_scoped
    err = assert_raises GraphQL::Pro::PunditIntegration::PolicyNotFoundError do
      exec_query("{ beastsArray { nickname } }", context: {
        current_user: user(
          can_view_beast: true,
          can_list_beast: true,
        ),
      })
    end

    expected_message = <<~ERR
      No policy found for:

      - Type: Beast
      - Runtime value: `[#<GraphQLProPunditIntegrationTest::PunditIntegrationSchema::Data::PunditBeast id: 1, name: \"Sasquatch\", nickname: \"Big Foot\", current_whereabouts_description: \"The Great White North\">, #<GraphQLProPunditIntegrationTest::PunditIntegrationSchema::Data::PunditBeast id: 2, name: \"Loch Ness Monster\", nickname: \"Nessie\", current_whereabouts_description: \"Depths of Loch Ness\">]`

      Since this value is an **Array**, Pundit can't find a scope for it. To fix this:

      - Configure a policy class with `pundit_policy_class` in the definition for `Beast`
      - Or, skip scoping by adding `scope: false` to the field definition

    ERR

    assert_equal expected_message, err.message.first(expected_message.length)

    auth_res = exec_query(" { beastsWithCustomPolicyArray { nickname } }", context: { current_user: user(has_custom_beast_viewer: true, can_list_beast: true) })
    assert_equal  ["Big Foot", "Nessie"], auth_res["data"]["beastsWithCustomPolicyArray"].map { |b| b["nickname"] }

    # `scope: false`
    opt_out_res = exec_query(" { beastsArrayWithOptOut { nickname } }", context: { current_user: user(can_view_beast: true) })
    assert_equal  ["Big Foot", "Nessie"], opt_out_res["data"]["beastsArrayWithOptOut"].map { |b| b["nickname"] }

    # Examples with Hash instead of application objects
    hash_example_res = exec_query(" { hashBeastsWithCustomPolicyArray { nickname } }", context: { current_user: user(has_custom_beast_viewer: true, can_list_beast: true) })
    assert_equal  ["Frank"], hash_example_res["data"]["hashBeastsWithCustomPolicyArray"].map { |b| b["nickname"] }
    hash_unauth_example_res = exec_query(" { hashBeastsWithCustomPolicyArray { nickname } }", context: { current_user: user(has_custom_beast_viewer: true, can_list_beast: false) })
    assert_equal [], hash_unauth_example_res["data"]["hashBeastsWithCustomPolicyArray"].map { |b| b["nickname"] }

    err = assert_raises GraphQL::Pro::PunditIntegration::PolicyNotFoundError do
     exec_query("{ beastsArrayWithoutScopeClass { nickname } }")
    end

    expected_message = "No scope found for:

- Type: BeastWithoutScopeClass
- Runtime value: `[#<GraphQLProPunditIntegrationTest::PunditIntegrationSchema::Data::PunditBeast id: 1, name: \"Sasquatch\", nickname: \"Big Foot\", current_whereabouts_description: \"The Great White North\">, #<GraphQLProPunditIntegrationTest::PunditIntegrationSchema::Data::PunditBeast id: 2, name: \"Loch Ness Monster\", nickname: \"Nessie\", current_whereabouts_description: \"Depths of Loch Ness\">]`

This policy needs a nested `Scope` class. Define `Scope` as a Pundit scope class: https://github.com/varvet/pundit#scopes

Or, skip scoping by adding `scope: false` to the field definition.


Pundit error: NameError, uninitialized constant GraphQLProPunditIntegrationTest::PunditIntegrationSchema::Data::CustomPolicyClassWithoutScope::Scope

              scope_class = custom_class::Scope
                                        ^^^^^^^
Did you mean?  ScoutApm
"
    assert_equal expected_message, err.message
  end

  def test_scopes_are_applied_to_eager_and_lazy_connections
    query_str = <<-GRAPHQL
    {
      beastsConnection {
        nodes {
          nickname
        }
        edges {
          node {
            nickname
          }
        }
      }

      eagerBeastsConnection {
        nodes {
          nickname
        }
        edges {
          node {
            nickname
          }
        }
      }
    }
    GRAPHQL

    res = exec_query(query_str, context: {
                                  current_user: user(
                                    can_view_beast: true,
                                    can_list_beast: true,
                                  ),
                                })
    all_nicknames = ["Big Foot", "Nessie"]
    assert_equal all_nicknames, res["data"]["beastsConnection"]["nodes"].map { |b| b["nickname"] }
    assert_equal all_nicknames, res["data"]["beastsConnection"]["edges"].map { |e| e["node"]["nickname"] }

    assert_equal all_nicknames, res["data"]["eagerBeastsConnection"]["nodes"].map { |b| b["nickname"] }
    assert_equal all_nicknames, res["data"]["eagerBeastsConnection"]["edges"].map { |e| e["node"]["nickname"] }

    res = exec_query(query_str, context: {
                                  current_user: user(
                                    can_list_beast: false,
                                    can_view_beast: false, # this should have no effect, since they're scoped out
                                  ),
                                })

    assert_equal [], res["data"]["beastsConnection"]["nodes"]
    assert_equal [], res["data"]["beastsConnection"]["edges"]
  end

  def test_it_handles_string_policy_classes_with_connections
    query_str = <<-GRAPHQL
    {
      beastsConnectionWithString {
        nodes {
          nickname
        }
      }
    }
    GRAPHQL

    res = exec_query(query_str, context: {
      current_user: user(has_custom_beast_viewer: true, can_list_beast: true),
      use_default_scoping: true,
    })

    assert_equal ["Big Foot", "Nessie"], res["data"]["beastsConnectionWithString"]["nodes"].map { |n| n["nickname"] }

    unauth_res = exec_query(query_str, context: {
      current_user: user(has_custom_beast_viewer: true),
      use_default_scoping: true,
    })

    assert_equal [], unauth_res["data"]["beastsConnectionWithString"]["nodes"]
  end

  def test_it_raises_when_scope_is_not_found
    query_str = <<-GRAPHQL
    {
      lairs {
        name
      }
    }
    GRAPHQL

    err = assert_raises GraphQL::Pro::PunditIntegration::PolicyNotFoundError do
      exec_query(query_str, context: {current_user: user})
    end
    assert_includes err.message, "Type: Lair"
    assert_includes err.message, "- Runtime value: `#<GraphQLProPunditIntegrationTest::PunditIntegrationSchema::Data::Relation"
    assert_includes err.message, "unable to find scope `GraphQLProPunditIntegrationTest::PunditIntegrationSchema::Data::LairPolicy::Scope`"
  end

  def test_it_scopes_abstract_types
    query_str = <<-GRAPHQL
    {
      spookyThings {
        ... on Beast { name }
        ... on Lair { name }
      }
    }
    GRAPHQL

    res = exec_query(query_str, context: {current_user: user(can_list_beast: true, can_view_beast: true)})
    # Lairs are filtered out by the scope
    assert_equal [{"name" => "Sasquatch"}, {"name" => "Loch Ness Monster"}], res["data"]["spookyThings"]

    query_str = <<-GRAPHQL
    {
      namedThings {
        name
      }
    }
    GRAPHQL

    res = exec_query(query_str, context: {current_user: user(can_list_beast: true, can_view_beast: true)})
    # Lairs are filtered out by the scope, bonus item is added
    assert_equal [{"name" => "Sasquatch"}, {"name" => "Loch Ness Monster"}, {"name" => "Kraken"}], res["data"]["namedThings"]
  end

  def test_it_scopes_abstract_types_with_manual_pundit_policy_class
    query_str = <<-GRAPHQL
    {
      spookyThingsCustomPolicy {
        ... on Beast { name }
        ... on Lair { name }
      }
    }
    GRAPHQL

    res = exec_query(query_str, context: {current_user: user(can_list_beast: true, can_view_beast: true)})
    # Lairs are filtered out by the scope, bonus item is added
    assert_equal [{"name" => "Sasquatch"}, {"name" => "Loch Ness Monster"}, { "name" => "Gojira" }], res["data"]["spookyThingsCustomPolicy"]

    query_str = <<-GRAPHQL
    {
      namedThingsCustomPolicy {
        name
      }
    }
    GRAPHQL

    res = exec_query(query_str, context: {current_user: user(can_list_beast: true, can_view_beast: true)})
    # Lairs are filtered out by the scope, bonus item is added
    assert_equal [{"name" => "Sasquatch"}, {"name" => "Loch Ness Monster"}, {"name" => "Godzilla"}], res["data"]["namedThingsCustomPolicy"]
  end

  def test_introspection_works
    res = exec_query(GraphQL::Introspection::INTROSPECTION_QUERY)
    assert res.key?("data")
    refute res.key?("errors")
  end

  def test_it_raises_when_field_has_no_role
    query_str = <<-GRAPHQL
    {
      fieldWithoutRoleObject { fieldWithoutRole }
    }
    GRAPHQL

    assert_raises GraphQL::Pro::PunditIntegration::RoleNotConfiguredError do
      exec_query(query_str)
    end
  end

  def test_it_checks_type_role_for_mutations
    query_str = <<-GRAPHQL
    mutation {
      measureBeastName(input: {beastId: "Sasquatch"}) { size }
    }
    GRAPHQL

    res = exec_query(query_str, context: {current_user: user})
    assert_nil res["data"]["measureBeastName"]
    assert_equal ["Unauthorized punditbeast for Beast"], res["errors"].map { |e| e["message"] }

    res = exec_query(query_str, context: {current_user: user(can_view_beast: true)})
    assert_equal 9, res["data"]["measureBeastName"]["size"]
  end

  def test_it_uses_overriden_policy_class_for_mutation
    query_str = <<-GRAPHQL
    mutation {
      measureBeastNameCustomPolicy(input: {beastId: "Sasquatch"}) { size }
    }
    GRAPHQL

    res = exec_query(query_str, context: {current_user: user})
    assert_nil res["data"]["measureBeastName"]
    assert_equal ["Unauthorized measurebeastnamecustompolicy for MeasureBeastNameCustomPolicy"], res["errors"].map { |e| e["message"] }


    res2 = exec_query(query_str, context: {current_user: user(custom_policy_mutation_can_view_beast: true)})
    # Mutation was authorized, but the argument wasn't
    assert_equal ["Unauthorized punditbeast for Beast"], res2["errors"].map { |e| e["message"] }

    # It uses's `Beast`'s `pundit_policy_class` here, because `loads:`
    auth_res = exec_query(query_str, context: {current_user: user(custom_policy_mutation_can_view_beast: true, can_view_beast: true)})
    assert_equal 19, auth_res["data"]["measureBeastNameCustomPolicy"]["size"]
  end

  def test_it_checks_scalar_role_on_the_mutation_object
    query_str = <<-GRAPHQL
    mutation {
      measureBeastName(input: {beastId: "Sasquatch", withoutVowels: true}) { size }
    }
    GRAPHQL

    res = exec_query(query_str, context: {current_user: user(can_view_beast: true)})
    msg = "Unauthorized trueclass for withoutVowels"
    assert_equal msg, res["errors"].first["message"]

    res = exec_query(query_str, context: {current_user: user(can_view_beast: true, can_remove_vowels: true)})
    assert_equal 6, res["data"]["measureBeastName"]["size"]
  end

  def test_it_works_with_nil_arguments
    query_str = <<-GRAPHQL
    mutation {
      addInputs(input2: 5) { result }
    }
    GRAPHQL

    res = exec_query(query_str, context: {current_user: user(addable: true)})
    assert_equal 5, res["data"]["addInputs"]["result"]

    unauth_res = exec_query(query_str, context: {current_user: user})
    assert_nil unauth_res["data"].fetch("addInputs")
  end

  def test_it_tests_argument_role_for_mutations
    query_str = <<-GRAPHQL
    mutation {
      addBeastNames(input: { rightBeastId: "Sasquatch", leftBeastId: "Loch Ness Monster" }) {
        size
      }
    }
    GRAPHQL

    # No permissions
    res = exec_query(query_str, context: {current_user: user})
    assert_nil res["data"]["addBeastNames"]
    assert_equal ["Unauthorized punditbeast for Beast"], res["errors"].map { |e| e["message"] }
    assert_nil res.context[:authorize_argument_calls]

    # Mixed permissions
    res = exec_query(query_str, context: {current_user: user(can_view_beast: true, can_left_beast: true)})
    err_message = res["errors"].first["message"]
    assert_equal "Unauthorized punditbeast for rightBeastId", err_message, "It calls the schema hook"
    assert_equal 1, res.context[:authorize_argument_calls][true]
    assert_equal 1, res.context[:authorize_argument_calls][false]

    res = exec_query(query_str, context: {current_user: user(can_view_beast: true, can_right_beast: true)})
    err_message = res["errors"].first["message"]
    assert_equal "Unauthorized punditbeast for leftBeastId", err_message, "It calls the schema hook"
    assert_equal 1, res.context[:authorize_argument_calls][false]
    # This could be flaky; the order of `.authorized?` calls is undefined.
    # But it so happens that the other argument is checked first.
    refute res.context[:authorize_argument_calls].key?(true)

    # All permissions
    res = exec_query(query_str, context: {current_user: user(can_view_beast: true, can_left_beast: true, can_right_beast: true)})
    assert_equal 26, res["data"]["addBeastNames"]["size"]
    assert_equal 2, res.context[:authorize_argument_calls][true]
    refute res.context[:authorize_argument_calls].key?(false)
  end

  def test_it_tests_argument_role_for_mutations_when_load_misses
    query_str = <<-GRAPHQL
    mutation {
      addBeastNames(input: { rightBeastId: "T-Rex", leftBeastId: "Loch Ness Monster" }) {
        size
      }
    }
    GRAPHQL

    # All permissions
    res = exec_query(query_str, context: {current_user: user(can_view_beast: true, can_left_beast: true, can_right_beast: true)})
    assert_equal ["No object found for `rightBeastId: \"T-Rex\"`"], res["errors"].map { |e| e["message"] }
    assert_nil res["data"]["addBeastNames"]
  end

  def test_it_tests_argument_role_for_mutations_without_relay
    query_str = <<-GRAPHQL
    mutation {
      addBeastNamesWithoutRelay(rightBeastId: "Sasquatch", leftBeastId: "Loch Ness Monster") {
        size
      }
    }
    GRAPHQL

    # No permissions
    res = exec_query(query_str, context: {current_user: user})
    assert_nil res["data"]["addBeastNames"]
    assert_equal ["Unauthorized punditbeast for Beast"], res["errors"].map { |e| e["message"] }

    # Mixed permissions
    res = exec_query(query_str, context: {current_user: user(can_view_beast: true, can_left_beast: true)})
    err_message = res["errors"].first["message"]
    assert_equal "Unauthorized punditbeast for rightBeastId", err_message, "It calls the schema hook"

    res = exec_query(query_str, context: {current_user: user(can_view_beast: true, can_right_beast: true)})
    err_message = res["errors"].first["message"]
    assert_equal "Unauthorized punditbeast for leftBeastId", err_message, "It calls the schema hook"

    # All permissions
    res = exec_query(query_str, context: {current_user: user(can_view_beast: true, can_left_beast: true, can_right_beast: true)})
    assert_equal 26, res["data"]["addBeastNamesWithoutRelay"]["size"]
  end

  def test_it_uses_a_mutation_role
    query_str = <<-GRAPHQL
    mutation {
      previewBeast(input: { name: "Godzilla" }) {
        beast {
          name
        }
      }
    }
    GRAPHQL

    res = exec_query(query_str, context: {current_user: user(can_view_beast: true)})
    err_message = res["errors"].first["message"]
    assert_equal "Unauthorized previewbeast for PreviewBeast", err_message

    # Proper permissions
    res = exec_query(query_str, context: {current_user: user(can_view_beast: true, preview_beast: true)})
    assert_equal "Godzilla", res["data"]["previewBeast"]["beast"]["name"]
  end

  def test_it_uses_local_override_role
    query_str = <<-GRAPHQL
    mutation {
      previewBeastCustom(input: { name: "Godzilla" }) {
        beast {
          name
        }
      }
    }
    GRAPHQL

    res = exec_query(query_str, context: {current_user: user(can_view_beast: true)})
    err_message = res["errors"].first["message"]
    assert_equal "Unauthorized previewbeastcustom for PreviewBeastCustom", err_message

    # Proper permissions
    res = exec_query(query_str, context: {current_user: user(can_view_beast: true, preview_beast_custom: true)})
    assert_equal "Godzilla", res["data"]["previewBeastCustom"]["beast"]["name"]
  end

  def test_it_can_add_errors_as_data
    query_str = <<-GRAPHQL
    mutation {
      previewBeastWithErrors(input: { name: "Godzilla" }) {
        beast {
          name
        }
        errors
      }
    }
    GRAPHQL

    res = exec_query(query_str, context: {current_user: user(can_view_beast: true)})
    assert_equal ["PreviewBeastWithErrors requires preview_beast for mutation PreviewBeastWithErrors"], res["data"]["previewBeastWithErrors"]["errors"]
    assert_nil res["data"]["previewBeastWithErrors"].fetch("beast")

    # Proper permissions
    res = exec_query(query_str, context: {current_user: user(can_view_beast: true, preview_beast: true)})
    assert_equal "Godzilla", res["data"]["previewBeastWithErrors"]["beast"]["name"]
  end

  def test_resolvers_authorize_like_mutations
    query_str = <<-GRAPHQL
    {
      add2(lhs: 1, rhs: 2)
    }
    GRAPHQL

    # No permissions
    res = exec_query(query_str, context: {current_user: user})
    assert_nil res["data"]["add2"]

    # All permissions
    res = exec_query(query_str, context: {current_user: user(can_add: true, can_add_lhs: true, can_add_rhs: true)})
    assert_equal 3, res["data"]["add2"]

    # Only one or the other
    unpermitted_configs = [
      {can_add: true},
      {can_add: true, can_add_rhs: true},
      {can_add: true, can_add_lhs: true},
      {can_add_lhs: true, can_add_rhs: true},
    ]
    runs = 0
    unpermitted_configs.each do |config|
      runs += 1
      res = exec_query(query_str, context: {current_user: user(config)})
      assert_nil res["data"]["add2"], "It's unpermitted with #{config}"
    end

    assert_equal runs, unpermitted_configs.size, "All configs are tested"
  end

  def test_arguments_can_have_roles_too_even_with_nil_query
    query_str = <<-GRAPHQL
    {
      add(lhs: 1, rhs: 2)
    }
    GRAPHQL

    # No permissions
    res = exec_query(query_str, context: {current_user: user})
    assert_nil res["data"]["add"]

    # All permissions
    res = exec_query(query_str, context: {current_user: user(can_add: true, can_add_lhs: true, can_add_rhs: true)})
    assert_equal 3, res["data"]["add"]

    # Only one or the other
    unpermitted_configs = [
      {can_add: true},
      {can_add: true, can_add_rhs: true},
      {can_add: true, can_add_lhs: true},
      {can_add_lhs: true, can_add_rhs: true},
    ]
    runs = 0
    unpermitted_configs.each do |config|
      runs += 1
      res = exec_query(query_str, context: {current_user: user(config)})
      assert_nil res["data"]["add"], "It's unpermitted with #{config}"
    end

    assert_equal runs, unpermitted_configs.size, "All configs are tested"
  end

  def test_it_skips_skip
    query_str = <<-GRAPHQL
    {
      __typename
      skip {
        name
      }
    }
    GRAPHQL

    res = exec_query(query_str, context: {current_user: user})
    assert_equal({"__typename" => "Query"}, res["data"])
  end

  class CustomCurrentUserSchema < GraphQL::Schema
    class IntPolicy
      def initialize(user, _value)
        @user = user
      end

      def int_viewer?
        @user.int_viewer
      end
    end

    class Context < GraphQL::Query::Context
      def pundit_user
        self[:viewer]
      end
    end

    class Field < GraphQL::Schema::Field
      include GraphQL::Pro::PunditIntegration::FieldIntegration
    end

    class Query < GraphQL::Schema::Object
      field_class(Field)
      include GraphQL::Pro::PunditIntegration::ObjectIntegration
      pundit_role nil

      field :int, Integer, null: true, pundit_role: :int_viewer, pundit_policy_class: "GraphQLProPunditIntegrationTest::CustomCurrentUserSchema::IntPolicy"

      def int
        4
      end
    end

    query(Query)
    context_class(Context)

    def self.unauthorized_field(err)
      raise GraphQL::ExecutionError, "Unauthorized Field #{err.type.graphql_name}.#{err.field.graphql_name} for a #{err.object.class}"
    end
  end

  def test_it_uses_custom_current_user
    res = CustomCurrentUserSchema.execute("{ int }", context: { viewer: user(int_viewer: true)})
    assert_equal 4, res["data"]["int"]

    res2 = CustomCurrentUserSchema.execute("{ int }", context: { viewer: user(int_viewer: false)})
    assert_nil res2["data"]["int"]
    # Make sure the `.unauthorized_field` hook is called
    assert_equal ["Unauthorized Field Query.int for a NilClass"], res2["errors"].map { |e| e["message"] }
  end


  class RuntimeConfigurationSchema < GraphQL::Schema
    class WorksPolicy
      def initialize(current_user, object)
      end

      def works_ok?
        true
      end
    end

    class DoesntWorkPolicy
      def initialize(current_user, object)
      end

      def doesnt_work_ok?
        false
      end
    end

    class Query < GraphQL::Schema::Object
      include GraphQL::Pro::PunditIntegration::ObjectIntegration

      def self.pundit_policy_class_for(object, context)
        if object == :abc
          WorksPolicy
        else
          DoesntWorkPolicy
        end
      end

      def self.pundit_role_for(object, context)
        if context[:key] == 123
          :works_ok
        elsif context[:key] == 456
          :doesnt_work_ok
        else
          raise "Unexpected key"
        end
      end

      field :it_works, Boolean, null: false

      def it_works
        true
      end
    end

    query(Query)

    def self.unauthorized_object(err)
      raise GraphQL::ExecutionError, "Unauthorized!!!"
    end
  end

  def test_it_uses_runtime_pundit_methods
    res = RuntimeConfigurationSchema.execute("{ itWorks } ", root_value: :abc, context: { key: 123 })
    assert_equal true, res["data"]["itWorks"]

    res2 = RuntimeConfigurationSchema.execute("{ itWorks } ", root_value: :xyz, context: { key: 456 })
    assert_equal ["errors"], res2.keys
    assert_equal ["Unauthorized!!!"], res2["errors"].map { |e| e["message"] }
  end

  def test_it_works_with_array_arguments
    query_str = <<-GRAPHQL
    mutation {
      measureBeastNames(input: {beastIds: ["Sasquatch", "Loch Ness Monster"]}) { sizes }
    }
    GRAPHQL
    res = exec_query(query_str, context: {current_user: user})
    assert_equal ["Unauthorized punditbeast for Beast"], res["errors"].map { |e| e["message"] }

    res = exec_query(query_str, context: {current_user: user(can_measure_plural: true)})
    assert_equal ["Unauthorized punditbeast for Beast"], res["errors"].map { |e| e["message"] }

    res = exec_query(query_str, context: {current_user: user(can_view_beast: true)})
    assert_equal ["Unauthorized array for beastIds"], res["errors"].map { |e| e["message"] }

    res = exec_query(query_str, context: {current_user: user(can_view_beast: true, can_measure_plural: true)})
    assert_equal [9, 17], res["data"]["measureBeastNames"]["sizes"]
  end

  def test_it_works_with_array_arguments_without_custom_policy_configs
    query_str = <<-GRAPHQL
    mutation {
      measureBeastNamesByDefault(input: {beastIds: ["Sasquatch", "Loch Ness Monster"]}) { sizes }
    }
    GRAPHQL
    res = exec_query(query_str, context: {current_user: user})
    assert_equal ["Unauthorized punditbeast for Beast"], res["errors"].map { |e| e["message"] }

    res = exec_query(query_str, context: {current_user: user(can_view_beast: true)})
    assert_equal [9, 17], res["data"]["measureBeastNamesByDefault"]["sizes"]
  end

  class ClassRoleSchema < GraphQL::Schema
    class BaseArgument < GraphQL::Schema::Argument
      include GraphQL::Pro::PunditIntegration::ArgumentIntegration
      use_owner_role(true)
    end

    class BaseField < GraphQL::Schema::Field
      include GraphQL::Pro::PunditIntegration::FieldIntegration
      use_owner_role(true)
      argument_class(BaseArgument)
    end

    class BaseObject < GraphQL::Schema::Object
      include GraphQL::Pro::PunditIntegration::ObjectIntegration
      field_class(BaseField)
    end

    class QueryPolicy
      def initialize(current_user, object)
        @current_user = current_user
      end

      def query?
        @current_user.can_query?
      end

      def add?
        @current_user.can_add?
      end

      def b?
        @current_user.can_b?
      end
    end

    class Query < BaseObject
      pundit_policy_class QueryPolicy
      pundit_role :query
      field :marco, String, null: true
      def marco
        "polo"
      end

      field :add, Integer, null: false, pundit_role: :add do
        argument :a, Int, required: true
        argument :b, Int, required: true, pundit_role: :b
      end

      def add(a:, b:)
        a + b
      end
    end

    query(Query)
  end

  def test_it_works_with_use_owner_role
    # Test fields
    res = ClassRoleSchema.execute("{ marco }", context: { current_user: user(can_query?: true) })
    assert_equal "polo", res["data"]["marco"]

    res2 = ClassRoleSchema.execute("{ marco }", context: { current_user: user(can_query?: false) })
    assert_nil res2.fetch("data")

    # Test arguments
    res = ClassRoleSchema.execute("{ add(a: 1, b: 2) }", context: { current_user: user(can_add?: true, can_query?: true, can_b?: true) })
    assert_equal 3, res["data"]["add"]

    res2 = ClassRoleSchema.execute("{ add(a: 1, b: 2) }", context: { current_user: user(can_add?: true) })
    assert_nil res2.fetch("data")

    res3 = ClassRoleSchema.execute("{ add(a: 1, b: 2) }", context: { current_user: user(can_add?: true, can_query?: true) })
    assert_nil res3.fetch("data")

    res4 = ClassRoleSchema.execute("{ add(a: 1, b: 2) }", context: { current_user: user(can_add?: true, can_b?: true) })
    assert_nil res4.fetch("data")
  end
end
