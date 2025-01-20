# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Services
      # Remove a dependency from a given service.
      module RemoveServiceDependencyMutation
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.services.remove_service_dependency"

        # Remove a dependency from a given service.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param service_dependency_id [String] The ID of the service dependency to remove
        #
        # @return [Hash]
        def self.execute(client:, context: {}, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          query = build_query(variables)

          data = {"removeServiceDependency" => nil, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            response = client.query_with_retries(query: query, variables: variables, context: context)
            data["errors"] = response["errors"] if response["errors"]
            data["removeServiceDependency"] = response.dig("data", "removeServiceDependency")
          end

          data
        end

        # Build query for removing a service dependency given the input variables (in GraphQL form).
        #
        # @param variables [Hash] Input variables in GraphQL variable format as keys.
        #
        # @return [String] The mutation query
        def self.build_query(variables)
          <<~GRAPHQL
            mutation removeServiceDependencyMutation($serviceDependencyId: ID!){
              removeServiceDependency(input: { #{GraphqlQuerySemantics.graphql_variable_passing(variables)} }) {
                clientMutationId
              }
            }
          GRAPHQL
        end
      end
    end
  end
end
