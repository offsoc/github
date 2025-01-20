# frozen_string_literal: true

module GraphQL
  module Pro
    class OperationStore
      # This is returned from {OperationStore.add}
      # @api private
      class AddResult
        attr_reader :errors, :operation_alias, :operation_record

        def initialize(state, errors: [], operation_alias:, operation_record: nil)
          @operation_alias = operation_alias
          @operation_record = operation_record
          case state
          when :added, :not_modified, :failed
            @state = state
          else
            raise "Unexpected state: #{state}"
          end
          @errors = errors
        end

        def added?
          @state == :added
        end

        def not_modified?
          @state == :not_modified
        end

        def failed?
          @state == :failed
        end
      end
    end
  end
end
