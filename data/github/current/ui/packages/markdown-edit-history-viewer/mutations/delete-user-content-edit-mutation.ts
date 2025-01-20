import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {deleteUserContentEditMutation} from './__generated__/deleteUserContentEditMutation.graphql'

export function commitDeleteUserContentEditMutation({
  environment,
  input: {id},
  onCompleted,
  onError,
}: {
  environment: Environment
  input: {id: string}
  onCompleted?: () => void
  onError?: (error?: Error) => void
}) {
  return commitMutation<deleteUserContentEditMutation>(environment, {
    mutation: graphql`
      mutation deleteUserContentEditMutation($input: DeleteUserContentEditInput!) @raw_response_type {
        deleteUserContentEdit(input: $input) {
          userContentEdit {
            id
            deletedAt
            deletedBy {
              login
              avatarUrl
            }
            diff
          }
        }
      }
    `,
    variables: {
      input: {id},
    },
    onCompleted: response => {
      if (response.deleteUserContentEdit === null) {
        onError?.()
      } else {
        onCompleted?.()
      }
    },
    onError: error => onError?.(error),
  })
}
