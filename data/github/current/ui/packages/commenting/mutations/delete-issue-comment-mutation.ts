import {commitMutation, graphql} from 'react-relay'
import type {Environment, RecordSourceSelectorProxy} from 'relay-runtime'

import type {deleteIssueCommentMutation} from './__generated__/deleteIssueCommentMutation.graphql'

export const deleteCommentFragment = graphql`
  fragment deleteIssueCommentMutation_Comment on IssueComment {
    id
    # eslint-disable-next-line relay/unused-fields
    viewerCanDelete
  }
`

function updateTotalCount(store: RecordSourceSelectorProxy, connectionIds: string[]) {
  for (const connectionId of connectionIds) {
    const connection = store.get(connectionId)
    if (connection) {
      const previousCount = Number(connection.getValue('totalCount'))
      if (!isNaN(previousCount)) {
        connection.setValue(previousCount - 1, 'totalCount')
      }
    }
  }
}

export function commitDeleteIssueCommentMutation({
  environment,
  connectionIds,
  input: {id},
  onCompleted,
  onError,
}: {
  environment: Environment
  connectionIds: string[]
  input: {id: string}
  onCompleted?: () => void
  onError?: (error?: Error) => void
}) {
  return commitMutation<deleteIssueCommentMutation>(environment, {
    mutation: graphql`
      mutation deleteIssueCommentMutation($connections: [ID!]!, $input: DeleteIssueCommentInput!) @raw_response_type {
        deleteIssueComment(input: $input) {
          clientMutationId
          issueComment {
            id @deleteEdge(connections: $connections)
          }
        }
      }
    `,
    variables: {
      input: {id},
      connections: connectionIds,
    },
    optimisticResponse: {
      deleteIssueComment: {
        clientMutationId: '',
        issueComment: {
          id,
        },
      },
    },
    optimisticUpdater: store => updateTotalCount(store, connectionIds),
    updater: store => updateTotalCount(store, connectionIds),
    onCompleted: response => {
      if (response.deleteIssueComment === null) {
        onError?.()
      } else {
        onCompleted?.()
      }
    },
    onError: error => onError?.(error),
  })
}
