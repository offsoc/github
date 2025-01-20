# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Services
      # List all service metadata values meeting optional criteria.
      module ListServiceMetadataValuesQuery
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.services.service_metadata_values"

        # Execute the List Service Metadata Values query to list all service metadata values for a service.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param service_name [String] The name of the service whose metadata values you're requesting (exact)
        # @param service_metadata_kind_names [Array<String>] A list of metadata kinds to retrieve. If set to nil, metadata values of any kind are returned. (optional)
        # @param service_metadata_value_detail_fragment [String] (optional) A GraphQL fragment defining 'ServiceMetadataValueDetail' to fetch the metadata value fields desired
        #
        # @return Hash with "errors" and "services" keys.
        def self.execute(client:, context: {}, service_metadata_value_detail_fragment: ServicesQueryBinder::SERVICE_METADATA_VALUE_DETAIL_FRAGMENT, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          variables["after"] ||= nil
          query = build_query(service_metadata_value_detail_fragment: service_metadata_value_detail_fragment)

          data = {"data" => {"serviceMetadataValues" => {}}, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            loop do
              response = client.query_with_retries(query: query, variables: variables, context: context)
              if response["errors"]
                data["errors"].concat(response["errors"])
                break
              end
              if response["data"]["service"].nil?
                data["errors"].push("The service: #{variables["serviceName"]} could not be found.")
                break
              end
              response["data"]["service"]["serviceMetadataValues"]["edges"].each do |edge|
                kind = edge.dig("node", "serviceMetadataKind", "name")
                data["data"]["serviceMetadataValues"][kind] ||= []
                data["data"]["serviceMetadataValues"][kind] << edge["node"]
              end
              break unless response.dig("data", "service", "serviceMetadataValues", "pageInfo", "hasNextPage")
              variables["after"] = response.dig("data", "service", "serviceMetadataValues", "edges").last["cursor"]
            end
          end

          data
        end

        # Build the query to list service links with pagination.
        #
        # @param service_metadata_value_detail_fragment [String] (optional) A GraphQL fragment defining 'ServiceMetadataValueDetail' to fetch the metadata value fields desired
        #
        # @return [String] the GraphQL query
        def self.build_query(service_metadata_value_detail_fragment: ServicesQueryBinder::SERVICE_METADATA_VALUE_DETAIL_FRAGMENT)
          <<~GRAPHQL
            query listServiceMetadataValues($after: String, $serviceName: String!, $serviceMetadataKindNames: [String!]) {
              service(name: $serviceName) {
                serviceMetadataValues(after: $after, serviceMetadataKindNames: $serviceMetadataKindNames) {
                  totalCount
                  pageInfo {
                    hasNextPage
                  }
                  edges {
                    cursor
                    node {
                      ...ServiceMetadataValueDetail
                    }
                  }
                }
              }
            }
            #{service_metadata_value_detail_fragment}
          GRAPHQL
        end
      end
    end
  end
end
