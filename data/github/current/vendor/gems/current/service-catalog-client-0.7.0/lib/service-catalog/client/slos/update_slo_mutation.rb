# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Slos
      # Update an SLO's metadata.
      module UpdateSloMutation
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.slos.update_slo"

        # GraphQL types for the known GraphQL arguments
        VARIABLE_GRAPHQL_TYPES = {
          "clientMutationId" => "String",
          "name" => "String!",
          "percentTarget" => "Float",
          "playbookUrl" => "String",
          "provider" => "String",
          "providerUrl" => "String",
          "serviceName" => "String!",
        }

        # Update an SLO's metadata.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param client_mutation_id [String] A unique identifier for the client performing the mutation.
        # @param name [String] The name of the SLO.
        # @param percent_target [Float] The objective percentage the SLO should be green.
        # @param playbook_url [String] The URL to a document describing how to understand and remediate this SLO.
        # @param provider [String] The provider for the SLO.
        # @param provider_url [String] The HTML URL for the SLO.
        # @param service_name [String] The Service this SLO belongs to.
        #
        # @return [Hash]
        def self.execute(client:, context: {}, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          query = build_query(variables)

          data = {"mutation" => nil, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            response = client.query_with_retries(query: query, variables: variables, context: context)
            data["errors"] = response["errors"] if response["errors"]
            data["mutation"] = response.dig("data", "updateSlo")
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
            mutation updateSlo#{GraphqlQuerySemantics.graphql_variable_declaration(variables, variable_types: VARIABLE_GRAPHQL_TYPES, include_parens: true)} {
              updateSlo(input: { #{GraphqlQuerySemantics.graphql_variable_passing(variables)} }) {
                clientMutationId
                slo {
                  name
                  service {
                    name
                  }
                  percentTarget
                  provider
                  providerUrl
                  playbookUrl
                }
              }
            }
          GRAPHQL
        end
      end
    end

    class SlosQueryBinder < QueryBinder
      # Update an SLO's metadata.
      #
      # @param client_mutation_id [String] A unique identifier for the client performing the mutation.
      # @param name [String] The name of the SLO.
      # @param percent_target [Float] The objective percentage the SLO should be green.
      # @param playbook_url [String] The URL to a document describing how to understand and remediate this SLO.
      # @param provider [String] The provider for the SLO.
      # @param provider_url [String] The HTML URL for the SLO.
      # @param service_name [String] The Service this SLO belongs to.
      # @param context [Hash] Additional headers to add to the request (optional)
      #
      # @return [Response]
      def update(**kwargs)
        Response.new Client::Slos::UpdateSloMutation.execute(client: client, **kwargs)
      end
    end
  end
end
