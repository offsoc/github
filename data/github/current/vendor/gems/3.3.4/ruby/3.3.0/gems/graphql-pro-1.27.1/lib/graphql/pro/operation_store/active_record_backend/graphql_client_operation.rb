# frozen_string_literal: true
module GraphQL
  module Pro
    class OperationStore
      class ActiveRecordBackend
        # A join between client application and query.
        # It means that a client wants to invoke this operation by name.
        #
        # @api private
        # @example required database table
        #    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
        #    ┃                graphql_client_operations                                       ┃
        #    ┣━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
        #    ┃ id                    ┃ primary key                                            ┃
        #    ┣━━━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
        #    ┃ graphql_operation_id  ┃ foreign key (non-null, index)                          ┃
        #    ┣━━━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
        #    ┃ graphql_client_id     ┃ f-key (non-null, index)                                ┃
        #    ┣━━━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
        #    ┃ alias                 ┃ varchar (non-null, unique index w/graphql_client_id)   ┃
        #    ┣━━━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
        #    ┃ last_used_at          ┃ datetime (index)                                       ┃
        #    ┗━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
        class GraphQLClientOperation < GraphQLOperationStoreModel
          self.table_name = :graphql_client_operations
          self.primary_key = :id
          belongs_to :graphql_client, class_name: namespaced_model("GraphQLClient"), primary_key: :id
          belongs_to :graphql_operation, class_name: namespaced_model("GraphQLOperation"), primary_key: :id
        end
      end
    end
  end
end
