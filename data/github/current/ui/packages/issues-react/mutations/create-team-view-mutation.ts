import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import {VALUES} from '../constants/values'
import type {
  CreateTeamDashboardSearchShortcutInput,
  createTeamViewMutation,
  createTeamViewMutation$data,
} from './__generated__/createTeamViewMutation.graphql'

type TeamViewMutationProps = {
  environment: Environment
  input: CreateTeamDashboardSearchShortcutInput
  connectionId: string
  onError?: (error: Error) => void
  onCompleted?: (response: createTeamViewMutation$data) => void
}

export function commitCreateTeamViewMutation({
  environment,
  input,
  connectionId,
  onError,
  onCompleted,
}: TeamViewMutationProps) {
  const issueSearchConnectionId = `${connectionId}(searchTypes:[${VALUES.viewTypes.map(i => `"${i}"`).join(',')}])`

  return commitMutation<createTeamViewMutation>(environment, {
    mutation: graphql`
      mutation createTeamViewMutation($connections: [ID!]!, $input: CreateTeamDashboardSearchShortcutInput!)
      @raw_response_type {
        createTeamDashboardSearchShortcut(input: $input) {
          shortcutEdge @appendEdge(connections: $connections) {
            node {
              ...SharedViewTreeItem
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
    onCompleted: (response: createTeamViewMutation$data) => {
      onCompleted && onCompleted(response)
    },
  })
}
