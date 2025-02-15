# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `AutoMergeSynchronizeOpenPullRequestsJob`.
# Please instead update this file by running `bin/tapioca dsl AutoMergeSynchronizeOpenPullRequestsJob`.

class AutoMergeSynchronizeOpenPullRequestsJob
  class << self
    sig do
      params(
        repository: T.untyped,
        base_ref: T.untyped,
        block: T.nilable(T.proc.params(job: AutoMergeSynchronizeOpenPullRequestsJob).void)
      ).returns(T.any(AutoMergeSynchronizeOpenPullRequestsJob, FalseClass))
    end
    def perform_later(repository:, base_ref:, &block); end

    sig { params(repository: T.untyped, base_ref: T.untyped).returns(T.untyped) }
    def perform_now(repository:, base_ref:); end
  end
end
