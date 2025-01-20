# frozen_string_literal: true
module GraphQL
  module Pro
    class OperationStore
      class ActiveRecordBackend
        # A GraphQL operation, with its digest.
        # @api private
        # @example required database table
        #    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
        #    ┃          graphql_operations         ┃
        #    ┣━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━┫
        #    ┃ id        ┃ primary key             ┃
        #    ┣━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━┫
        #    ┃ digest    ┃ varchar (index, unique) ┃
        #    ┣━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━┫
        #    ┃ body      ┃ text                    ┃
        #    ┗━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━┛
        class GraphQLOperation < GraphQLOperationStoreModel
          self.table_name = :graphql_operations
          self.primary_key = :id
          has_many :graphql_client_operations,
            class_name: namespaced_model("GraphQLClientOperation"),
            foreign_key: :graphql_operation_id,
            primary_key: :id
          has_many :graphql_clients,
            through: :graphql_client_operations,
            class_name: namespaced_model("GraphQLClient"),
            foreign_key: :graphql_client_id,
            primary_key: :id
          has_many :graphql_index_references,
            class_name: namespaced_model("GraphQLIndexReference"),
            foreign_key: :graphql_operation_id,
            dependent: :destroy,
            primary_key: :id
          has_many :graphql_index_entries,
            through: :graphql_index_references,
            class_name: namespaced_model("GraphQLIndexEntry"),
            foreign_key: :graphql_index_entry_id,
            primary_key: :id

          after_destroy :remove_orphaned_client_operations
          after_destroy :remove_orphaned_index_entries

          private

          def remove_orphaned_client_operations
            OrphanRemoval.remove_orphaned_client_operations
          end

          def remove_orphaned_index_entries
            OrphanRemoval.remove_orphaned_index_entries
          end
        end
      end
    end
  end
end
