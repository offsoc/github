# frozen_string_literal: true

module GraphQL
  module Pro
    class OperationStore
      class ActiveRecordBackend
        class GraphQLOperationStoreModel < ActiveRecord::Base
          self.abstract_class = true

          def self.namespaced_model(name)
            "GraphQL::Pro::OperationStore::ActiveRecordBackend::#{name}"
          end
        end
      end
    end
  end
end
