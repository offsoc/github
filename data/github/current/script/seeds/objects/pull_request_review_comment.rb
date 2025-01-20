# typed: true
# frozen_string_literal: true

module Seeds
  module Objects
    class PullRequestReviewComment
      def self.create(user:, pull_request_review:)
        pull_request = pull_request_review.pull_request
        head_oid = pull_request.head_sha
        diff = pull_request.async_diff(end_commit_oid: head_oid).sync
        path = diff.deltas.first.path.dup

        review_thread = ::PullRequestReviewThread.new(
          pull_request_review: pull_request_review,
          pull_request: pull_request_review.pull_request,
        )

        review_thread.build_first_diff_position_comment(
          user: user,
          body: Faker::Lorem.paragraph,
          diff: diff,
          position: 1,
          path: path,
        ).tap(&:save)
      end
    end
  end
end
