# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `QueueMediaTransitionJobsJob`.
# Please instead update this file by running `bin/tapioca dsl QueueMediaTransitionJobsJob`.

class QueueMediaTransitionJobsJob
  class << self
    sig do
      params(
        block: T.nilable(T.proc.params(job: QueueMediaTransitionJobsJob).void)
      ).returns(T.any(QueueMediaTransitionJobsJob, FalseClass))
    end
    def perform_later(&block); end

    sig { returns(T.untyped) }
    def perform_now; end
  end
end
