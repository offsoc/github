# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Owners
      # Update an Owner.
      module UpdateOwnerMutation
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.owners.update_owner"

        # GraphQL types for the known GraphQL arguments
        VARIABLE_GRAPHQL_TYPES = {
          "active" => "Boolean",
          "clientMutationId" => "String",
          "name" => "String!",
        }

        # Update an Owner.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param active [Boolean] Active status of the Owner.
        # @param client_mutation_id [String] A unique identifier for the client performing the mutation.
        # @param name [String] The name of the Owner.
        #
        # @return [Hash]
        def self.execute(client:, context: {}, detail_fragment: OwnersQueryBinder::DETAIL_FRAGMENT, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          query = build_query(variables, detail_fragment: detail_fragment)

          data = {"mutation" => nil, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            response = client.query_with_retries(query: query, variables: variables, context: context)
            data["errors"] = response["errors"] if response["errors"]
            data["mutation"] = response.dig("data", "updateOwner")
          end

          data
        end

        # Build query for this query.
        #
        # @param variables [Hash] Input variables in GraphQL variable format as keys.
        #
        # @return [String] The mutation query
        def self.build_query(variables, detail_fragment: OwnersQueryBinder::DETAIL_FRAGMENT, **kwargs)
          <<~GRAPHQL
            mutation updateOwner#{GraphqlQuerySemantics.graphql_variable_declaration(variables, variable_types: VARIABLE_GRAPHQL_TYPES, include_parens: true)} {
              updateOwner(input: { #{GraphqlQuerySemantics.graphql_variable_passing(variables)} }) {
                clientMutationId
                owner {
                  ...OwnerDetail
                }
              }
            }
            #{detail_fragment}
          GRAPHQL
        end
      end
    end

    class OwnersQueryBinder < QueryBinder
      # Update an Owner.
      #
      # @param active [Boolean] Active status of the Owner.
      # @param client_mutation_id [String] A unique identifier for the client performing the mutation.
      # @param name [String] The name of the Owner.
      # @param context [Hash] Additional headers to add to the request (optional)
      #
      # @return [Response]
      def update(**kwargs)
        Response.new Client::Owners::UpdateOwnerMutation.execute(client: client, **kwargs)
      end
    end
  end
end
