# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Services
      # Update a support level for a given service. If it does not exist, it will be created.
      module UpdateSupportLevelMutation
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.services.update_support_level"

        # GraphQL types for the known GraphQL arguments
        VARIABLE_GRAPHQL_TYPES = {
          "clientMutationId" => "String",
          "issue" => "String",
          "level" => "String!",
          "pagerduty" => "String",
          "serviceName" => "String!",
          "slack" => "String",
          "tta" => "String",
        }

        # Update a support level for a given service. If it does not exist, it will be created.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param client_mutation_id [String] A unique identifier for the client performing the mutation.
        # @param issue [String] The GitHub issue URL associated with this Service
        # @param level [String] The severity of a support request
        # @param pagerduty [String] The Pagerduty escalation policy URL associated with this Service
        # @param service_name [String] The name of the service whose support level you're removing (exact)
        # @param slack [String] The Slack channel associated with this Service
        # @param tta [String] How long to wait for an acknowledgement
        #
        # @return [Hash]
        def self.execute(client:, context: {}, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          query = build_query(variables)

          data = {"mutation" => nil, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            response = client.query_with_retries(query: query, variables: variables, context: context)
            data["errors"] = response["errors"] if response["errors"]
            data["mutation"] = response.dig("data", "updateSupportLevel")
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
            mutation updateSupportLevel#{GraphqlQuerySemantics.graphql_variable_declaration(variables, variable_types: VARIABLE_GRAPHQL_TYPES, include_parens: true)} {
              updateSupportLevel(input: { #{GraphqlQuerySemantics.graphql_variable_passing(variables)} }) {
                clientMutationId
                supportLevel {
                  id
                  level
                  tta
                  slack
                  pagerduty
                  issue
                }
              }
            }
          GRAPHQL
        end
      end
    end

    class ServicesQueryBinder < QueryBinder
      # Update a support level for a given service. If it does not exist, it will be created.
      #
      # @param client_mutation_id [String] A unique identifier for the client performing the mutation.
      # @param issue [String] The GitHub issue URL associated with this Service
      # @param level [String] The severity of a support request
      # @param pagerduty [String] The Pagerduty escalation policy URL associated with this Service
      # @param service_name [String] The name of the service whose support level you're removing (exact)
      # @param slack [String] The Slack channel associated with this Service
      # @param tta [String] How long to wait for an acknowledgement
      # @param context [Hash] Additional headers to add to the request (optional)
      #
      # @return [Response]
      def update_support_level(**kwargs)
        Response.new Client::Services::UpdateSupportLevelMutation.execute(client: client, **kwargs)
      end
    end
  end
end
