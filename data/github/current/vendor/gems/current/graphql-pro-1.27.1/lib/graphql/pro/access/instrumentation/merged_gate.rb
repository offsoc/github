# frozen_string_literal: true
module GraphQL
  module Pro
    module Access
      class Instrumentation
        # Check a field's return value against a field gate
        # _and/or_ a type gate
        class MergedGate
          def initialize(field_gate, return_type_gate)
            @field_gate = field_gate
            @parent_gate = field_gate && field_gate.parent_gate
            @return_type_gate = return_type_gate
          end

          def allowed_parent?(query, strategy, value)
            @parent_gate.nil? || strategy.allowed?(@parent_gate, value)
          end

          def allowed_value(query, strategy, value, fallback: nil)
            # These objects get scoping treatments
            if (
                (defined?(ActiveRecord::Relation) && value.is_a?(ActiveRecord::Relation)) ||
                (defined?(Mongoid::Criteria) && value.is_a?(Mongoid::Criteria))
              ) && strategy.respond_to?(:scope)
              value = scope(@parent_gate, strategy, value)
              value = scope(@field_gate, strategy, value)
              value = scope(@return_type_gate, strategy, value)
              value
            elsif allowed?(query, strategy, value)
              value
            else
              fallback
            end
          end

          private

          def scope(gate, strategy, value)
            gate ? strategy.scope(gate, value) : value
          end

          def allowed?(query, strategy, value)
            if @field_gate.nil? || @field_gate.role.nil? || strategy.allowed?(@field_gate, value)
              case @return_type_gate
              when nil
                true
              when Access::Gate
                strategy.allowed?(@return_type_gate, value)
              when RuntimeTypeGate
                runtime_type = query.resolve_type(@return_type_gate.type, value)
                possible_types = query.possible_types(@return_type_gate.type)
                # some may be filtered out by warden:
                if possible_types.include?(runtime_type)
                  runtime_gate = runtime_type.metadata[AUTHORIZE_METADATA_KEY]
                  runtime_gate.nil? || strategy.allowed?(runtime_gate, value)
                else
                  false
                end
              else
                raise "Unknown return_type_gate: #{@return_type_gate}"
              end
            else
              false
            end
          end
        end
      end
    end
  end
end
