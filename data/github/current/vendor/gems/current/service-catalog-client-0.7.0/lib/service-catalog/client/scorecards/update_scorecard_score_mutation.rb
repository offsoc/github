# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Scorecards
      # Update a scorecard score for a service.
      module UpdateScorecardScoreMutation
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.scorecards.update_score"

        # Update a Scorecard Score for a given service.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param scorecard_name [String] The name of the scorecard
        # @param service_name [String] The name of the service to score (exact)
        # @param objective_name [String] The name of the objective
        # @param requirement_name [String] The name of the requirement
        # @param score [Integer] The new score
        # @param notes [String] Any notes for the new score
        #
        # @return [Hash]
        def self.execute(client:, context: {}, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          variables["score"] = variables["score"].to_i
          query = build_query(variables)

          data = {"updateScorecardScore" => nil, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            response = client.query_with_retries(query: query, variables: variables, context: context)
            data["errors"] = response["errors"] if response["errors"]
            data["updateScorecardScore"] = response.dig("data", "updateScorecardScore")
          end

          data
        end

        # Build query for updating a scoreccard score given the input variables (in GraphQL form).
        #
        # @param variables [Hash] Input variables in GraphQL variable format as keys.
        #
        # @return [String] The mutation query
        def self.build_query(variables)
          <<~GRAPHQL
            mutation updateScorecardQuery(#{GraphqlQuerySemantics.graphql_variable_declaration(variables, strict: true)}){
              updateScorecardScore(input: { #{GraphqlQuerySemantics.graphql_variable_passing(variables)} }) {
                  requirementScore {
                      id
                      score
                      maxScore
                      notes
                  }
              }
            }
          GRAPHQL
        end
      end
    end
  end
end
