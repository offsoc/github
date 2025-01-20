# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Groups
      # Delete a group.
      module DeleteGroupMutation
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.groups.delete"

        # Delete a group.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param name [String] The name of the group (exact)
        #
        # @return [Hash]
        def self.execute(client:, context: {}, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          query = build_query(variables)

          data = {"mutation" => nil, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            response = client.query_with_retries(query: query, variables: variables, context: context)
            data["errors"] = response["errors"] if response["errors"]
            data["mutation"] = response.dig("data", "deleteGroup")
          end

          data
        end

        # Build query for this mutation.
        #
        # @param variables [Hash] Input variables in GraphQL variable format as keys.
        #
        # @return [String] The mutation query
        def self.build_query(variables)
          <<~GRAPHQL
            mutation deleteGroup(#{GraphqlQuerySemantics.graphql_variable_declaration(variables, strict: true)}){
              deleteGroup(input: { #{GraphqlQuerySemantics.graphql_variable_passing(variables)} }) {
                clientMutationId
              }
            }
          GRAPHQL
        end
      end
    end
  end
end
