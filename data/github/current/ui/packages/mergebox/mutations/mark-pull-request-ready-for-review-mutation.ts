import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  MarkPullRequestReadyForReviewInput,
  markPullRequestReadyForReviewMutation as markPullRequestReadyForReviewMutationType,
  markPullRequestReadyForReviewMutation$data,
} from './__generated__/markPullRequestReadyForReviewMutation.graphql'

export function markPullRequestReadyForReviewMutation({
  environment,
  input,
  onCompleted,
  onError,
}: {
  environment: Environment
  input: MarkPullRequestReadyForReviewInput
  onCompleted?: (response: markPullRequestReadyForReviewMutation$data) => void
  onError?: (error: Error) => void
}) {
  return commitMutation<markPullRequestReadyForReviewMutationType>(environment, {
    mutation: graphql`
      mutation markPullRequestReadyForReviewMutation($input: MarkPullRequestReadyForReviewInput!) @raw_response_type {
        markPullRequestReadyForReview(input: $input) {
          pullRequest {
            id
            isDraft
          }
        }
      }
    `,
    variables: {input},
    onCompleted,
    onError,
  })
}
