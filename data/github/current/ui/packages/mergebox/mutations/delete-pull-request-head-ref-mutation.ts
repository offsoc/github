import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  deletePullRequestHeadRefMutation as deletePullRequestHeadRefMutationType,
  deletePullRequestHeadRefMutation$data,
} from './__generated__/deletePullRequestHeadRefMutation.graphql'

export function deletePullRequestHeadRefMutation({
  environment,
  input: {pullRequestId},
  onCompleted,
  onError,
}: {
  environment: Environment
  input: {pullRequestId: string}
  onCompleted?: (response: deletePullRequestHeadRefMutation$data) => void
  onError?: (error: Error) => void
}) {
  return commitMutation<deletePullRequestHeadRefMutationType>(environment, {
    mutation: graphql`
      mutation deletePullRequestHeadRefMutation($id: ID!) @raw_response_type {
        deletePullRequestHeadRef(input: {pullRequestId: $id}) {
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
