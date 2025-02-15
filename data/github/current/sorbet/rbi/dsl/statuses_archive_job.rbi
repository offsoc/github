# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `StatusesArchiveJob`.
# Please instead update this file by running `bin/tapioca dsl StatusesArchiveJob`.

class StatusesArchiveJob
  class << self
    sig do
      params(
        updated_at_start: T.untyped,
        updated_at_end: T.untyped,
        concurrent_job_key: T.untyped,
        block: T.nilable(T.proc.params(job: StatusesArchiveJob).void)
      ).returns(T.any(StatusesArchiveJob, FalseClass))
    end
    def perform_later(updated_at_start:, updated_at_end:, concurrent_job_key:, &block); end

    sig do
      params(
        updated_at_start: T.untyped,
        updated_at_end: T.untyped,
        concurrent_job_key: T.untyped
      ).returns(T.untyped)
    end
    def perform_now(updated_at_start:, updated_at_end:, concurrent_job_key:); end
  end
end
