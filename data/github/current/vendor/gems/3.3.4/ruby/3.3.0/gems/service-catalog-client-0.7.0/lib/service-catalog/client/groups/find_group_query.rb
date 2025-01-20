# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Groups
      # Find a group by name.
      module FindGroupQuery
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.groups.find"

        # Execute the Find Group query to fetch a specific group.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param name [String] The name of the group to search for (exact)
        #
        # @return Hash with "errors" and "data" keys.
        def self.execute(client:, name:, context: {}, group_detail_fragment: GroupsQueryBinder::GROUP_DETAIL_FRAGMENT)
          variables = { name: name }
          query = build_query(variables, group_detail_fragment: group_detail_fragment)

          data = {"data" => {"group" => nil}, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            response = client.query_with_retries(query: query, variables: variables, context: context)
            data["errors"].concat(response["errors"]) if response["errors"]
            data["data"]["group"] = response.dig("data", "group")
          end

          data
        end

        # Build the query to find a group.
        #
        # @param variables - Hash of variables to send (camelCased keys)
        # @param group_detail_fragment (optional) - a String containing a GraphQL fragment called `GroupDetail`
        #
        # @return [String] The query
        def self.build_query(variables, group_detail_fragment: GroupsQueryBinder::GROUP_DETAIL_FRAGMENT)
          <<~GRAPHQL
            query findGroup(#{GraphqlQuerySemantics.graphql_variable_declaration(variables, strict: true)}) {
              group(#{GraphqlQuerySemantics.graphql_variable_passing(variables)}) {
                ...GroupDetail
              }
            }
            #{group_detail_fragment}
          GRAPHQL
        end
      end
    end
  end
end
