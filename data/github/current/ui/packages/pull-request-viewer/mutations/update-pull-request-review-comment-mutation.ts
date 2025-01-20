import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  updatePullRequestReviewCommentMutation as updatePullRequestReviewCommentType,
  updatePullRequestReviewCommentMutation$data,
} from './__generated__/updatePullRequestReviewCommentMutation.graphql'

interface Input {
  body: string
  pullRequestReviewCommentId: string
}

export default function updatePullRequestReviewComment({
  environment,
  input,
  onCompleted,
  onError,
}: {
  environment: Environment
  input: Input
  onCompleted?: (response: updatePullRequestReviewCommentMutation$data) => void
  onError?: (error: Error) => void
}) {
  return commitMutation<updatePullRequestReviewCommentType>(environment, {
    mutation: graphql`
      mutation updatePullRequestReviewCommentMutation($input: UpdatePullRequestReviewCommentInput!) @raw_response_type {
        updatePullRequestReviewComment(input: $input) {
          pullRequestReviewComment {
            ...useFetchThread_PullRequestReviewComment
          }
        }
      }
    `,
    variables: {input},
    onCompleted,
    onError,
  })
}
