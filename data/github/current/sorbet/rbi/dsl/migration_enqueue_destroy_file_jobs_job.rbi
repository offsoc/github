# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MigrationEnqueueDestroyFileJobsJob`.
# Please instead update this file by running `bin/tapioca dsl MigrationEnqueueDestroyFileJobsJob`.

class MigrationEnqueueDestroyFileJobsJob
  class << self
    sig do
      params(
        block: T.nilable(T.proc.params(job: MigrationEnqueueDestroyFileJobsJob).void)
      ).returns(T.any(MigrationEnqueueDestroyFileJobsJob, FalseClass))
    end
    def perform_later(&block); end

    sig { returns(T.untyped) }
    def perform_now; end
  end
end
