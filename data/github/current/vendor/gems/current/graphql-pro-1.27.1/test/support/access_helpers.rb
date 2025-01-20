# frozen_string_literal: true

require_relative "access_schema.rb"

module AccessHelpers
  include AccessSchema

  Data = OpenStruct.new({
    "1" => OpenStruct.new({
      # hint for pundit:
      model_name: "Sandwich",
      id: "1",
      bread: "WHITE",
      price: 799,
      toppings: [
        OpenStruct.new({name: "Tomato"}),
        OpenStruct.new({name: "Cheddar"}),
      ]
    }),
    "2" => OpenStruct.new({
      model_name: "Sandwich",
      id: "2",
      bread: "WHEAT",
      price: 999,
      fat_calories: 200,
      carbohydrate_calories: 120,
      toppings: [
        OpenStruct.new({name: "Arugula"}),
        OpenStruct.new({name: "Mozzarella"}),
      ]
    }),
    "3" => OpenStruct.new({
      model_name: "Pasta",
      id: "3",
      price: 1199,
      toppings: [
        OpenStruct.new({name: "Pancetta"}),
        OpenStruct.new({name: "Parmesan"}),
      ]
    }),
    "4" => OpenStruct.new({
      model_name: "Pizza",
      id: "4",
      price: 1099,
      toppings: [
        OpenStruct.new({name: "Mushrooms"}),
        OpenStruct.new({name: "Feta"}),
      ]
    }),
    "5" => OpenStruct.new({
      model_name: "Sandwich",
      id: "5",
      bread: "WHEAT",
      price: 399,
      fat_calories: 250,
      carbohydrate_calories: 140,
      protein_calories: 40,
      toppings: [
        OpenStruct.new({name: "American"}),
      ]
    }),
  })


  class Box
    attr_reader :value
    def initialize(value)
      @value = value
    end
  end

  def build_schema(default_auth: false)
    auth = self.auth_args
    if default_auth
      if auth.last.is_a?(Hash)
        auth.last[:fallback] = default_auth
      else
        auth << {fallback: default_auth}
      end
    end
    build_schema_object(auth)
  end

  # Tests for a specific strategy should override this
  def auth_strategy
    raise NotImplementedError
  end

  # Tests which need to provide a strategy _and_ options
  # should override this method
  def auth_args
    [auth_strategy]
  end
end
