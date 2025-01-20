# frozen_string_literal: true
module GraphQL
  module Pro
    class Dashboard
      class OperationStoreComponent < Component
        def enabled?
          defined?(GraphQL::Pro::OperationStore) && !!@schema.operation_store
        end

        template_path_from(__FILE__)

        def doc_url
          "http://graphql-ruby.org/operation_store/overview"
        end

        configure_routes({
          "GET" => {
            "clients" => :clients,
            "clients/:name/operations" => :client_operations,
            "clients/:name/operations/archived" => :client_operations_archived,
            "operations" => :operations,
            "operations/archived" => :operations_archived,
            "index" => :operations_index,
            "index/:name" => :operations_index_entry,
            "operations/:digest" => :operation,
            "clients/:name/manage" => :client_manage,
          },
          "POST" => {
            "clients/:name/delete" => :client_delete,
            "clients/:name/save" => :client_save,
            "operations/:digest/delete" => :operation_delete,
            "operations/archive" => :operations_archive,
            "operations/unarchive" => :operations_unarchive,
            "operations/:digest/archive" => :operation_archive,
            "operations/:digest/unarchive" => :operation_unarchive,
            "clients/:name/operations/archive" => :client_operations_archive,
            "clients/:name/operations/unarchive" => :client_operations_unarchive,
          },
        })

        def clients(request:)
          order_by = order_by_param(request.params) || "name"
          order_dir = order_dir_param(request.params)
          clients_page = @schema.operation_store.all_clients(
            page: page_param(request.params),
            per_page: per_page_param(request.params),
            order_by: order_by,
            order_dir: order_dir,
          )

          {
            title: "Clients",
            tab: "clients",
            clients: clients_page.items,
            client_count: clients_page.total_count,
            prev_page: clients_page.prev_page,
            next_page: clients_page.next_page,
            order_by: order_by,
            order_dir: order_dir,
          }
        end

        def client_operations(request:)
          list_client_operations(request: request, is_archived: false)
        end

        def client_operations_archived(request:)
          list_client_operations(request: request, is_archived: true)
        end

        def client_delete(request:)
          client_name = request.params.fetch("name")
          @schema.operation_store.delete_client(client_name)
          redirect_to("/clients")
        end

        def client_manage(request:)
          client_name = request.params.fetch("name")
          client = if client_name == "new"
            title = "New Client"
            OperationStore::ClientRecord.new(
              name: nil,
              secret: SecureRandom.hex(32),
              created_at: nil,
              operations_count: 0,
              archived_operations_count: 0,
              last_synced_at: nil,
              last_used_at: nil,
            )
          else
            title = "Manage #{client_name}"
            @schema.operation_store.get_client(client_name)
          end

          if client.nil?
            nil
          else
            {
              title: title,
              tab: "clients",
              client: client,
            }
          end
        end

        def client_save(request:)
          client_name = request.params.fetch("client_name")
          client_secret = request.params.fetch("client_secret")
          client = @schema.operation_store.upsert_client(
            client_name,
            client_secret,
          )
          redirect_to("/clients/#{client.name}/operations")
        end

        def operation_delete(request:)
          operation_digest = request.params.fetch("digest")
          @schema.operation_store.delete_operation(operation_digest)
          redirect_to("/operations")
        end

        def operation(request:)
          digest = request.params.fetch("digest")
          operation = @schema.operation_store.get_operation_by_digest(digest)
          if operation.nil?
            nil
          else
            # Parse & re-format the query
            document = GraphQL.parse(operation.body)
            graphql_source = document.to_query_string

            client_operations = @schema.operation_store.get_client_operations_by_digest(digest)
            entries = @schema.operation_store.get_index_entries_by_digest(digest)

            {
              operation: operation,
              client_operations: client_operations,
              entries: entries,
              graphql_source: graphql_source,
              tab: "operations",
              title: operation.name,
            }
          end
        end

        def operations(request:)
          list_operations(request: request, is_archived: false)
        end

        def operations_archived(request:)
          list_operations(request: request, is_archived: true)
        end

        def operations_index(request:)
          search_term = if request.params["q"] && request.params["q"].length > 0
            request.params["q"]
          else
            nil
          end

          index_entries_page = @schema.operation_store.all_index_entries(
            search_term: search_term,
            page: page_param(request.params),
            per_page: per_page_param(request.params),
          )

          {
            tab: "index",
            title: "Index",
            entries_count: index_entries_page.total_count,
            entries: index_entries_page.items,
            next_page: index_entries_page.next_page,
            prev_page: index_entries_page.prev_page,
            search_term: search_term,
          }
        end

        def operations_index_entry(request:)
          name = request.params.fetch("name")
          entry = @schema.operation_store.index.get_entry(name)
          chain = @schema.operation_store.index.index_entry_chain(name)
          operations = @schema.operation_store.get_operations_by_index_entry(name)
          {
            tab: "index",
            title: name,
            chain: chain,
            entry: entry,
            operations: operations,
          }
        end

        def operations_archive(request:)
          operations_archival_change(request: request, is_archived: true, redirect_to_path: "/operations")
        end

        def operations_unarchive(request:)
          operations_archival_change(request: request, is_archived: false, redirect_to_path: "/operations/archived")
        end

        def client_operations_archive(request:)
          client_operations_archival_change(request: request, is_archived: true)
        end

        def client_operations_unarchive(request:)
          client_operations_archival_change(request: request, is_archived: false)
        end

        def operation_archive(request:)
          digest = request.params["digest"]
          operations_archival_change(request: request, is_archived: true, redirect_to_path: "/operations/#{digest}")
        end

        def operation_unarchive(request:)
          digest = request.params["digest"]
          operations_archival_change(request: request, is_archived: false, redirect_to_path: "/operations/#{digest}")
        end

        private

        def client_operations_archival_change(request:, is_archived:)
          op_aliases = request.params.fetch("values", "").split(",")
          client_names = []
          client_aliases = []
          op_aliases.each do |op_alias|
            client_name, client_alias = op_alias.split("/", 2)
            client_names << client_name
            client_aliases << client_alias
          end
          client_names.uniq!
          if client_names.size > 1
            raise ArgumentError, "Can't archive operations for more than one client at a time (received: #{client_names.inspect})"
          end
          @schema.operation_store.archive_client_operations(client_name: client_names.first, operation_aliases: client_aliases, is_archived: is_archived)
          redirect_to("/clients/#{request.params["name"]}/operations")
        end

        def operations_archival_change(request:, is_archived:, redirect_to_path:)
          digests = if (digest = request.params["digest"])
            [digest]
          else
            request.params.fetch("values", "").split(",")
          end
          @schema.operation_store.archive_operations(digests: digests, is_archived: is_archived)
          redirect_to(redirect_to_path)
        end

        def list_operations(request:, is_archived:)
          order_by = order_by_param(request.params) || "name"
          order_dir = order_dir_param(request.params)
          operations_page = @schema.operation_store.all_operations(
            page: page_param(request.params),
            per_page: per_page_param(request.params),
            is_archived: is_archived,
            order_by: order_by,
            order_dir: order_dir,
          )

          alternate_archived_mode_count = @schema.operation_store.all_operations(
            page: 1,
            per_page: 1,
            is_archived: !is_archived,
          ).total_count

          {
            template: "operations",
            tab: "operations",
            title: "Operations",
            is_archived: is_archived,
            operations: operations_page.items,
            unarchived_operation_count: is_archived ? alternate_archived_mode_count : operations_page.total_count,
            archived_operation_count: is_archived ? operations_page.total_count : alternate_archived_mode_count,
            next_page: operations_page.next_page,
            prev_page: operations_page.prev_page,
            order_by: order_by,
            order_dir: order_dir,
          }
        end

        def list_client_operations(request:, is_archived:)
          client_name = request.params.fetch("name")
          client = @schema.operation_store.get_client(client_name)
          if client.nil?
            nil
          else
            order_by = order_by_param(request.params) || "name"
            order_dir = order_dir_param(request.params)

            operations_page = @schema.operation_store.get_client_operations_by_client(
              client_name,
              page: page_param(request.params),
              per_page: per_page_param(request.params),
              is_archived: is_archived,
              order_by: order_by,
              order_dir: order_dir,
            )

            opposite_archive_mode_operation_count = @schema.operation_store.get_client_operations_by_client(
              client_name,
              page: 1,
              per_page: 1,
              is_archived: !is_archived
            ).total_count

            {
              template: "client_operations",
              title: client.name,
              tab: "clients",
              client: client,
              is_archived: is_archived,
              unarchived_operation_count: is_archived ? opposite_archive_mode_operation_count : operations_page.total_count,
              archived_operation_count: is_archived ? operations_page.total_count : opposite_archive_mode_operation_count,
              operations: operations_page.items,
              prev_page: operations_page.prev_page,
              next_page: operations_page.next_page,
              order_by: order_by,
              order_dir: order_dir,
            }
          end
        end

        # @return [String] no valiation applied
        def order_by_param(params)
          params["order_by"]
        end

        # @return [Symbol] `:asc` or `:desc`
        def order_dir_param(params)
          dir = params["order_dir"]
          case dir
          when "asc", nil, ""
            :asc
          when "desc"
            :desc
          else
            nil
          end
        end
      end
    end
  end
end
