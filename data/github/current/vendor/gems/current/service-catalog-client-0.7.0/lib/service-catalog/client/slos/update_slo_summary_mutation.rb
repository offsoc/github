# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Slos
      # Execute the updateSloSummary Mutation.
      module UpdateSloSummaryMutation
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.slos.update_slo_summary"

        # GraphQL types for all the arguments in this
        VARIABLE_GRAPHQL_TYPES = {
          "clientMutationId" => "String",
          "endTime" => "ISO8601DateTime!",
          "percentMet13w" => "Float",
          "percentMet24h" => "Float!",
          "percentMet28d" => "Float",
          "serviceName" => "String!",
          "sloName" => "String!",
          "startTime" => "ISO8601DateTime!",
        }

        # Execute the updateSloSummary Mutation.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param client_mutation_id [String] A unique identifier for the client performing the mutation.
        # @param end_time [Time] The end time for the summary.
        # @param percent_met13w [Float] The percent this SLO was met in a 13-week period.
        # @param percent_met24h [Float] The percent this SLO was met in a 24-hour period.
        # @param percent_met28d [Float] The percent this SLO was met in a 28-day period.
        # @param service_name [String] The Service this SLO summary belongs to.
        # @param slo_name [String] The SLO this summary belongs to.
        # @param start_time [Time] The start time for the summary.
        #
        # @return [Hash]
        def self.execute(client:, context: {}, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          query = build_query(variables)

          data = {"mutation" => nil, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            response = client.query_with_retries(query: query, variables: variables, context: context)
            data["errors"] = response["errors"] if response["errors"]
            data["mutation"] = response.dig("data", "updateSloSummary")
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
            mutation updateSloSummary#{GraphqlQuerySemantics.graphql_variable_declaration(variables, variable_types: VARIABLE_GRAPHQL_TYPES, include_parens: true)} {
              updateSloSummary(input: { #{GraphqlQuerySemantics.graphql_variable_passing(variables)} }) {
                clientMutationId
              }
            }
          GRAPHQL
        end
      end
    end

    class SlosQueryBinder < QueryBinder
      # Execute the updateSloSummary Mutation.
      #
      # @param client_mutation_id [String] A unique identifier for the client performing the mutation.
      # @param end_time [Time] The end time for the summary.
      # @param percent_met13w [Float] The percent this SLO was met in a 13-week period.
      # @param percent_met24h [Float] The percent this SLO was met in a 24-hour period.
      # @param percent_met28d [Float] The percent this SLO was met in a 28-day period.
      # @param service_name [String] The Service this SLO summary belongs to.
      # @param slo_name [String] The SLO this summary belongs to.
      # @param start_time [Time] The start time for the summary.
      # @param context [Hash] Additional headers to add to the request (optional)
      #
      # @return [Response]
      def update_slo_summary(**kwargs)
        Response.new Client::Slos::UpdateSloSummaryMutation.execute(client: client, **kwargs)
      end
    end
  end
end
