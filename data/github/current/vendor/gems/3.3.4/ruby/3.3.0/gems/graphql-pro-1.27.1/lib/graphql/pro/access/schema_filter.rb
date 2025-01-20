# frozen_string_literal: true
module GraphQL
  module Pro
    module Access
      module SchemaFilter
        module_function
        # Should this member be _skipped_ ?
        def call(member, ctx)
          case member
          when GraphQL::Field
            # - Apply the field's gate if there is one
            # - Apply the return type's gate if there is one
            # - Finally, apply the schema default if there is one
            #
            # (GraphQL _would_ filter by return type even if we
            # didn't check it here, but in order to provide the right
            # logic for the schema default, we have to check it.)
            gate = member.metadata[VIEW_METADATA_KEY]
            if gate.nil?
              gate = member.type.unwrap.metadata[VIEW_METADATA_KEY]
            end
          when GraphQL::BaseType
            gate = member.metadata[VIEW_METADATA_KEY]
          else
            gate = nil
          end

          if gate
            !ctx[STRATEGY_KEY].allowed?(gate, nil)
          else
            false
          end
        end
      end
    end
  end
end
