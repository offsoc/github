# frozen_string_literal: true

module ServiceCatalog
  class Client
    module Groups
      # Update or create a group.
      module UpdateGroupMutation
        # The instrumentation key for this query used by ActiveSupport::Notifications.
        INSTRUMENTATION_KEY = "service_catalog_client.groups.update"

        # Update or create a group.
        #
        # @param client [ServiceCatalog::Client] The ServiceCatalog::Client
        # @param context [Hash] Additional headers to add to the request (optional)
        # @param name [String] The name of the group (exact)
        # @param description [String] A description of the group.
        # @param groups [Array<String>] Groups to include in the group. Send EITHER +groups+ or +services+.
        # @param services [Array<String>] Services to include in the group. Send EITHER +groups+ or +services+.
        # @param tags [Array<String>] Tags associated with the group
        #
        # @return [Hash]
        def self.execute(client:, context: {}, group_detail_fragment: GroupsQueryBinder::GROUP_DETAIL_FRAGMENT, **kwargs)
          variables = GraphqlQuerySemantics.kwargs_to_graphql_variables(kwargs)
          query = build_query(variables, group_detail_fragment: group_detail_fragment)

          data = {"mutation" => nil, "errors" => []}
          ActiveSupport::Notifications.instrument(INSTRUMENTATION_KEY) do
            response = client.query_with_retries(query: query, variables: variables, context: context)
            data["errors"] = response["errors"] if response["errors"]
            data["mutation"] = response.dig("data", "updateGroup")
          end

          data
        end

        # Build query for this mutation.
        #
        # @param variables [Hash] Input variables in GraphQL variable format as keys.
        #
        # @return [String] The mutation query
        def self.build_query(variables, group_detail_fragment: GroupsQueryBinder::GROUP_DETAIL_FRAGMENT)
          variable_declaration = variables.map do |(variable, value)|
            type_declaration = case variable
            when "name", "services", "tags", "groups"
              GraphqlQuerySemantics.graphql_variable_type(value, strict: true)
            else
              GraphqlQuerySemantics.graphql_variable_type(value)
            end
            "$#{variable}: #{type_declaration}"
          end.join(", ")
          <<~GRAPHQL
            mutation updateGroup(#{variable_declaration}){
              updateGroup(input: { #{GraphqlQuerySemantics.graphql_variable_passing(variables)} }) {
                clientMutationId
                group {
                  ...GroupDetail
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
