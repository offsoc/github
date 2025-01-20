# typed: true
# frozen_string_literal: true

module Seeds
  module Objects
    class PullRequestReview
      MAP_REVIEW_STATE_TO_EVENT = {
        approved: :approve,
        changes_requested: :request_changes,
        commented: :comment,
        dismissed: :dismiss,
      }.freeze

      def self.create(pull_request:, user:, state: ::PullRequestReview.workflow_spec.states.keys.sample)
        review = nil

        case state.to_sym
        when :pending
          review = \
            ::PullRequestReview.create(
              pull_request: pull_request,
              user: user,
              state: :pending,
              head_sha: pull_request.head_sha,
            )
        when :dismissed
          review = \
            ::PullRequestReview.create(
              pull_request: pull_request,
              user: user,
              state: :approved,
              head_sha: pull_request.head_sha,
              body: Faker::Lorem.paragraph,
            )
          event = MAP_REVIEW_STATE_TO_EVENT[state]
          review.trigger(event, actor: user, message: Faker::Lorem.paragraph)
        else
          review = \
            ::PullRequestReview.new(
              pull_request: pull_request,
              user: user,
              head_sha: pull_request.head_sha,
              body: Faker::Lorem.paragraph,
            )
          event = MAP_REVIEW_STATE_TO_EVENT[state]
          review.trigger(event)
        end

        review
      end
    end
  end
end
