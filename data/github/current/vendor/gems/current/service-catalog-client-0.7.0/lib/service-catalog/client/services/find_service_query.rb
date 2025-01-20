# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Services
      # Find a service by name.
      module FindServiceQuery
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.services.find"

        # Execute the Find Service query to fetch a specific service.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param name [String] The name of the service to search for (exact)
        # @param service_detail_fragment (optional) - a String containing a GraphQL fragment called `ServiceDetail`
        #
        # @return Hash with "errors" and "services" keys.
        def self.execute(client:, name:, service_detail_fragment: ServicesQueryBinder::SERVICE_DETAIL_FRAGMENT, context: {})
          variables = { name: name }
          query = build_query(variables, service_detail_fragment: service_detail_fragment)

          data = {"data" => {"service" => nil}, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            response = client.query_with_retries(query: query, variables: variables, context: context)
            data["errors"].concat(response["errors"]) if response["errors"]
            data["data"]["service"] = response.dig("data", "service")
          end

          data
        end

        # Build the query to find a service.
        #
        # @param variables - Hash of variables to send (camelCased keys)
        # @param service_detail_fragment (optional) - a String containing a GraphQL fragment called `ServiceDetail`
        #
        # Returns the query given the kwargs.
        def self.build_query(variables, service_detail_fragment: ServicesQueryBinder::SERVICE_DETAIL_FRAGMENT)
          <<~GRAPHQL
            query findService(#{GraphqlQuerySemantics.graphql_variable_declaration(variables, strict: true)}) {
              service(#{GraphqlQuerySemantics.graphql_variable_passing(variables)}) {
                ...ServiceDetail
              }
            }
            #{service_detail_fragment}
          GRAPHQL
        end
      end
    end
  end
end
