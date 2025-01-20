import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  closePullRequestMutation,
  closePullRequestMutation$data,
} from './__generated__/closePullRequestMutation.graphql'

export function closePullRequestMutation({
  environment,
  input: {pullRequestId},
  onError,
  onCompleted,
}: {
  environment: Environment
  input: {pullRequestId: string}
  onError?: (error: Error) => void
  onCompleted?: (response: closePullRequestMutation$data) => void
}) {
  return commitMutation<closePullRequestMutation>(environment, {
    mutation: graphql`
      mutation closePullRequestMutation($pullRequestId: ID!) {
        closePullRequest(input: {pullRequestId: $pullRequestId}) {
          pullRequest {
            id
            state
            viewerCanReopen
            viewerCanChangeBaseBranch
            viewerCanDeleteHeadRef
            viewerCanRestoreHeadRef
          }
        }
      }
    `,
    variables: {pullRequestId},
    onError: error => onError?.(error),
    onCompleted: response => onCompleted?.(response),
  })
}
