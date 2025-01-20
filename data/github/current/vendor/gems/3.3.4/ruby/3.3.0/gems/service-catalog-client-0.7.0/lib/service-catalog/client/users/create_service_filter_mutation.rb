# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Users
      # Create a service filter
      module CreateServiceFilterMutation
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.users.create_service_filter"

        # GraphQL types for the known GraphQL arguments
        VARIABLE_GRAPHQL_TYPES = {
          "clientMutationId" => "String",
          "name" => "String!",
          "public" => "Boolean!",
          "query" => "String!",
        }

        # Create a service filter
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param client_mutation_id [String] A unique identifier for the client performing the mutation.
        # @param name [String] A name for the filter.
        # @param public [Boolean] Public filters can be viewed and modified by other users.
        # @param query [String] The service filter query.
        #
        # @return [Hash]
        def self.execute(client:, context: {}, detail_fragment: UsersQueryBinder::SERVICE_FILTER_DETAIL_FRAGMENT, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          query = build_query(variables, detail_fragment: detail_fragment)

          data = {"mutation" => nil, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            response = client.query_with_retries(query: query, variables: variables, context: context)
            data["errors"] = response["errors"] if response["errors"]
            data["mutation"] = response.dig("data", "createServiceFilter")
          end

          data
        end

        # Build query for this query.
        #
        # @param variables [Hash] Input variables in GraphQL variable format as keys.
        #
        # @return [String] The mutation query
        def self.build_query(variables, detail_fragment: UsersQueryBinder::SERVICE_FILTER_DETAIL_FRAGMENT, **kwargs)
          <<~GRAPHQL
            mutation createServiceFilter#{GraphqlQuerySemantics.graphql_variable_declaration(variables, variable_types: VARIABLE_GRAPHQL_TYPES, include_parens: true)} {
              createServiceFilter(input: { #{GraphqlQuerySemantics.graphql_variable_passing(variables)} }) {
                clientMutationId
                serviceFilter {
                  ...ServiceFilterDetail
                }
              }
            }
            #{detail_fragment}
          GRAPHQL
        end
      end
    end

    class UsersQueryBinder < QueryBinder
      # Create a service filter
      #
      # @param client_mutation_id [String] A unique identifier for the client performing the mutation.
      # @param name [String] A name for the filter.
      # @param public [Boolean] Public filters can be viewed and modified by other users.
      # @param query [String] The service filter query.
      # @param context [Hash] Additional headers to add to the request (optional)
      #
      # @return [Response]
      def create_service_filter(**kwargs)
        Response.new Client::Users::CreateServiceFilterMutation.execute(client: client, **kwargs)
      end
    end
  end
end
