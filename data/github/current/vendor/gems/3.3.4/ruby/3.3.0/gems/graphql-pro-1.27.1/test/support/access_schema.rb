# frozen_string_literal: true

module AccessSchema
  class BaseField < GraphQL::Schema::Field
    def initialize(*args, **kwargs, &block)
      kwargs[:camelize] = false
      super(*args, **kwargs, &block)
    end
  end

  class BaseObject < GraphQL::Schema::Object
    field_class BaseField
  end

  class BaseEnum < GraphQL::Schema::Enum
  end

  class BaseUnion < GraphQL::Schema::Union
  end

  class ToppingType < BaseObject
    field :name, String, null: true
  end

  class BreadType < BaseEnum
    value "WHEAT"
    value "WHITE"
    value "NONSENSE", value: "Dummy"
    # Not overriden by schema default
    access(role: :always, pundit_policy_name: "DefaultPolicy")
    view(role: :always, pundit_policy_name: "DefaultPolicy")
  end

  class SandwichType < BaseObject
    authorize :admin
    field :bread, BreadType, null: true # No gate, test default gate
    field :toppings, [ToppingType], null: true, access: :admin
    field :price, Integer, null: true, view: { role: :admin, pundit_policy_name: "SandwichPricePolicy" }
    field :fat_calories, Integer, null: true, authorize: { parent_role: :creator } do
      # Not overriden by default
      access(role: :always, pundit_policy_name: "DefaultPolicy")
    end
    field :carbohydrate_calories, Integer, null: true, authorize: { parent_role: :creator } do
      # Not overriden by default
      view(role: :always, pundit_policy_name: "DefaultPolicy")
    end
    field :protein_calories, Integer, null: true, authorize: { role: :admin, parent_role: :creator, pundit_policy_name: "SandwichPricePolicy" }
  end

  class PastaType < BaseObject
    authorize :never
    field :toppings, [ToppingType], null: true
    field :price, Integer, null: true
  end

  class PizzaType < BaseObject
    access :never
    field :toppings, [ToppingType], null: true
    field :price, Integer, null: true
  end

  class SaladType < BaseObject
    view :never
    field :price, Integer, null: true
  end

  ResolveTypeFunc = ->(obj, ctx) {
    case obj.model_name
    when "Sandwich"
      SandwichType
    when "Pasta"
      PastaType
    when "Pizza"
      PizzaType
    else
      raise("Unknown type for #{obj}")
    end
  }

  class EntreeType < BaseUnion
    possible_types SandwichType, PastaType, PizzaType, SaladType

    def self.resolve_type(obj, ctx)
      ResolveTypeFunc.call(obj, ctx)
    end
  end

  class QueryType < BaseObject
    def object_by_id(id:)
      AccessHelpers::Data[id]
    end

    field :sandwich, SandwichType, resolver_method: :object_by_id, null: true do
      argument :id, ID, required: true
    end

    field :pasta, PastaType, resolver_method: :object_by_id, null: true do
      argument :id, ID, required: true
    end

    field :pizza, PizzaType, resolver_method: :object_by_id, null: true do
      argument :id, ID, required: true
    end


    field :no_sandwich, SandwichType, null: true, resolver_method: :object_by_id, camelize: false do
      description "Check that type and field configs are _both_ applied"
      argument :id, ID, required: true
      authorize :never
    end

    field :entrees, [EntreeType], null: true do
      argument :ids, [ID], required: true
    end

    def entrees(ids:)
      AccessHelpers::Box.new(ids.map { |id|
        AccessHelpers::Data[id]
      })
    end

    field :list_entrees, [[EntreeType]], null: false, camelize: false do
      description "Test lists of lists, authorized by return type"
      argument :id_lists, [[ID]], required: true, camelize: false
    end

    def list_entrees(id_lists:)
      AccessHelpers::Box.new(id_lists.map { |list|
        list.map { |id| AccessHelpers::Data[id] }
      })
    end

    field :entree, EntreeType, null: true do
      argument :id, ID, required: true
      authorize role: :admin, pundit_policy_name: "SandwichPolicy"
    end

    def entree(id:)
      AccessHelpers::Box.new(object_by_id(id: id))
    end

    field :nil_entrees, [EntreeType], null: true, camelize: false
    def nil_entrees
      nil
    end
  end

  class AddSandwich < GraphQL::Schema::RelayClassicMutation
    # Doesn't actually mutate the data
    field :sandwich, SandwichType, null: true, authorize: :always
    field :always, Boolean, null: true, authorize: { role: :always, pundit_policy_name: "DefaultPolicy" }
    field :admin, Boolean, null: true, authorize: { role: :admin, pundit_policy_name: "DefaultPolicy" }
    argument :fat_calories, Integer, required: false, camelize: false

    def resolve(fat_calories:)
      {
        admin: true,
        always: true,
        sandwich: OpenStruct.new(fat_calories: fat_calories, bread: "WHEAT"),
      }
    end
  end

  class BaseMutation < GraphQL::Schema::Mutation
  end

  class AddSecret < BaseMutation
    field :result, String, null: true
    view(role: :never, pundit_policy_name: "DefaultPolicy")
  end

  class MutationType < BaseObject
    field :addSandwich, mutation: AddSandwich
    field :addSecret, mutation: AddSecret
  end

  def build_schema_object(auth)
    Class.new(GraphQL::Schema) do
      query(QueryType)
      mutation(MutationType)
      authorization(*auth)
      def self.resolve_type(type, obj, ctx)
        raise("This shouldn't be called")
      end
      lazy_resolve(AccessHelpers::Box, :value)
      if GraphQL::Execution::Execute.respond_to?(:use)
        use(GraphQL::Execution::Execute)
        use(GraphQL::Analysis)
      end
    end
  end
end
