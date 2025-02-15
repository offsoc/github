# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `ProcessProjectWorkflowsJob`.
# Please instead update this file by running `bin/tapioca dsl ProcessProjectWorkflowsJob`.

class ProcessProjectWorkflowsJob
  class << self
    sig do
      params(
        trigger_type: T.untyped,
        trigger_attributes: T.untyped,
        offset_id: T.untyped,
        run_workflows_count: T.untyped,
        enqueued_at: T.untyped,
        block: T.nilable(T.proc.params(job: ProcessProjectWorkflowsJob).void)
      ).returns(T.any(ProcessProjectWorkflowsJob, FalseClass))
    end
    def perform_later(trigger_type, trigger_attributes = T.unsafe(nil), offset_id = T.unsafe(nil), run_workflows_count = T.unsafe(nil), enqueued_at = T.unsafe(nil), &block); end

    sig do
      params(
        trigger_type: T.untyped,
        trigger_attributes: T.untyped,
        offset_id: T.untyped,
        run_workflows_count: T.untyped,
        enqueued_at: T.untyped
      ).returns(T.untyped)
    end
    def perform_now(trigger_type, trigger_attributes = T.unsafe(nil), offset_id = T.unsafe(nil), run_workflows_count = T.unsafe(nil), enqueued_at = T.unsafe(nil)); end
  end
end
