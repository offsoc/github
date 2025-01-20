# frozen_string_literal: true
module GraphQL
  module Pro
    class OperationStore
      class IndexEntryRecord
        attr_reader :name, :references_count, :last_used_at, :archived_references_count
        def initialize(name:, references_count:, archived_references_count:, persisted:, last_used_at:)
          @name = name
          @references_count = references_count
          @archived_references_count = archived_references_count
          @persisted = persisted
          @last_used_at = last_used_at
        end
      end
    end
  end
end
