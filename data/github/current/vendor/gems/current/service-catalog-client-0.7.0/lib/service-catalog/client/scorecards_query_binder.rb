# frozen_string_literal: true

require File.expand_path("query_binder.rb", __dir__)
Dir[File.expand_path("scorecards/*.rb", __dir__)].each { |f| require f }

module ServiceCatalog
  class Client
    # ScorecardsQueryBinder contains methods for accessing scorecards and scorecard summaries.
    class ScorecardsQueryBinder < QueryBinder
      # A default scorecard detail fragment.
      SCORECARD_DETAIL_FRAGMENT = <<~'GRAPHQL'
        fragment ScorecardDetail on Scorecard {
          id
          name
          description
          canEdit
          nextMilestone {
            id
            name
            daysToTarget
            description
            targetDate
          }
          services {
            totalCount
            edges {
              cursor
              node {
                name
              }
            }
          }
          objectives {
            totalCount
            edges {
              cursor
              node {
                id
                name
                description
                docs
                requirements {
                  totalCount
                  edges {
                    cursor
                    node {
                      id
                      name
                      description
                      docs
                      maxScore
                    }
                  }
                }
              }
            }
          }
          milestones {
            nodes {
              name
              description
              targetScore
              targetDate
              daysToTarget
            }
          }
        }
      GRAPHQL

      # A default RequirementScoreDetail fragment.
      REQUIREMENT_SCORE_DETAIL_FRAGMENT = <<~GRAPHQL
        fragment RequirementScoreDetail on RequirementScore {
          id
          score
          maxScore
          notes
          service {
            name
          }
          requirement {
            name
            objective {
              name
              scorecard {
                name
              }
            }
          }
        }
      GRAPHQL

      # List all Scorecard Summaries for a given service.
      #
      # @param service_name [String] the name of the Service
      #
      # @return [Response] #data is populated with an Array of scorecard summaries for the service
      def summaries(**kwargs)
        Response.new Client::Scorecards::ListScorecardSummariesQuery.execute(client: client, **kwargs)
      end

      # Update a score for a scorecard on a given service.
      #
      # @param context [Hash] (optional) Added context to add to the request as headers
      # @param scorecard_name [String] The name of the scorecard
      # @param service_name [String] The name of the service to score
      # @param objective_name [String] The name of the objective
      # @param requirement_name [String] The name of the requirement
      # @param score [Integer] The new score
      # @param notes [String] Any notes for the new score
      #
      # @return [Response]
      def update_score(**kwargs)
        Response.new Client::Scorecards::UpdateScorecardScoreMutation.execute(client: client, **kwargs)
      end
    end
  end
end
