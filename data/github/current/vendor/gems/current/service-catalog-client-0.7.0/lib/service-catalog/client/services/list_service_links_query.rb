# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Services
      # List all services meeting optional criteria.
      module ListServiceLinksQuery
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.services.links"

        # Execute the List Service Links query to list all service links for a service.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param service_name [String] The name of the service whose links you're requesting (exact)
        # @param service_link_detail_fragment [String] (optional) A GraphQL fragment defining 'ServiceLinkDetail' to fetch the link fields desired
        #
        # @return Hash with "errors" and "services" keys.
        def self.execute(client:, context: {}, service_link_detail_fragment: ServicesQueryBinder::SERVICE_LINK_DETAIL_FRAGMENT, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          variables["after"] ||= nil
          query = build_query(service_link_detail_fragment: service_link_detail_fragment)

          data = {"data" => {"serviceLinks" => []}, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            loop do
              response = client.query_with_retries(query: query, variables: variables, context: context)
              if response["errors"]
                data["errors"].concat(response["errors"])
                break
              end
              response["data"]["service"]["links"]["edges"].each do |edge|
                data["data"]["serviceLinks"] << edge["node"]
              end
              break if data["data"]["serviceLinks"].size >= response.dig("data", "service", "links", "totalCount")
              variables["after"] = response.dig("data", "service", "links", "edges").last["cursor"]
            end
          end

          data
        end

        # Build the query to list service links with pagination.
        #
        # @param service_link_detail_fragment [String] (optional) A GraphQL fragment defining 'ServiceLinkDetail' to fetch the link fields desired
        #
        # @return [String] the GraphQL query
        def self.build_query(service_link_detail_fragment: ServicesQueryBinder::SERVICE_LINK_DETAIL_FRAGMENT)
          <<~GRAPHQL
            query listServiceLinks($after: String, $serviceName: String!) {
              service(name: $serviceName) {
                links(after: $after) {
                  totalCount
                  edges {
                    cursor
                    node {
                      ...ServiceLinkDetail
                    }
                  }
                }
              }
            }
            #{service_link_detail_fragment}
          GRAPHQL
        end
      end
    end
  end
end
