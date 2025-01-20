# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Services
      # Remove a support level from a given service.
      module RemoveSupportLevelMutation
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.services.remove_support_level"

        # Remove a support level from a given service.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param service_name [String] The name of the service whose support level you're removing (exact)
        # @param level [String] The level attribute of the support level you're removing e.g. sev1, sev2, sev3
        #
        # @return [Hash]
        def self.execute(client:, context: {}, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          query = build_query(variables)

          data = {"removeSupportLevel" => nil, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            response = client.query_with_retries(query: query, variables: variables, context: context)
            data["errors"] = response["errors"] if response["errors"]
            data["removeSupportLevel"] = response.dig("data", "removeSupportLevel")
          end

          data
        end

        # Build query for removing a support level given the input variables (in GraphQL form).
        #
        # @param variables [Hash] Input variables in GraphQL variable format as keys.
        #
        # @return [String] The mutation query
        def self.build_query(variables)
          <<~GRAPHQL
            mutation removeSupportLevelMutation(#{GraphqlQuerySemantics.graphql_variable_declaration(variables, strict: true)}){
              removeSupportLevel(input: { #{GraphqlQuerySemantics.graphql_variable_passing(variables)} }) {
                clientMutationId
              }
            }
          GRAPHQL
        end
      end
    end
  end
end
