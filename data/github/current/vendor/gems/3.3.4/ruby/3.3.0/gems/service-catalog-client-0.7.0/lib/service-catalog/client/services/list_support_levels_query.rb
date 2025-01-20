# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Services
      # List all support levels for a service.
      module ListSupportLevelsQuery
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.services.support_levels"

        # Execute the List Service Support Levels query to list all support levels for a service.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param service_name [String] The name of the service whose support levels you're requesting (exact)
        #
        # @return Hash with "errors" and "data" keys.
        def self.execute(client:, context: {}, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          variables["after"] ||= nil
          query = build_query

          data = {"data" => {"supportLevels" => []}, "errors" => []}
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
              Array(response.dig("data", "service", "supportLevels", "edges")).each do |edge|
                data["data"]["supportLevels"] << edge["node"]
              end
              break if data["data"]["supportLevels"].size >= response.dig("data", "service", "supportLevels", "totalCount")
              variables["after"] = response.dig("data", "service", "supportLevels", "edges").last["cursor"]
            end
          end

          data
        end

        # Build the query to list support levels with pagination.
        #
        # @return [String] the GraphQL query
        def self.build_query
          <<~GRAPHQL
            query listSupportLevels($after: String, $serviceName: String!) {
              service(name: $serviceName) {
                supportLevels(after: $after) {
                  totalCount
                  edges {
                    cursor
                    node {
                      id
                      issue
                      level
                      pagerduty
                      slack
                      tta
                      pagerdutyFriendlyName
                    }
                  }
                }
              }
            }
          GRAPHQL
        end
      end
    end
  end
end
