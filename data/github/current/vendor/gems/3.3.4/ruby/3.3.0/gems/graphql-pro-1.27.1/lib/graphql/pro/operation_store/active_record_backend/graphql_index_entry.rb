# frozen_string_literal: true
module GraphQL
  module Pro
    class OperationStore
      class ActiveRecordBackend
        # An object in a GraphQL schema which may be used for an operation:
        # - Type
        # - Field
        # - Argument (or input_field)
        # - Directive
        # - EnumValue
        #
        # @api private
        # @example required database table
        #    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
        #    ┃                graphql_index_entries                           ┃
        #    ┣━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
        #    ┃ id                    ┃ primary key                            ┃
        #    ┣━━━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
        #    ┃ name                  ┃ varchar (index, unique)                ┃
        #    ┣━━━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
        #    ┃ last_used_at          ┃ datetime (index)                       ┃
        #    ┗━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
        class GraphQLIndexEntry < GraphQLOperationStoreModel
          self.table_name = :graphql_index_entries
          self.primary_key = :id
          has_many :graphql_index_references,
            class_name: namespaced_model("GraphQLIndexReference"),
            foreign_key: :graphql_index_entry_id,
            primary_key: :id

          has_many :graphql_operations,
            through: :graphql_index_references,
            class_name: namespaced_model("GraphQLOperation"),
            foreign_key: :graphql_operation_id,
            primary_key: :id
        end
      end
    end
  end
end
