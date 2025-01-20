import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  deleteIssueProjectsMutation,
  deleteIssueProjectsMutation$data,
} from './__generated__/deleteIssueProjectsMutation.graphql'

type CommitDeleteProjectMutationProps = {
  environment: Environment
  connectionId: string
  projectId: string
  itemId: string
  onError?: (error: Error) => void
  onCompleted?: (response: deleteIssueProjectsMutation$data) => void
}

export function commitDeleteIssueProjectsMutation({
  environment,
  connectionId,
  projectId,
  itemId,
  onError,
  onCompleted,
}: CommitDeleteProjectMutationProps) {
  return commitMutation<deleteIssueProjectsMutation>(environment, {
    mutation: graphql`
      mutation deleteIssueProjectsMutation($connections: [ID!]!, $input: DeleteProjectV2ItemInput!) {
        deleteProjectV2Item(input: $input) {
          deletedItemId @deleteEdge(connections: $connections)
        }
      }
    `,
    variables: {input: {itemId, projectId}, connections: [connectionId]},
    onError: error => onError && onError(error),
    onCompleted: response => onCompleted && onCompleted(response),
  })
}
