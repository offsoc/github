# frozen_string_literal: true
module GraphQL
  module Pro
    class OperationStore
      class ActiveRecordBackend
        # A join between operation and the entries it depends on
        # @api private
        # @example required database table
        #    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
        #    ┃                graphql_index_references                        ┃
        #    ┣━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
        #    ┃ id                    ┃ primary key                            ┃
        #    ┣━━━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
        #    ┃ graphql_operation_id  ┃ foreign key                            ┃
        #    ┣━━━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
        #    ┃ graphql_index_entry   ┃ f-key (unique w/graphql_operation_id)  ┃
        #    ┗━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
        class GraphQLIndexReference < GraphQLOperationStoreModel
          self.table_name = :graphql_index_references
          self.primary_key = :id
          belongs_to :graphql_index_entry, class_name: namespaced_model("GraphQLIndexEntry"), primary_key: :id
          belongs_to :graphql_operation, class_name: namespaced_model("GraphQLOperation"), primary_key: :id
        end
      end
    end
  end
end
