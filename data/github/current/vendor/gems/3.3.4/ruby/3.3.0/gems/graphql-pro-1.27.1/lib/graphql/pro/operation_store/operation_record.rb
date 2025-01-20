# frozen_string_literal: true
module GraphQL
  module Pro
    class OperationStore
      class OperationRecord
        # @return [String] the OperationName of the GraphQL document
        attr_reader :name
        # @return [String] the normalized, minified GraphQL document
        attr_reader :body
        # @return [String] Stable hash derived from `body`
        attr_reader :digest
        # @return [Integer]
        attr_reader :clients_count
        # @return [DateTime, nil]
        attr_reader :last_used_at
        # @return [Boolean] true if all client_operations are archived
        attr_reader :is_archived

        def initialize(name:, digest:, body:, clients_count:, is_archived:, last_used_at:)
          @name = name
          @digest = digest
          @body = body
          @is_archived = is_archived
          @clients_count = clients_count
          @last_used_at = last_used_at
        end
      end
    end
  end
end
