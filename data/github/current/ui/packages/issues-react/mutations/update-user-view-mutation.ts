import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  UpdateDashboardSearchShortcutInput,
  updateUserViewMutation,
} from './__generated__/updateUserViewMutation.graphql'

type UpdateUserViewMutationProps = {
  environment: Environment
  input: UpdateDashboardSearchShortcutInput
  onCompleted?: (response: updateUserViewMutation['response']) => void
  onError?: (error: Error) => void
}

export function commitUpdateUserViewMutation({environment, input, onCompleted, onError}: UpdateUserViewMutationProps) {
  input.scopingRepository = null
  return commitMutation<updateUserViewMutation>(environment, {
    mutation: graphql`
      mutation updateUserViewMutation($input: UpdateDashboardSearchShortcutInput!) @raw_response_type {
        updateDashboardSearchShortcut(input: $input) {
          shortcut {
            id
            ...SavedViewRow
            ...ListCurrentViewFragment
            ...IssueDetailCurrentViewFragment
            ...EditViewButtonCurrentViewFragment
          }
        }
      }
    `,
    optimisticResponse: {
      updateDashboardSearchShortcut: {
        shortcut: {
          __isShortcutable: 'SearchShortcut',
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
