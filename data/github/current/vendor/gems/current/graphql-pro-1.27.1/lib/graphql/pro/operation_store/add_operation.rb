# frozen_string_literal: true
module GraphQL
  module Pro
    class OperationStore
      class AddOperation
        # @return [AddResult]
        def self.call(body:, client_name:, operation_alias:, schema:, backend:)
          add_operation = AddOperationBatch.new(client_name: client_name, operation_store: backend, schema: schema)
          add_operation.prepare_operation(body: body, operation_alias: operation_alias)
          add_operation.save!
          add_operation.results.first
        end
      end
    end
  end
end
