# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Users
      # Delete a service filter
      module DeleteServiceFilterMutation
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.users.delete_service_filter"

        # GraphQL types for the known GraphQL arguments
        VARIABLE_GRAPHQL_TYPES = {
          "clientMutationId" => "String",
          "serviceFilterId" => "ID!",
        }

        # Delete a service filter
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param client_mutation_id [String] A unique identifier for the client performing the mutation.
        # @param service_filter_id [String] The `id` of the service filter to delete.
        #
        # @return [Hash]
        def self.execute(client:, context: {}, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          query = build_query(variables)

          data = {"mutation" => nil, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            response = client.query_with_retries(query: query, variables: variables, context: context)
            data["errors"] = response["errors"] if response["errors"]
            data["mutation"] = response.dig("data", "deleteServiceFilter")
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
            mutation deleteServiceFilter#{GraphqlQuerySemantics.graphql_variable_declaration(variables, variable_types: VARIABLE_GRAPHQL_TYPES, include_parens: true)} {
              deleteServiceFilter(input: { #{GraphqlQuerySemantics.graphql_variable_passing(variables)} }) {
                clientMutationId
              }
            }
          GRAPHQL
        end
      end
    end

    class UsersQueryBinder < QueryBinder
      # Delete a service filter
      #
      # @param client_mutation_id [String] A unique identifier for the client performing the mutation.
      # @param service_filter_id [String] The `id` of the service filter to delete.
      # @param context [Hash] Additional headers to add to the request (optional)
      #
      # @return [Response]
      def delete_service_filter(**kwargs)
        Response.new Client::Users::DeleteServiceFilterMutation.execute(client: client, **kwargs)
      end
    end
  end
end
