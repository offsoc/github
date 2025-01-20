# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Services
      # Execute the deleteServiceMetadataValue Mutation.
      module DeleteServiceMetadataValueMutation
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.services.delete_service_metadata_value"

        # GraphQL types for the known GraphQL arguments
        VARIABLE_GRAPHQL_TYPES = {
          "clientMutationId" => "String",
          "serviceMetadataKindName" => "String!",
          "serviceName" => "String!",
          "value" => "String!",
        }

        # Execute the deleteServiceMetadataValue Mutation.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param client_mutation_id [String] A unique identifier for the client performing the mutation.
        # @param service_metadata_kind_name [String]
        # @param service_name [String]
        # @param value [String]
        #
        # @return [Hash]
        def self.execute(client:, context: {}, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          query = build_query(variables)

          data = {"mutation" => nil, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            response = client.query_with_retries(query: query, variables: variables, context: context)
            data["errors"] = response["errors"] if response["errors"]
            data["mutation"] = response.dig("data", "deleteServiceMetadataValue")
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
            mutation deleteServiceMetadataValue#{GraphqlQuerySemantics.graphql_variable_declaration(variables, variable_types: VARIABLE_GRAPHQL_TYPES, include_parens: true)} {
              deleteServiceMetadataValue(input: { #{GraphqlQuerySemantics.graphql_variable_passing(variables)} }) {
                clientMutationId
              }
            }
          GRAPHQL
        end
      end
    end

    class ServicesQueryBinder < QueryBinder
      # Execute the deleteServiceMetadataValue Mutation.
      #
      # @param client_mutation_id [String] A unique identifier for the client performing the mutation.
      # @param service_metadata_kind_name [String]
      # @param service_name [String]
      # @param value [String]
      # @param context [Hash] Additional headers to add to the request (optional)
      #
      # @return [Response]
      def delete_service_metadata_value(**kwargs)
        Response.new Client::Services::DeleteServiceMetadataValueMutation.execute(client: client, **kwargs)
      end
    end
  end
end
