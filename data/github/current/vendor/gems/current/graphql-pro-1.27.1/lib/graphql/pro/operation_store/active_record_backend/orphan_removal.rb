# frozen_string_literal: true
module GraphQL
  module Pro
    class OperationStore
      class ActiveRecordBackend
        module OrphanRemoval
          module_function

          def remove_orphaned_operations
            orphan_ops = GraphQLOperation
              .joins("
                LEFT JOIN (
                  SELECT count(*) clients_count, graphql_operation_id
                  FROM graphql_client_operations
                  GROUP BY graphql_operation_id
                ) AS clients_count ON clients_count.graphql_operation_id = graphql_operations.id
              ")
              .where("(clients_count = 0 OR clients_count IS NULL)")

            orphan_ops.destroy_all
          end

          def remove_orphaned_index_entries
            orphan_entries = GraphQLIndexEntry
              .joins("
                LEFT JOIN (
                  SELECT count(*) refs_count, graphql_index_entry_id
                  FROM graphql_index_references
                  GROUP BY graphql_index_entry_id
                ) AS refs_count ON refs_count.graphql_index_entry_id = graphql_index_entries.id
              ")
              .where("(refs_count = 0 OR refs_count IS NULL)")
            orphan_entries.destroy_all
          end

          def remove_orphaned_client_operations
            orphan_client_ops = GraphQLClientOperation
              .joins("LEFT JOIN (SELECT id AS graphql_operations_id FROM graphql_operations) AS ops ON ops.graphql_operations_id = graphql_client_operations.graphql_operation_id")
              .where("ops.graphql_operations_id IS NULL")
            orphan_client_ops.destroy_all
          end
        end
      end
    end
  end
end
