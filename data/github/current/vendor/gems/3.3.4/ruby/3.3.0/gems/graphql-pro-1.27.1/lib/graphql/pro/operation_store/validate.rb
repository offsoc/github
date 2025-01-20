# frozen_string_literal: true
module GraphQL
  module Pro
    class OperationStore
      module Validate
        RULES = GraphQL::StaticValidation::ALL_RULES - [
          GraphQL::StaticValidation::OperationNamesAreValid,
        ] + [
          GraphQL::Pro::OperationStore::OperationNamesArePresentAndUnique,
          GraphQL::Pro::OperationStore::IndexVisitor,
        ]

        # @param schema [Class<GraphQL::Schema>]
        # @param doc [GraphQL::Language::Nodes::Document]
        # @param client_name [String]
        # @param context [Hash] This context will be used for validation *only* -- the queries must also be given a context for execution.
        # @param changeset_version [String]
        def self.validate(schema, doc, client_name:, context: {}, changeset_version: nil)
          context[:current_client_name] = client_name
          context[:changeset_version] = changeset_version

          query = GraphQL::Query.new(schema, document: doc, context: context)

          # If the schema is configured to authorize incoming operations,
          # use the provided strategy. Otherwise, use the default
          # strategy, which _always_ fails auth checks.
          if defined?(GraphQL::Pro::Access)
            op_store_strategy_key = GraphQL::Pro::Access::OPERATION_STORE_STRATEGY_KEY
            auth_strategy = if client_name && (strategy_class = schema.metadata[op_store_strategy_key])
              strategy_class.new(query.context)
            else
              AlwaysFailStrategy
            end

            strategy_key = GraphQL::Pro::Access::STRATEGY_KEY
            query.context[strategy_key] = auth_strategy
          end

          validator_opts = {
            schema: schema,
            rules: RULES,
          }
          validator = GraphQL::StaticValidation::Validator.new(**validator_opts)
          res = validator.validate(query)
          return res[:errors], query
        end

        module AlwaysFailStrategy
          def self.allowed?(*)
            false
          end
        end
      end
    end
  end
end
