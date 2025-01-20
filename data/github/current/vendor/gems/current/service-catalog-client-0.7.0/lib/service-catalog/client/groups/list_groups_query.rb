# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Groups
      # List all groups meeting optional criteria.
      module ListGroupsQuery
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.groups.list"

        # Execute the List Groups query to list all groups.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param tag [String] (optional) A tag to filter by
        #
        # @return Hash with "errors" and "groups" keys.
        def self.execute(client:, context: {}, group_detail_fragment: GroupsQueryBinder::GROUP_DETAIL_FRAGMENT, **kwargs)
          # tag:
          kwargs[:after] ||= ""
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          query = build_query(variables, group_detail_fragment: group_detail_fragment)
          variables["after"] = nil if variables["after"].empty?

          data = {"data" => {"groups" => []}, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            loop do
              response = client.query_with_retries(query: query, variables: variables, context: context)
              if response["errors"]
                data["errors"].concat(response["errors"])
                break
              end
              response["data"]["groups"]["edges"].each do |edge|
                data["data"]["groups"] << edge["node"]
              end
              break if data["data"]["groups"].size >= response["data"]["groups"]["totalCount"]
              variables["after"] = response["data"]["groups"]["edges"].last["cursor"]
            end
          end

          data
        end

        # Build the query to list groups (paginated)
        #
        # Pass keyword arguments corresponding to the `groups` top-level query on the GraphQL API.
        #
        # Injects pagination field `after`.
        #
        # @param variables [Hash] GraphQL-formatted variables.
        #
        # @return [String] The query
        def self.build_query(variables, group_detail_fragment: GroupsQueryBinder::GROUP_DETAIL_FRAGMENT)
          <<~GRAPHQL
            query listGroups(#{GraphqlQuerySemantics.graphql_variable_declaration(variables)}) {
              groups(#{GraphqlQuerySemantics.graphql_variable_passing(variables)}) {
                totalCount
                edges {
                  cursor
                  node {
                    ...GroupDetail
                  }
                }
              }
            }
            #{group_detail_fragment}
          GRAPHQL
        end
      end
    end
  end
end
