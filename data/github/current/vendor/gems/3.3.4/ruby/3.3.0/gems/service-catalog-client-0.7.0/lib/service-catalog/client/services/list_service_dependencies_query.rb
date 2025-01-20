# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Services
      # List all service dependencies for a service.
      module ListServiceDependenciesQuery
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.services.dependencies"

        # Execute the List Service Dependencies query to list all service dependencies for a service.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param service_name [String] The name of the service whose dependencies you're requesting (exact)
        #
        # @return Hash with "errors" and "services" keys.
        def self.execute(client:, context: {}, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          variables["after"] ||= nil
          query = build_query

          data = {"data" => {"serviceDependencies" => []}, "errors" => []}
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
              response["data"]["service"]["serviceDependencies"]["edges"].each do |edge|
                data["data"]["serviceDependencies"] << edge["node"]
              end
              break if data["data"]["serviceDependencies"].size >= response.dig("data", "service", "serviceDependencies", "totalCount")
              variables["after"] = response.dig("data", "service", "serviceDependencies", "edges").last["cursor"]
            end
          end

          data
        end

        # Build the query to list service dependencies with pagination.
        #
        # @return [String] the GraphQL query
        def self.build_query
          <<~GRAPHQL
            query listServiceDependencies($after: String, $serviceName: String!) {
              service(name: $serviceName) {
                serviceDependencies(after: $after) {
                  totalCount
                  edges {
                    cursor
                    node {
                      id
                      dependency {
                        id
                        name
                      }
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
