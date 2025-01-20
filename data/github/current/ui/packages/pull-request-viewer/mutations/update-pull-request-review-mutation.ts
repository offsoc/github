import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  updatePullRequestReviewMutation as updatePullRequestReviewType,
  updatePullRequestReviewMutation$data,
} from './__generated__/updatePullRequestReviewMutation.graphql'

interface Input {
  body: string
  pullRequestReviewId: string
}

export default function updatePullRequestReview({
  environment,
  input,
  onCompleted,
  onError,
}: {
  environment: Environment
  input: Input
  onCompleted?: (response: updatePullRequestReviewMutation$data) => void
  onError?: (error: Error) => void
}) {
  return commitMutation<updatePullRequestReviewType>(environment, {
    mutation: graphql`
      mutation updatePullRequestReviewMutation($input: UpdatePullRequestReviewInput!) @raw_response_type {
        updatePullRequestReview(input: $input) {
          pullRequestReview {
            ...PullRequestReview_pullRequestReview
          }
        }
      }
    `,
    variables: {input},
    onCompleted,
    onError,
  })
}
