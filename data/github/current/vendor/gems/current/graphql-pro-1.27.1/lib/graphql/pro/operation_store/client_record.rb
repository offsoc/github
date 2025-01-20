# frozen_string_literal: true
module GraphQL
  module Pro
    class OperationStore
      class ClientRecord
        attr_reader :name, :secret, :created_at, :operations_count, :last_synced_at, :last_used_at, :archived_operations_count, :id

        def initialize(name:, secret:, created_at:, operations_count:, archived_operations_count:, last_synced_at:, last_used_at:, id: nil)
          @id = id
          @name = name
          @secret = secret
          @created_at = created_at
          @operations_count = operations_count
          @archived_operations_count = archived_operations_count
          @last_synced_at = last_synced_at
          @last_used_at = last_used_at
        end

        def persisted?
          !!created_at
        end
      end
    end
  end
end
