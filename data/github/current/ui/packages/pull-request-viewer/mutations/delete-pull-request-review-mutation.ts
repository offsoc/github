import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  DeletePullRequestReviewInput,
  deletePullRequestReviewMutation as deletePullRequestReviewMutationType,
  deletePullRequestReviewMutation$data,
} from './__generated__/deletePullRequestReviewMutation.graphql'

export default function deletePullRequestReviewMutation({
  environment,
  input,
  onCompleted,
  onError,
}: {
  environment: Environment
  input: DeletePullRequestReviewInput
  onCompleted?: (response: deletePullRequestReviewMutation$data) => void
  onError?: (error: Error) => void
}) {
  return commitMutation<deletePullRequestReviewMutationType>(environment, {
    mutation: graphql`
      mutation deletePullRequestReviewMutation($input: DeletePullRequestReviewInput!) @raw_response_type {
        deletePullRequestReview(input: $input) {
          pullRequestReview {
            id @deleteRecord
            comments(first: 100) {
              edges {
                node {
                  id @deleteRecord
                }
              }
            }
          }
        }
      }
    `,
    variables: {input},
    onCompleted,
    onError,
  })
}
