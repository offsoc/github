import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  restorePullRequestHeadRefMutation as restorePullRequestHeadRefMutationType,
  restorePullRequestHeadRefMutation$data,
} from './__generated__/restorePullRequestHeadRefMutation.graphql'

export function restorePullRequestHeadRefMutation({
  environment,
  input: {pullRequestId},
  onCompleted,
  onError,
}: {
  environment: Environment
  input: {pullRequestId: string}
  onCompleted?: (response: restorePullRequestHeadRefMutation$data) => void
  onError?: (error: Error) => void
}) {
  return commitMutation<restorePullRequestHeadRefMutationType>(environment, {
    mutation: graphql`
      mutation restorePullRequestHeadRefMutation($id: ID!) @raw_response_type {
        restorePullRequestHeadRef(input: {pullRequestId: $id}) {
          pullRequest {
            id
            state
            headRefName
            headRepository {
              owner {
                login
              }
              name
            }
            viewerCanDeleteHeadRef
            viewerCanRestoreHeadRef
            viewerCanReopen
          }
        }
      }
    `,
    variables: {id: pullRequestId},
    onCompleted,
    onError,
  })
}
