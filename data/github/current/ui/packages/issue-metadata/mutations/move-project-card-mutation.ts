import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'
import type {
  moveProjectCardMutation,
  moveProjectCardMutation$data,
} from './__generated__/moveProjectCardMutation.graphql'
import type {SingleSelectColumn$data} from '../components/projects/fields/__generated__/SingleSelectColumn.graphql'

type CommitProjectMutationProps = {
  environment: Environment
  connectionId?: string
  issueId: string
  column: SingleSelectColumn$data
  projectName: string
  projectId: string
  onError?: (error: Error) => void
  onCompleted?: (response: moveProjectCardMutation$data) => void
}

export function commitMoveProjectCardMutation({
  environment,
  connectionId,
  issueId,
  column,
  projectId,
  projectName,
  onError,
  onCompleted,
}: CommitProjectMutationProps) {
  return commitMutation<moveProjectCardMutation>(environment, {
    mutation: graphql`
      mutation moveProjectCardMutation($connections: [ID!]!, $input: MoveProjectCardInput!) @raw_response_type {
        moveProjectCard(input: $input) {
          cardEdge @appendEdge(connections: $connections) {
            node {
              ...ClassicProjectItem
            }
          }
        }
      }
    `,
    variables: {input: {cardId: issueId, columnId: column.id}, connections: connectionId ? [connectionId] : []},
    optimisticResponse: {
      moveProjectCard: {
        cardEdge: {
          node: {
            id: issueId,
            column,
            project: {
              id: projectId,
              name: projectName,
              url: '',
              columns: {
                nodes: [],
              },
            },
          },
        },
      },
    },
    onError: error => onError && onError(error),
    onCompleted: response => onCompleted && onCompleted(response),
  })
}
