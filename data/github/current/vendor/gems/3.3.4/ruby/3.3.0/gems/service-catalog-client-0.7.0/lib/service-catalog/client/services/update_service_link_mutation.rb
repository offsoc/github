# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Services
      # Update or create a service link.
      module UpdateServiceLinkMutation
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.services.update_link"

        # GraphQL types for the known GraphQL arguments
        VARIABLE_GRAPHQL_TYPES = {
          "clientMutationId" => "String",
          "description" => "String!",
          "kind" => "String!",
          "name" => "String!",
          "serviceName" => "String!",
          "url" => "String!",
        }

        # Update or create a service link.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param client_mutation_id [String] A unique identifier for the client performing the mutation.
        # @param description [String] The description of the link
        # @param kind [String] The kind of the link
        # @param name [String] The title of the link
        # @param service_name [String] The name of the service
        # @param url [String] The link URL
        #
        # @return [Hash]
        def self.execute(client:, context: {}, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          query = build_query(variables)

          data = {"mutation" => nil, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            response = client.query_with_retries(query: query, variables: variables, context: context)
            data["errors"] = response["errors"] if response["errors"]
            data["mutation"] = response.dig("data", "updateServiceLink")
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
            mutation updateServiceLink#{GraphqlQuerySemantics.graphql_variable_declaration(variables, variable_types: VARIABLE_GRAPHQL_TYPES, include_parens: true)} {
              updateServiceLink(input: { #{GraphqlQuerySemantics.graphql_variable_passing(variables)} }) {
                clientMutationId
                serviceLink {
                  id
                  name
                  description
                  kind
                  url
                  source
                }
              }
            }
          GRAPHQL
        end
      end
    end

    class ServicesQueryBinder < QueryBinder
      # Update or create a service link.
      #
      # @param client_mutation_id [String] A unique identifier for the client performing the mutation.
      # @param description [String] The description of the link
      # @param kind [String] The kind of the link
      # @param name [String] The title of the link
      # @param service_name [String] The name of the service
      # @param url [String] The link URL
      # @param context [Hash] Additional headers to add to the request (optional)
      #
      # @return [Response]
      def update_link(**kwargs)
        Response.new Client::Services::UpdateServiceLinkMutation.execute(client: client, **kwargs)
      end
    end
  end
end
