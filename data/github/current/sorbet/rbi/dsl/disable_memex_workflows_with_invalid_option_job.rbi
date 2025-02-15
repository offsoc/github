# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `DisableMemexWorkflowsWithInvalidOptionJob`.
# Please instead update this file by running `bin/tapioca dsl DisableMemexWorkflowsWithInvalidOptionJob`.

class DisableMemexWorkflowsWithInvalidOptionJob
  class << self
    sig do
      params(
        column_id: T.untyped,
        removed_option_ids: T.untyped,
        block: T.nilable(T.proc.params(job: DisableMemexWorkflowsWithInvalidOptionJob).void)
      ).returns(T.any(DisableMemexWorkflowsWithInvalidOptionJob, FalseClass))
    end
    def perform_later(column_id:, removed_option_ids:, &block); end

    sig { params(column_id: T.untyped, removed_option_ids: T.untyped).returns(T.untyped) }
    def perform_now(column_id:, removed_option_ids:); end
  end
end
