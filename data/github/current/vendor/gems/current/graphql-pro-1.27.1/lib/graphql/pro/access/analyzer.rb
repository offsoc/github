# frozen_string_literal: true
module GraphQL
  module Pro
    module Access
      # Check the query tree for any fields which
      # are not accessible to the current user.
      # @api private
      module Analyzer
        module_function

        def initial_value(query)
          {
            strategy: query.context[STRATEGY_KEY],
            context: query.context,
            schema: query.schema,
            schema_gate: query.schema.metadata[ACCESS_METADATA_KEY],
            error_handler: query.schema.metadata[UNAUTHORIZED_FIELDS_KEY],
            invalid_irep_nodes: [],
          }
        end

        def call(memo, visit_type, irep_node)
          if visit_type == :enter && irep_node && !(allowed_field?(memo, irep_node))
            memo[:invalid_irep_nodes] << irep_node
          end
          memo
        end

        def final_value(memo)
          if memo[:invalid_irep_nodes].any?
            memo[:error_handler].call(memo[:invalid_irep_nodes], memo[:context])
          else
            nil
          end
        end

        private
        module_function

        def allowed_field?(memo, irep_node)
          field = irep_node.definition
          if field.nil?
            true
          elsif field.name.start_with?("__") || irep_node.owner_type.name.start_with?("__")
            true
          else
            strategy = memo[:strategy]
            field_gate = field.metadata[ACCESS_METADATA_KEY]
            if allowed_gate?(strategy, field_gate)
              return_type_gate = field.type.unwrap.metadata[ACCESS_METADATA_KEY]
              allowed_gate?(strategy, return_type_gate)
            else
              false
            end
          end
        end

        def allowed_gate?(strategy, gate)
          gate.nil? || strategy.allowed?(gate, nil)
        end
      end
    end
  end
end
