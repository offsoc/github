# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class RepoPullRequestReviews < Seeds::Runner
      def self.help
        <<~HELP
        Creates randomized pull request reviews for all pull requests in a given repo, including randomized
        comments and replies.

        Example Usage:
          bin/seed pull_request_reviews --nwo owner/repo
        HELP
      end

      def self.run(options = {})
        repo = Repository.nwo(options[:nwo])

        puts "-> Seeding '#{repo.name}' with a random amount of PR reviews."

        repo.pull_requests.each do |pull_request|
          user = repo.members.sample
          pull_request_review = ::PullRequestReview.create(
            pull_request: pull_request,
            user: user,
            head_sha: pull_request.head_sha,
            body: body_generator(repo)
          )

          # If any pull requests don't have changes for some reason, skip them.
          next if pull_request.async_diff(end_commit_oid: pull_request.head_sha).sync.deltas.first.blank?

          pull_request = pull_request_review.pull_request
          head_oid = T.must(pull_request).head_sha
          diff = T.must(pull_request).async_diff(end_commit_oid: head_oid).sync
          delta = diff.deltas.sample
          path = delta.path.dup

          review_thread = ::PullRequestReviewThread.new(
            pull_request_review: pull_request_review,
            pull_request: pull_request_review.pull_request,
          )

          review_thread.build_first_diff_position_comment(
            user: user,
            body: body_generator(repo),
            diff: diff,
            position: 1,
            path: path,
          ).submit!

          pull_request_review.update!(state: %i(
            approved
            changes_requested
            commented
            dismissed
          ).sample)

          rand(5).times do
            review_thread.build_reply(
              user: repo.members.sample,
              body: body_generator(repo),
            ).submit!
          end
        end
      end

      def self.body_generator(repo)
        body = Faker::Lorem.paragraph

        if [true, false].sample
          body += " Closes \##{repo.issues.sample&.number}"
        end

        body
      end
    end
  end
end
