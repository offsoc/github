# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `CalculateDiscussionTotalVotesJob`.
# Please instead update this file by running `bin/tapioca dsl CalculateDiscussionTotalVotesJob`.

class CalculateDiscussionTotalVotesJob
  class << self
    sig do
      params(
        discussion_id: T.untyped,
        block: T.nilable(T.proc.params(job: CalculateDiscussionTotalVotesJob).void)
      ).returns(T.any(CalculateDiscussionTotalVotesJob, FalseClass))
    end
    def perform_later(discussion_id, &block); end

    sig { params(discussion_id: T.untyped).returns(T.untyped) }
    def perform_now(discussion_id); end
  end
end
