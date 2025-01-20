# frozen_string_literal: true
require_relative "../access_test"

# CanCan uses this global
class CustomAbility
  include CanCan::Ability

  def initialize(user)
    # Can't admin toppings or price
    user.allowed_ids.each do |allowed_id|
      can :admin, OpenStruct, { id: allowed_id }
    end
    can :creator, OpenStruct, { id: "5" }
    can :always, :all
  end
end

def add_global_ability
  Object.const_set(:Ability, CustomAbility)
  defined?(::Ability) || raise("Failed to define global ability")
end

def remove_global_ability
  Object.send(:remove_const, :Ability)
  defined?(::Ability) && raise("Failed to remove global ability")
end

class GraphQLProAccessCanCanTest < Minitest::Test
  include GraphQLProAccessBase
  def auth_strategy
    :cancan
  end

  def setup
    add_global_ability
  end

  def teardown
    remove_global_ability
  end

  def current_user
    OpenStruct.new(allowed_ids: ["2", "5"])
  end
end

class GraphQLProAccessCanCanCustomAbilityTest < Minitest::Test
  include GraphQLProAccessBase
  def auth_args
    [:cancan, { ability_class: CustomAbility, current_user: :person }]
  end

  def current_user
    OpenStruct.new(allowed_ids: ["2", "5"])
  end

  def current_user_key
    :person
  end
end
