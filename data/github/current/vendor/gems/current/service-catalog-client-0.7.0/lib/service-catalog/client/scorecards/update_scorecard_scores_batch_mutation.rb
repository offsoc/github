# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Scorecards
      # Update a scorecard score for a service.
      module UpdateScorecardScoresBatchMutation
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.scorecards.batch_update_scores"

        # Submit batch scorecard score updates.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param detail_fragment [String] GraphQL detail fragment defining `RequirementScoreDetail` (optional)
        # @param scores [Array] Array of Hash scores containing keys:
        #          - scorecard_name [String] The name of the scorecard
        #          - service_name [String] The name of the service to score (exact)
        #          - objective_name [String] The name of the objective
        #          - requirement_name [String] The name of the requirement
        #          - score [Integer] The new score
        #          - notes [String] Any notes for the new score
        #
        # @return [Hash]
        def self.execute(client:, context: {}, detail_fragment: ScorecardsQueryBinder::REQUIREMENT_SCORE_DETAIL_FRAGMENT, **kwargs)
          variables = prepare_batch_input(**kwargs)
          query = build_query(variables, detail_fragment: detail_fragment)

          data = {"batch" => nil, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY, batch_size: variables.size) do
            response = client.query_with_retries(query: query, variables: variables, context: context)
            data["errors"] = response["errors"] if response["errors"]
            data["batch"] = response.dig("data")
          end

          data
        end

        # Build query for updating a scoreccard score given the input variables (in GraphQL form).
        #
        # @param variables [Hash] Input variables in GraphQL variable format as keys.
        # @param detail_fragment [String] GraphQL detail fragment defining `RequirementScoreDetail` (optional)
        #
        # @return [String] The mutation query
        def self.build_query(variables, detail_fragment: ScorecardsQueryBinder::REQUIREMENT_SCORE_DETAIL_FRAGMENT)
          operations = variables.each_with_object([]) do |(k, _), ops|
            ops << <<~GRAPHQL
              #{k}: updateScorecardScore(input: $#{k}) {
                clientMutationId
                requirementScore {
                  ...RequirementScoreDetail
                }
              }
            GRAPHQL
          end

          variable_types = variables.each_with_object({}) { |(k, v), types| types[k] = "UpdateScorecardScoreInput!" }
          <<~GRAPHQL
            mutation updateScorecardScoreBatch(#{GraphqlQuerySemantics.graphql_variable_declaration(variables, variable_types: variable_types)}){
              #{operations.join("\n")}
            }
            #{detail_fragment}
          GRAPHQL
        end

        def self.prepare_batch_input(scores:)
          index = 0
          scores.each.with_index.with_object({}) do |(score, index), vars|
            key = "operation#{index.to_s.rjust(4, "0")}"
            vars[key] = score.transform_keys { |k| ActiveSupport::Inflector.camelize(k, false) }
            vars[key]["score"] = vars[key]["score"].to_i
            vars[key]["clientMutationId"] = key
          end
        end
      end
    end


    class ScorecardsQueryBinder < QueryBinder
      # Submit batch scorecard score updates.
      #
      # @param context [Hash] Additional headers to add to the request (optional)
      # @param detail_fragment [String] GraphQL detail fragment defining `RequirementScoreDetail` (optional)
      # @param scores [Array] Array of Hash scores containing keys:
      #          - scorecard_name [String] The name of the scorecard
      #          - service_name [String] The name of the service to score (exact)
      #          - objective_name [String] The name of the objective
      #          - requirement_name [String] The name of the requirement
      #          - score [Integer] The new score
      #          - notes [String] Any notes for the new score
      #
      # @return [Response]
      def batch_update_scores(**kwargs)
        Response.new Client::Scorecards::UpdateScorecardScoresBatchMutation.execute(client: client, detail_fragment: ScorecardsQueryBinder::REQUIREMENT_SCORE_DETAIL_FRAGMENT, **kwargs)
      end
    end
  end
end
