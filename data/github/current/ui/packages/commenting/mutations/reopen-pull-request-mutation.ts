import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  reopenPullRequestMutation,
  reopenPullRequestMutation$data,
} from './__generated__/reopenPullRequestMutation.graphql'

export function reopenPullRequestMutation({
  environment,
  input: {pullRequestId},
  onError,
  onCompleted,
}: {
  environment: Environment
  input: {pullRequestId: string}
  onError?: (error: Error) => void
  onCompleted?: (response: reopenPullRequestMutation$data) => void
}) {
  return commitMutation<reopenPullRequestMutation>(environment, {
    mutation: graphql`
      mutation reopenPullRequestMutation($pullRequestId: ID!) @raw_response_type {
        reopenPullRequest(input: {pullRequestId: $pullRequestId}) {
          pullRequest {
            id
            state
            viewerCanClose
            viewerCanChangeBaseBranch
          }
        }
      }
    `,
    variables: {pullRequestId},
    optimisticResponse: {
      reopenPullRequest: {
        pullRequest: {
          id: pullRequestId,
          state: 'OPEN',
          // Not assuming that the pull request can be closed on optimistic response
          // This will be updated on actual response
          viewerCanClose: false,
          viewerCanChangeBaseBranch: false,
        },
      },
    },
    onError: error => onError?.(error),
    onCompleted: response => onCompleted?.(response),
  })
}
