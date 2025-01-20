# frozen_string_literal: true
module GraphQL
  module Pro
    class OperationStore
      class ClientOperationRecord
        attr_reader :client_name, :operation_alias, :digest, :name, :created_at, :is_archived, :last_used_at

        def initialize(client_name:, operation_alias:, digest:, name:, created_at:, is_archived:, last_used_at:)
          @client_name = client_name
          @operation_alias = operation_alias
          @digest = digest
          @name = name
          @created_at = created_at
          @is_archived = is_archived
          @last_used_at = last_used_at
        end
      end
    end
  end
end
