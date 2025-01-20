# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Slos
      # Delete an SLO.
      module DeleteSloMutation
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.slos.delete_slo"

        # GraphQL types for all the arguments in this
        VARIABLE_GRAPHQL_TYPES = {
          "clientMutationId" => "String",
          "serviceName" => "String!",
          "sloName" => "String!",
        }

        # Delete an SLO.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param client_mutation_id [String] A unique identifier for the client performing the mutation.
        # @param service_name [String] The name of the service to which the SLO belongs.
        # @param slo_name [String] The name of the SLO.
        #
        # @return [Hash]
        def self.execute(client:, context: {}, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          query = build_query(variables)

          data = {"mutation" => nil, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            response = client.query_with_retries(query: query, variables: variables, context: context)
            data["errors"] = response["errors"] if response["errors"]
            data["mutation"] = response.dig("data", "deleteSlo")
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
            mutation deleteSlo#{GraphqlQuerySemantics.graphql_variable_declaration(variables, variable_types: VARIABLE_GRAPHQL_TYPES, include_parens: true)} {
              deleteSlo(input: { #{GraphqlQuerySemantics.graphql_variable_passing(variables)} }) {
                clientMutationId
              }
            }
          GRAPHQL
        end
      end
    end

    class SlosQueryBinder < QueryBinder
      # Delete an SLO.
      #
      # @param client_mutation_id [String] A unique identifier for the client performing the mutation.
      # @param service_name [String] The name of the service to which the SLO belongs.
      # @param slo_name [String] The name of the SLO.
      # @param context [Hash] Additional headers to add to the request (optional)
      #
      # @return [Response]
      def delete(**kwargs)
        Response.new Client::Slos::DeleteSloMutation.execute(client: client, **kwargs)
      end
    end
  end
end
