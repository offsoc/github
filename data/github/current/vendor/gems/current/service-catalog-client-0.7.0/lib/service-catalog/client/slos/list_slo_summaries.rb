# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Slos
      # A list of reporting windows that describe if the SLO was met
      module ListSloSummariesQuery
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.slos.slo_summaries"

        # GraphQL types for the known GraphQL arguments
        VARIABLE_GRAPHQL_TYPES = {
          "after" => "String",
          "before" => "String",
          "first" => "Int",
          "last" => "Int",
          "maximumEndTime" => "ISO8601DateTime",
          "minimumStartTime" => "ISO8601DateTime",
          "name" => "String!",
          "serviceName" => "String!",
        }

        # A list of reporting windows that describe if the SLO was met
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param after [String] Returns the elements in the list that come after the specified cursor.
        # @param before [String] Returns the elements in the list that come before the specified cursor.
        # @param first [Integer] Returns the first _n_ elements from the list.
        # @param last [Integer] Returns the last _n_ elements from the list.
        # @param maximum_end_time [Time] The last instant for SLO summaries to be included.
        # @param minimum_start_time [Time] The first instant for SLO summaries to be included.
        # @param service_name [String] The name of the service the SLO belongs to.
        # @param name [String] The name of the SLO
        # @param detail_fragment [String] GraphQL detail fragment for the model
        #
        # @return [Hash]
        def self.execute(client:, context: {}, detail_fragment: SlosQueryBinder::SLO_SUMMARY_DETAIL_FRAGMENT, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          variables["after"] ||= nil
          query = build_query(variables)

          data = {"data" => {"slo_summaries" => []}, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            loop do
              response = client.query_with_retries(query: query, variables: variables, context: context)
              if response["errors"]
                data["errors"].concat(response["errors"])
                break
              end
              if response.dig("data", "service").nil?
                data["errors"] << {"message" => "Service with name #{variables["serviceName"].inspect} does not exist"}
                break
              end
              if response.dig("data", "service", "slo").nil?
                data["errors"] << {"message" => "SLO with name #{variables["name"].inspect} does not exist for service #{variables["serviceName"].inspect}"}
                break
              end
              if response.dig("data", "service", "slo", "sloSummaries", "totalCount") == 0
                break
              end
              response.dig("data", "service", "slo", "sloSummaries", "edges").each do |edge|
                data["data"]["slo_summaries"] << edge["node"]
              end
              break if data["data"]["slo_summaries"].size >= response.dig("data", "service", "slo", "sloSummaries", "totalCount")
              variables["after"] = response.dig("data", "service", "slo", "sloSummaries", "edges").last["cursor"]
            end
          end

          data
        end

        # Variable keys which are passed to the `slo` field instead of the `sloSummaries` field.
        NON_SUMMARY_VARIABLE_KEYS = %w[name serviceName]

        # Build query for this query.
        #
        # @param variables [Hash] Input variables in GraphQL variable format as keys.
        #
        # @return [String] The mutation query
        def self.build_query(variables, detail_fragment: SlosQueryBinder::SLO_SUMMARY_DETAIL_FRAGMENT, **kwargs)
          summary_variables = variables.select { |k, _| !NON_SUMMARY_VARIABLE_KEYS.include?(k) }

          <<~GRAPHQL
            query listSloSummaries#{GraphqlQuerySemantics.graphql_variable_declaration(variables, variable_types: VARIABLE_GRAPHQL_TYPES, include_parens: true)} {
              service(name: $serviceName) {
                slo(name: $name) {
                  sloSummaries#{GraphqlQuerySemantics.graphql_variable_passing(summary_variables, include_parens: true)} {
                    totalCount
                    edges {
                      cursor
                      node {
                        ...SloSummaryDetail
                      }
                    }
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
      # A list of reporting windows that describe if the SLO was met
      #
      # @param after [String] Returns the elements in the list that come after the specified cursor.
      # @param before [String] Returns the elements in the list that come before the specified cursor.
      # @param first [Integer] Returns the first _n_ elements from the list.
      # @param last [Integer] Returns the last _n_ elements from the list.
      # @param maximum_end_time [Time] The last instant for SLO summaries to be included.
      # @param minimum_start_time [Time] The first instant for SLO summaries to be included.
      # @param detail_fragment [String] GraphQL detail fragment for the model
      # @param context [Hash] Additional headers to add to the request (optional)
      #
      # @return [Response]
      def list_slo_summaries(**kwargs)
        Response.new Client::Slos::ListSloSummariesQuery.execute(client: client, **kwargs)
      end
    end
  end
end
