# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Slos
      # Execute the deleteSloSummary Mutation.
      module DeleteSloSummaryMutation
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.slos.delete_slo_summary"

        # GraphQL types for all the arguments in this
        VARIABLE_GRAPHQL_TYPES = {
          "clientMutationId" => "String",
          "id" => "ID!",
        }

        # Execute the deleteSloSummary Mutation.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param client_mutation_id [String] A unique identifier for the client performing the mutation.
        # @param id [String] The SLO summary ID to remove.
        #
        # @return [Hash]
        def self.execute(client:, context: {}, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          query = build_query(variables)

          data = {"mutation" => nil, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            response = client.query_with_retries(query: query, variables: variables, context: context)
            data["errors"] = response["errors"] if response["errors"]
            data["mutation"] = response.dig("data", "deleteSloSummary")
          end

          data
        end

        # Build query for this query.
        #
        # @param variables [Hash] Input variables in GraphQL variable format as keys.
        #
        # @return [String] The mutation query
        def self.build_query(variables, **kwargs)
          <<~GRAPHQL
            mutation deleteSloSummary#{GraphqlQuerySemantics.graphql_variable_declaration(variables, variable_types: VARIABLE_GRAPHQL_TYPES, include_parens: true)} {
              deleteSloSummary(input: { #{GraphqlQuerySemantics.graphql_variable_passing(variables)} }) {
                clientMutationId
              }
            }
          GRAPHQL
        end
      end
    end

    class SlosQueryBinder < QueryBinder
      # Execute the deleteSloSummary Mutation.
      #
      # @param client_mutation_id [String] A unique identifier for the client performing the mutation.
      # @param id [String] The SLO summary ID to remove.
      # @param context [Hash] Additional headers to add to the request (optional)
      #
      # @return [Response]
      def delete_slo_summary(**kwargs)
        Response.new Client::Slos::DeleteSloSummaryMutation.execute(client: client, **kwargs)
      end
    end
  end
end
