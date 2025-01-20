# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Slos
      # A list of SLOs.
      module ListSlosQuery
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.slos.slos"

        # GraphQL types for the known GraphQL arguments
        VARIABLE_GRAPHQL_TYPES = {
          "after" => "String",
          "before" => "String",
          "first" => "Int",
          "last" => "Int",
          "provider" => "String",
        }

        # A list of SLOs.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param after [String] Returns the elements in the list that come after the specified cursor.
        # @param before [String] Returns the elements in the list that come before the specified cursor.
        # @param first [Integer] Returns the first _n_ elements from the list.
        # @param last [Integer] Returns the last _n_ elements from the list.
        # @param provider [String] Filter returned SLOs by provider name.
        # @param detail_fragment [String] GraphQL detail fragment for the model
        #
        # @return [Hash]
        def self.execute(client:, context: {}, detail_fragment: SlosQueryBinder::SLO_DETAIL_FRAGMENT, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          variables["after"] ||= nil
          query = build_query(variables)

          data = {"data" => {"slos" => []}, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            loop do
              response = client.query_with_retries(query: query, variables: variables, context: context)
              if response["errors"]
                data["errors"].concat(response["errors"])
                break
              end
              response["data"]["slos"]["edges"].each do |edge|
                data["data"]["slos"] << edge["node"]
              end
              break if data["data"]["slos"].size >= response["data"]["slos"]["totalCount"]
              variables["after"] = response["data"]["slos"]["edges"].last["cursor"]
            end
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
            query listSlos#{GraphqlQuerySemantics.graphql_variable_declaration(variables, variable_types: VARIABLE_GRAPHQL_TYPES, include_parens: true)} {
              slos#{GraphqlQuerySemantics.graphql_variable_passing(variables, include_parens: true)} {
                totalCount
                edges {
                  cursor
                  node {
                    ...SloDetail
                  }
                }
              }
            }
            #{detail_fragment}
          GRAPHQL
        end
      end
    end

    class SlosQueryBinder < QueryBinder
      # A list of SLOs.
      #
      # @param after [String] Returns the elements in the list that come after the specified cursor.
      # @param before [String] Returns the elements in the list that come before the specified cursor.
      # @param first [Integer] Returns the first _n_ elements from the list.
      # @param last [Integer] Returns the last _n_ elements from the list.
      # @param provider [String] Filter returned SLOs by provider name.
      # @param detail_fragment [String] GraphQL detail fragment for the model
      # @param context [Hash] Additional headers to add to the request (optional)
      #
      # @return [Response]
      def list(**kwargs)
        Response.new Client::Slos::ListSlosQuery.execute(client: client, **kwargs)
      end
    end
  end
end
