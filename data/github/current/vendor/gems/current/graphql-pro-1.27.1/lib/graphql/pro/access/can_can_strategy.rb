# frozen_string_literal: true
module GraphQL
  module Pro
    module Access
      # Get the CanCan Ability class an instantiate it.
      # Delegate all `allowed?` calls to `can?`
      class CanCanStrategy
        def initialize(ctx)
          ability_class = ctx.schema.metadata[STRATEGY_OPTIONS_KEY][:ability_class] || ::Ability
          current_user_key = ctx.schema.metadata[CURRENT_USER_KEY]
          @ability = ability_class.new(ctx[current_user_key])
        end

        def scope(gate, relation)
          relation.accessible_by(@ability, gate.role)
        end

        # Returns true if the ability responds true
        def allowed?(gate, value)
          @ability.can?(gate.role, value)
        end
      end
    end
  end
end
