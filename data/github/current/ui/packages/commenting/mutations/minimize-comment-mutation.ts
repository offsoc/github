import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {minimizeCommentMutation, ReportedContentClassifiers} from './__generated__/minimizeCommentMutation.graphql'

export function minimizeCommentMutation({
  environment,
  input: {id, reason},
  onCompleted,
  onError,
}: {
  environment: Environment
  input: {id: string; reason: ReportedContentClassifiers}
  onCompleted?: () => void
  onError?: (error?: Error) => void
}) {
  return commitMutation<minimizeCommentMutation>(environment, {
    mutation: graphql`
      mutation minimizeCommentMutation($input: MinimizeCommentInput!) @raw_response_type {
        minimizeComment(input: $input) {
          clientMutationId
          minimizedComment {
            isMinimized
            minimizedReason
          }
        }
      }
    `,
    variables: {
      input: {subjectId: id, classifier: reason},
    },
    optimisticResponse: {
      minimizeComment: {
        clientMutationId: '',
        minimizedComment: {
          id,
          __typename: 'IssueComment',
          __isNode: 'IssueComment',
          isMinimized: true,
          minimizedReason: reason,
        },
      },
    },
    onCompleted: response => {
      if (response.minimizeComment === null) {
        onError?.()
      } else {
        onCompleted?.()
      }
    },
    onError: error => onError?.(error),
  })
}
