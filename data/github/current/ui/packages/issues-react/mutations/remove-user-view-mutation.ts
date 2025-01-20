import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  RemoveDashboardSearchShortcutInput,
  removeUserViewMutation,
} from './__generated__/removeUserViewMutation.graphql'

export function commitRemoveUserViewMutation({
  environment,
  input: {shortcutId},
  onCompleted,
  onError,
}: {
  environment: Environment
  input: {shortcutId: string}
  onCompleted?: (response: removeUserViewMutation['response']) => void
  onError?: (error: Error) => void
}) {
  const inputHash: RemoveDashboardSearchShortcutInput = {
    shortcutId,
  }

  return commitMutation<removeUserViewMutation>(environment, {
    mutation: graphql`
      mutation removeUserViewMutation($input: RemoveDashboardSearchShortcutInput!) @raw_response_type {
        removeDashboardSearchShortcut(input: $input) {
          shortcut {
            id @deleteRecord
          }
        }
      }
    `,
    variables: {
      input: inputHash,
    },
    onCompleted: response => onCompleted && onCompleted(response),
    onError: error => onError && onError(error),
  })
}
