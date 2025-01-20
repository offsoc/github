import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {deleteIssueMutation} from './__generated__/deleteIssueMutation.graphql'

export function commitDeleteIssueMutation({
  environment,
  input,
  onCompleted,
  onError,
}: {
  environment: Environment
  input: {issueId: string}
  onCompleted?: () => void
  onError?: (error: Error) => void
}) {
  return commitMutation<deleteIssueMutation>(environment, {
    mutation: graphql`
      mutation deleteIssueMutation($input: DeleteIssueInput!) @raw_response_type {
        deleteIssue(input: $input) {
          issue {
            id @deleteRecord
          }
        }
      }
    `,
    variables: {
      input,
    },
    onCompleted: () => onCompleted?.(),
    onError: error => onError?.(error),
  })
}
