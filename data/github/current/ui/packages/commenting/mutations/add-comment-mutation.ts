import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {AddCommentInput, addCommentMutation} from './__generated__/addCommentMutation.graphql'

export function addCommentMutation({
  environment,
  input: {subject, body, connectionId},
  onError,
  onCompleted,
}: {
  environment: Environment
  input: {
    subject: string
    body: string
    connectionId: string
  }
  onError?: (error?: Error) => void
  onCompleted?: () => void
}) {
  const inputHash: AddCommentInput = {
    subjectId: subject,
    body: body ? body : '',
  }

  // Temporary hardcoding of `itemTypes` until we support all timeline items.
  // This is required for Relay for live reloading to work.

  return commitMutation<addCommentMutation>(environment, {
    mutation: graphql`
      mutation addCommentMutation($connections: [ID!]!, $input: AddCommentInput!) @raw_response_type {
        addComment(input: $input) {
          timelineEdge @appendEdge(connections: $connections) {
            node {
              ...IssueCommentViewerCommentRow
              ...IssueComment_issueComment
            }
          }
          subject {
            id
          }
        }
      }
    `,
    variables: {
      input: inputHash,
      connections: [connectionId],
    },
    onError: error => onError && onError(error),
    onCompleted: response => {
      !response.addComment ? onError && onError() : onCompleted && onCompleted()
    },
  })
}
