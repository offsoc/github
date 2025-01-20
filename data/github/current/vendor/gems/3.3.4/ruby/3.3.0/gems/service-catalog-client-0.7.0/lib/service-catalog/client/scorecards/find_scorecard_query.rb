# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Scorecards
      # Look up a scorecard by name.
      module FindScorecardQuery
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.scorecards.scorecard"

        # GraphQL types for the known GraphQL arguments
        VARIABLE_GRAPHQL_TYPES = {
          "name" => "String!",
        }

        # Look up a scorecard by name.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param name [String] The scorecard's name.
        # @param detail_fragment [String] GraphQL detail fragment for the model
        #
        # @return [Hash]
        def self.execute(client:, context: {}, detail_fragment: ScorecardsQueryBinder::SCORECARD_DETAIL_FRAGMENT, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          query = build_query(variables)

          data = {"data" => {"scorecard" => nil}, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            response = client.query_with_retries(query: query, variables: variables, context: context)
            data["errors"].concat(response["errors"]) if response["errors"]
            data["data"]["scorecard"] = response.dig("data", "scorecard")
          end

          data
        end

        # Build query for this query.
        #
        # @param variables [Hash] Input variables in GraphQL variable format as keys.
        #
        # @return [String] The mutation query
        def self.build_query(variables, detail_fragment: ScorecardsQueryBinder::SCORECARD_DETAIL_FRAGMENT, **kwargs)
          <<~GRAPHQL
            query findScorecard#{GraphqlQuerySemantics.graphql_variable_declaration(variables, variable_types: VARIABLE_GRAPHQL_TYPES, include_parens: true)} {
              scorecard#{GraphqlQuerySemantics.graphql_variable_passing(variables, include_parens: true)} {
                ...ScorecardDetail
              }
            }
            #{detail_fragment}
          GRAPHQL
        end
      end
    end

    class ScorecardsQueryBinder < QueryBinder
      # Look up a scorecard by name.
      #
      # @param name [String] The scorecard's name.
      # @param detail_fragment [String] GraphQL detail fragment for the model
      # @param context [Hash] Additional headers to add to the request (optional)
      #
      # @return [Response]
      def find(**kwargs)
        Response.new Client::Scorecards::FindScorecardQuery.execute(client: client, **kwargs)
      end
    end
  end
end
