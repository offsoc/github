# frozen_string_literal: true

require File.expand_path("query_binder.rb", __dir__)
Dir[File.expand_path("groups/*.rb", __dir__)].each { |f| require f }

module ServiceCatalog
  class Client
    # GroupsQueryBinder contains methods for accessing groups.
    class GroupsQueryBinder < QueryBinder
      GROUP_DETAIL_FRAGMENT = <<-GRAPHQL
        fragment GroupDetail on Group {
          id
          name
          description
          members {
            totalCount
            edges {
              cursor
              node {
                __typename
                id
                member {
                  __typename
                  id
                }
              }
            }
          }
          tags {
            totalCount
            edges {
              cursor
              node {
                __typename
                id
                tag
              }
            }
          }
        }
      GRAPHQL

      # List all Groups in the Service Catalog.
      #
      # @param tag [String] (optional) Filter by tag
      # @param context [Hash] (optional) Optional headers to add to the request
      #
      # @return [Response] All services matching the criteria
      def list(**kwargs)
        Response.new Client::Groups::ListGroupsQuery.execute(client: client, **kwargs)
      end

      # Find a single group.
      #
      # @param name [String] The name of the group (exact)
      # @param context [Hash] (optional) Optional headers to add to the request
      #
      # @return [Response] The matching group.
      def find(**kwargs)
        Response.new Client::Groups::FindGroupQuery.execute(client: client, **kwargs)
      end

      # Mutations

      # Update a group.
      #
      # @param context [Hash] Added context to add to the request as headers
      # @param name [String] The name of the group (exact)
      # @param description [String] A description of the group.
      # @param groups [Array<String>] Groups to include in the group. Send EITHER +groups+ or +services+.
      # @param services [Array<String>] Services to include in the group. Send EITHER +groups+ or +services+.
      # @param tags [Array<String>] Tags associated with the group
      #
      # @return [Response]
      def update(**kwargs)
        Response.new Client::Groups::UpdateGroupMutation.execute(client: client, **kwargs)
      end

      # Delete a group.
      #
      # @param name [String] The name of the group to delete (exact)
      # @param context [Hash] Added context to add to the request as headers
      #
      # @return [Response]
      def delete(name:, context: {})
        Response.new Client::Groups::DeleteGroupMutation.execute(client: client, name: name, context: context)
      end
    end
  end
end
