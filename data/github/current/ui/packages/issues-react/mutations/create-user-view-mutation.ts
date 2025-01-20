import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import {VALUES} from '../constants/values'
import type {
  CreateDashboardSearchShortcutInput,
  createUserViewMutation,
  createUserViewMutation$data,
} from './__generated__/createUserViewMutation.graphql'

type ViewMutationProps = {
  environment: Environment
  input: CreateDashboardSearchShortcutInput
  connectionId: string
  onError?: (error: Error) => void
  onCompleted?: (response: createUserViewMutation$data) => void
}

export function commitCreateUserViewMutation({
  environment,
  input,
  connectionId,
  onError,
  onCompleted,
}: ViewMutationProps) {
  const issueSearchConnectionId = `${connectionId}(searchTypes:[${VALUES.viewTypes.map(i => `"${i}"`).join(',')}])`

  return commitMutation<createUserViewMutation>(environment, {
    mutation: graphql`
      mutation createUserViewMutation($connections: [ID!]!, $input: CreateDashboardSearchShortcutInput!)
      @raw_response_type {
        createDashboardSearchShortcut(input: $input) {
          shortcutEdge @appendEdge(connections: $connections) {
            node {
              ...SavedViewRow
            }
          }
          shortcut {
            id
            ...ListCurrentViewFragment
            ...IssueDetailCurrentViewFragment
            ...EditViewButtonCurrentViewFragment
          }
        }
      }
    `,
    variables: {
      input,
      connections: [issueSearchConnectionId],
    },
    onError: error => onError && onError(error),
    onCompleted: (response: createUserViewMutation$data) => {
      onCompleted && onCompleted(response)
    },
  })
}
