# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Services
      # Search for services.
      module SearchServicesQuery
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.services.search"

        # GraphQL types for the known GraphQL arguments
        VARIABLE_GRAPHQL_TYPES = {
          "after" => "String",
          "before" => "String",
          "first" => "Int",
          "last" => "Int",
          "query" => "String!",
        }

        # Search for services.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param after [String] Returns the elements in the list that come after the specified cursor.
        # @param before [String] Returns the elements in the list that come before the specified cursor.
        # @param first [Integer] Returns the first _n_ elements from the list.
        # @param last [Integer] Returns the last _n_ elements from the list.
        # @param query [String] Search query
        # @param detail_fragment [String] GraphQL detail fragment for the model
        #
        # @return [Hash]
        def self.execute(client:, context: {}, detail_fragment: ServicesQueryBinder::SERVICE_DETAIL_FRAGMENT, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          variables["after"] ||= nil
          query = build_query(variables)

          data = {"data" => {"services" => []}, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            loop do
              response = client.query_with_retries(query: query, variables: variables, context: context)
              if response["errors"]
                data["errors"].concat(response["errors"])
                break
              end
              response["data"]["searchServices"]["edges"].each do |edge|
                data["data"]["services"] << edge["node"]["service"]
              end
              break unless response.dig("data", "searchServices", "pageInfo", "hasNextPage")
              variables["after"] = response.dig("data", "searchServices", "edges").last["cursor"]
            end
          end

          data
        end

        # Build query for this query.
        #
        # @param variables [Hash] Input variables in GraphQL variable format as keys.
        #
        # @return [String] The mutation query
        def self.build_query(variables, detail_fragment: ServicesQueryBinder::SERVICE_DETAIL_FRAGMENT, **kwargs)
          <<~GRAPHQL
            query searchServices#{GraphqlQuerySemantics.graphql_variable_declaration(variables, variable_types: VARIABLE_GRAPHQL_TYPES, include_parens: true)} {
              searchServices#{GraphqlQuerySemantics.graphql_variable_passing(variables, include_parens: true)} {
                totalCount
                pageInfo {
                  hasNextPage
                }
                edges {
                  cursor
                  node {
                    __typename
                    service {
                      ...ServiceDetail
                    }
                  }
                }
              }
            }
            #{detail_fragment}
          GRAPHQL
        end
      end
    end

    class ServicesQueryBinder < QueryBinder
      # Search for services.
      #
      # @param after [String] Returns the elements in the list that come after the specified cursor.
      # @param before [String] Returns the elements in the list that come before the specified cursor.
      # @param first [Integer] Returns the first _n_ elements from the list.
      # @param last [Integer] Returns the last _n_ elements from the list.
      # @param query [String] Search query
      # @param detail_fragment [String] GraphQL detail fragment for the model
      # @param context [Hash] Additional headers to add to the request (optional)
      #
      # @return [Response]
      def search(**kwargs)
        Response.new Client::Services::SearchServicesQuery.execute(client: client, **kwargs)
      end
    end
  end
end
