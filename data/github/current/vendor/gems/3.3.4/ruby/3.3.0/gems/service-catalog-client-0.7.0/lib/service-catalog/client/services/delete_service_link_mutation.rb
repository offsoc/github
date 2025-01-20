# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Services
      # Delete a service link.
      module DeleteServiceLinkMutation
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.services.delete_link"

        # GraphQL types for the known GraphQL arguments
        VARIABLE_GRAPHQL_TYPES = {
          "clientMutationId" => "String",
          "name" => "String!",
          "serviceName" => "String!",
        }

        # Delete a service link.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param client_mutation_id [String] A unique identifier for the client performing the mutation.
        # @param name [String] The title of the link
        # @param service_name [String] The name of the service
        #
        # @return [Hash]
        def self.execute(client:, context: {}, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          query = build_query(variables)

          data = {"mutation" => nil, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            response = client.query_with_retries(query: query, variables: variables, context: context)
            data["errors"] = response["errors"] if response["errors"]
            data["mutation"] = response.dig("data", "deleteServiceLink")
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
            mutation deleteServiceLink#{GraphqlQuerySemantics.graphql_variable_declaration(variables, variable_types: VARIABLE_GRAPHQL_TYPES, include_parens: true)} {
              deleteServiceLink(input: { #{GraphqlQuerySemantics.graphql_variable_passing(variables)} }) {
                clientMutationId
              }
            }
          GRAPHQL
        end
      end
    end

    class ServicesQueryBinder < QueryBinder
      # Delete a service link.
      #
      # @param client_mutation_id [String] A unique identifier for the client performing the mutation.
      # @param name [String] The title of the link
      # @param service_name [String] The name of the service
      # @param context [Hash] Additional headers to add to the request (optional)
      #
      # @return [Response]
      def delete_link(**kwargs)
        Response.new Client::Services::DeleteServiceLinkMutation.execute(client: client, **kwargs)
      end
    end
  end
end
