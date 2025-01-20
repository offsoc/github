# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Services
      # Create or update a service.
      module UpdateServiceMutation
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.services.update"

        # GraphQL types for all the arguments in this
        VARIABLE_GRAPHQL_TYPES = {
          "clientMutationId" => "String",
          "name" => "String!",
          "longName" => "String",
          "description" => "String",
          "kind" => "String!",
          "repositoryUrl" => "String!",
          "qos" => "String",
          "owners" => "[ServiceOwner!]!",
          "sourceKind" => "String!",
          "sourceLastUpdated" => "ISO8601DateTime",
          "sourceUrl" => "String!"
        }

        # Create or update a service.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param name [String] The name of the service (no spaces)
        # @param long_name [String] The friendly name of the service (Title Case)
        # @param description [String] A sentence that describes what the service does.
        # @param kind [String] A sentence that describes what the service does.
        # @param repository_url [String] A link to the service's project or code repository.
        # @param qos [String] The Quality of Service provided (e.g. critical, experimental, deprecated)
        # @param owners [ServiceOwner] A list of ServiceOwner objects describing an owner and their relationship to the service. {ownerName: "hubot", kind: "maintainer"}
        # @param source_kind [String] The source responsible for populating this information (e.g. a background job, web)
        # @param source_last_updated [Time] The time the ownership source data last changed.
        # @param source_url [String] A URL pointing to the source of the ownership information.
        #

        # @return [Hash]
        def self.execute(client:, context: {}, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          query = build_query(variables)

          data = {"updateService" => nil, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            response = client.query_with_retries(query: query, variables: variables, context: context)
            data["errors"] = response["errors"] if response["errors"]
            data["updateService"] = response.dig("data", "updateService")
          end

          data
        end

        # Build query for updating a service given the input variables (in GraphQL form).
        #
        # @param variables [Hash] Input variables in GraphQL variable format as keys.
        #
        # @return [String] The mutation query
        def self.build_query(variables, service_detail_fragment: ServicesQueryBinder::SERVICE_DETAIL_FRAGMENT)
          <<~GRAPHQL
            mutation updateService#{GraphqlQuerySemantics.graphql_variable_declaration(variables, variable_types: VARIABLE_GRAPHQL_TYPES, include_parens: true)}{
              updateService(input: { #{GraphqlQuerySemantics.graphql_variable_passing(variables)} }) {
                service {
                  ...ServiceDetail
                }
              }
            }
            #{service_detail_fragment}
          GRAPHQL
        end
      end
    end
  end
end
