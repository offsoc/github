import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  deleteIssueFromClassicProjectMutation,
  deleteIssueFromClassicProjectMutation$data,
} from './__generated__/deleteIssueFromClassicProjectMutation.graphql'

type CommitProjectMutationProps = {
  environment: Environment
  connectionId?: string
  cardId: string
  onError?: (error: Error) => void
  onCompleted?: (response: deleteIssueFromClassicProjectMutation$data) => void
}

export function commitDeleteIssueFromClassicProjectMutation({
  environment,
  connectionId,
  cardId,
  onError,
  onCompleted,
}: CommitProjectMutationProps) {
  return commitMutation<deleteIssueFromClassicProjectMutation>(environment, {
    mutation: graphql`
      mutation deleteIssueFromClassicProjectMutation($connections: [ID!]!, $input: DeleteProjectCardInput!)
      @raw_response_type {
        deleteProjectCard(input: $input) {
          deletedCardId @deleteEdge(connections: $connections)
        }
      }
    `,
    variables: {input: {cardId}, connections: connectionId ? [connectionId] : []},
    onError: error => onError && onError(error),
    onCompleted: response => onCompleted && onCompleted(response),
  })
}
