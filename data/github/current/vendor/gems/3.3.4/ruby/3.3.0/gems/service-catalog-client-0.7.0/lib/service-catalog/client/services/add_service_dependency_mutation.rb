# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Services
      # Add a dependency for a given service.
      module AddServiceDependencyMutation
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.services.add_service_dependency"

        # Add a dependency for a given service.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param service_name [String] The name of the service that requires the dependency (exact)
        # @param dependency_name [String] The name of the service that provides the dependency (exact)
        #
        # @return [Hash]
        def self.execute(client:, context: {}, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          query = build_query(variables)

          data = {"addServiceDependency" => nil, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            response = client.query_with_retries(query: query, variables: variables, context: context)
            data["errors"] = response["errors"] if response["errors"]
            data["addServiceDependency"] = response.dig("data", "addServiceDependency")
          end

          data
        end

        # Build query for adding a service dependency given the input variables (in GraphQL form).
        #
        # @param variables [Hash] Input variables in GraphQL variable format as keys.
        #
        # @return [String] The mutation query
        def self.build_query(variables)
          <<~GRAPHQL
            mutation addServiceDependencyMutation(#{GraphqlQuerySemantics.graphql_variable_declaration(variables, strict: true)}){
              addServiceDependency(input: { #{GraphqlQuerySemantics.graphql_variable_passing(variables)} }) {
                serviceDependency{
                  id
                  dependency{
                    id
                    name
                  }
                }
              }
            }
          GRAPHQL
        end
      end
    end
  end
end
