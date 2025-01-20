# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Scorecards
      # List scorecard summaries for a service.
      module ListScorecardSummariesQuery
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.scorecards.summaries"

        # List scorecard summaries for a given service.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param service_name [String] The name of the service whose scores you want to look up (exact)
        #
        # @return [Hash]
        def self.execute(client:, context: {}, **kwargs)
          kwargs[:after] ||= ""
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          query = build_query(variables)
          variables["after"] = nil if variables["after"].empty?

          data = {"data" => {"summaries" => []}, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            loop do
              response = client.query_with_retries(query: query, variables: variables, context: context)
              if response["errors"]
                data["errors"].concat(response["errors"])
                return data
              end
              Array(response.dig("data", "service", "scorecards", "edges")).each do |edge|
                data["data"]["summaries"] << edge["node"]
              end
              break if data["data"]["summaries"].size >= response.dig("data", "service", "scorecards", "totalCount")
              variables["after"] = response.dig("data", "service", "scorecards", "edges").last["cursor"]
            end
          end

          data
        end

        # Build the query to list scorecard summaries.
        #
        # @param variables [Hash] Input variables in GraphQL variable format as keys.
        #
        # @return [String] The GraphQL query
        def self.build_query(variables)
          <<~GRAPHQL
            query listScorecardSummaries($serviceName: String!, $after: String) {
              service(name: $serviceName) {
                scorecards(after: $after) {
                  totalCount
                  edges {
                    cursor
                    node {
                      id
                      name
                      scorecardSummaries(first: 1, serviceName: $serviceName) {
                        nodes {
                          id
                          date
                          score
                          maxScore
                          date
                        }
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
