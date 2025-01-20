import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  RemoveTeamDashboardSearchShortcutInput,
  removeTeamViewMutation,
} from './__generated__/removeTeamViewMutation.graphql'

export function commitRemoveTeamViewMutation({
  environment,
  input: {shortcutId},
  onCompleted,
  onError,
}: {
  environment: Environment
  input: {shortcutId: string}
  onCompleted?: (response: removeTeamViewMutation['response']) => void
  onError?: (error: Error) => void
}) {
  const inputHash: RemoveTeamDashboardSearchShortcutInput = {
    shortcutId,
  }

  return commitMutation<removeTeamViewMutation>(environment, {
    mutation: graphql`
      mutation removeTeamViewMutation($input: RemoveTeamDashboardSearchShortcutInput!) @raw_response_type {
        removeTeamDashboardSearchShortcut(input: $input) {
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
