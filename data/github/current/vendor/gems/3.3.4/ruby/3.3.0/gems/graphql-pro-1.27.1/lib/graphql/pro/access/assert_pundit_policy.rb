# frozen_string_literal: true
module GraphQL
  module Pro
    module Access
      # Traverse the schema, asserting that all pundit_policies were found
      module AssertPunditPolicy
        MESSAGE = "Failed to find %{parent}Pundit policy for: %{owner_name}. Tried %{policy_name}, specify with: `%{level}: { %{role_key}: %{role}, %{policy_name_key}: 'YourPolicy' }`"
        def self.call(obj)
          case obj
          when GraphQL::Schema
            METADATA_KEYS.each do |metadata_key|
              level = Access::ROLE_KEYS.key(metadata_key)
              config = obj.metadata[metadata_key]
              if config
                gate = Access::Gate.build(obj, level, config)
                assert_policy(obj, nil, gate)
              end
            end
          when GraphQL::BaseType
            METADATA_KEYS.each do |metadata_key|
              assert_policy(obj, nil, obj.metadata[metadata_key])
            end
            if obj.kind.fields?
              obj.all_fields.each do |field|
                METADATA_KEYS.each do |metadata_key|
                  assert_policy(obj, field, field.metadata[metadata_key])
                end
              end
            end
          else
            raise "Unexpected policy assertion target: #{obj}"
          end
          true
        end

        def self.assert_policy(type, field, gate)
          if gate.nil?
            return
          end

          if gate.role && !gate.pundit_policy
            owner_name = if field
              "#{type.name}.#{field.name}"
            elsif type.is_a?(GraphQL::Schema)
              "Schema default"
            else
              type.name
            end

            raise(
              GraphQL::Pro::Access::PunditStrategyNotFoundError,
              MESSAGE % {
                owner_name: owner_name,
                parent: "",
                policy_name: gate.pundit_policy_name.inspect,
                level: gate.level,
                role_key: "role",
                role: gate.role.inspect,
                policy_name_key: "pundit_policy_name",
              }
            )
          end

          parent_gate = gate.parent_gate
          if parent_gate
            parent_gate.owner = type
            if !parent_gate.pundit_policy
              owner_name = if field
                "#{type.name}.#{field.name}"
              else
                type.name
              end

              raise(
                GraphQL::Pro::Access::PunditStrategyNotFoundError,
                MESSAGE % {
                  owner_name: owner_name,
                  parent: "parent ",
                  policy_name: parent_gate.pundit_policy_name.inspect,
                  level: gate.level,
                  role_key: "parent_role",
                  role: parent_gate.role.inspect,
                  policy_name_key: "parent_pundit_policy_name",
                }
              )
            end
          end
        end
      end
    end
  end
end
