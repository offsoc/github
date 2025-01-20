# frozen_string_literal: true
module GraphQL
  module Pro
    module Access
      class PunditStrategy
        def initialize(ctx)
          current_user_key = ctx.schema.metadata[CURRENT_USER_KEY]
          @user = ctx[current_user_key]
        end

        # Return true if:
        # - there is no policy
        # - the policy's method returns true
        def allowed?(gate, value)
          policy = if value.nil?
            gate.pundit_policy.new(@user, nil)
          elsif gate.pundit_policy
            gate.pundit_policy.new(@user, value)
          else
            nil
          end
          policy.nil? || policy.public_send(:"#{gate.role}?")
        end

        def scope(gate, relation)
          filtered_relation = if gate.pundit_policy
            begin
              scope_class = gate.pundit_policy::Scope
              scope_class.new(@user, relation).resolve
            rescue NameError
              nil
            end
          else
            nil
          end
          filtered_relation || relation
        end
      end
    end
  end
end
