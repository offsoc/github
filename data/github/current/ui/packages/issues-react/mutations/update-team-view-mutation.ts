import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  UpdateTeamDashboardSearchShortcutInput,
  updateTeamViewMutation,
} from './__generated__/updateTeamViewMutation.graphql'

type UpdateTeamViewMutationProps = {
  environment: Environment
  input: UpdateTeamDashboardSearchShortcutInput
  onCompleted?: (response: updateTeamViewMutation['response']) => void
  onError?: (error: Error) => void
}

export function commitUpdateTeamViewMutation({environment, input, onCompleted, onError}: UpdateTeamViewMutationProps) {
  input.scopingRepository = null
  return commitMutation<updateTeamViewMutation>(environment, {
    mutation: graphql`
      mutation updateTeamViewMutation($input: UpdateTeamDashboardSearchShortcutInput!) @raw_response_type {
        updateTeamDashboardSearchShortcut(input: $input) {
          shortcut {
            ...SharedViewTreeItem
            ...ListCurrentViewFragment
            ...IssueDetailCurrentViewFragment
            ...EditViewButtonCurrentViewFragment
          }
        }
      }
    `,
    optimisticResponse: {
      updateTeamDashboardSearchShortcut: {
        shortcut: {
          __isShortcutable: 'TeamSearchShortcut',
          id: input.shortcutId,
          name: input.name!,
          icon: input.icon!,
          color: input.color!,
          description: input.description!,
          query: input.query!,
          scopingRepository: null,
        },
      },
    },
    variables: {
      input,
    },
    onCompleted: response => onCompleted && onCompleted(response),
    onError: error => onError && onError(error),
  })
}
