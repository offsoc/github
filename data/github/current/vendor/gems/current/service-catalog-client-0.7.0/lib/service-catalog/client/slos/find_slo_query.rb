# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Slos
      # Look up an SLO by service & name.
      module FindSloQuery
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.slos.slo"

        # GraphQL types for the known GraphQL arguments
        VARIABLE_GRAPHQL_TYPES = {
          "name" => "String!",
          "serviceName" => "String!",
        }

        # Look up an SLO by service & name.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param name [String] The SLO's name
        # @param service_name [String] The SLO's service name
        # @param detail_fragment [String] GraphQL detail fragment for the model
        #
        # @return [Hash]
        def self.execute(client:, context: {}, detail_fragment: SlosQueryBinder::SLO_DETAIL_FRAGMENT, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          query = build_query(variables)

          data = {"data" => {"slo" => nil}, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            response = client.query_with_retries(query: query, variables: variables, context: context)
            data["errors"].concat(response["errors"]) if response["errors"]
            data["data"]["slo"] = response.dig("data", "service", "slo")
          end

          data
        end

        # Build query for this query.
        #
        # @param variables [Hash] Input variables in GraphQL variable format as keys.
        #
        # @return [String] The mutation query
        def self.build_query(variables, detail_fragment: SlosQueryBinder::SLO_DETAIL_FRAGMENT, **kwargs)
          <<~GRAPHQL
            query findSlo#{GraphqlQuerySemantics.graphql_variable_declaration(variables, variable_types: VARIABLE_GRAPHQL_TYPES, include_parens: true)} {
              service(name: $serviceName) {
                slo(name: $name) {
                  ...SloDetail
                }
              }
            }
            #{detail_fragment}
          GRAPHQL
        end
      end
    end

    class SlosQueryBinder < QueryBinder
      # Look up an SLO by service & name.
      #
      # @param name [String] The SLO's name
      # @param service_name [String] The SLO's service name
      # @param detail_fragment [String] GraphQL detail fragment for the model
      # @param context [Hash] Additional headers to add to the request (optional)
      #
      # @return [Response]
      def find(**kwargs)
        Response.new Client::Slos::FindSloQuery.execute(client: client, **kwargs)
      end
    end
  end
end
