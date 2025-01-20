# frozen_string_literal: true
require "securerandom"

module GraphQL
  module Pro
    class OperationStore
      class ActiveRecordBackend
        # A client application for this GraphQL system.
        # @api private
        # @example required database table
        #    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
        #    ┃      graphql_clients                       ┃
        #    ┣━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
        #    ┃ id     ┃  primary key                      ┃
        #    ┣━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
        #    ┃ name   ┃ varchar (index, non-null, unique) ┃
        #    ┣━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
        #    ┃ secret ┃ varchar (non-null, unique)        ┃
        #    ┗━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
        class GraphQLClient < GraphQLOperationStoreModel
          self.table_name = :graphql_clients
          self.primary_key = :id
          has_many :graphql_client_operations,
            class_name: namespaced_model("GraphQLClientOperation"),
            foreign_key: :graphql_client_id,
            dependent: :destroy,
            primary_key: :id

          has_many :graphql_operations,
            through: :graphql_client_operations,
            class_name: namespaced_model("GraphQLOperation"),
            foreign_key: :graphql_operation_id,
            primary_key: :id

          after_initialize :populate_default_secret
          after_destroy :remove_orphaned_operations
          after_destroy :remove_orphaned_index_entries

          validates :name, format: {
            without: Regexp.new(Regexp.escape(OPERATION_ID_SEPARATOR)),
            message: "may not include #{OPERATION_ID_SEPARATOR}, which is reserved for operation_id values.",
          }

          private

          def remove_orphaned_operations
            OrphanRemoval.remove_orphaned_operations
          end

          def remove_orphaned_index_entries
            OrphanRemoval.remove_orphaned_index_entries
          end

          def populate_default_secret
            if new_record? && self.secret.nil?
              self.secret = SecureRandom.hex(32)
            end
          end
        end
      end
    end
  end
end
