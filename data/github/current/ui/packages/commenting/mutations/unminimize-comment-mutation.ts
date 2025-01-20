import {commitLocalUpdate, commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {unminimizeCommentMutation} from './__generated__/unminimizeCommentMutation.graphql'

export function unminimizeCommentMutation({
  environment,
  input: {id},
  onCompleted,
  onError,
}: {
  environment: Environment
  input: {id: string}
  onCompleted?: () => void
  onError?: (error?: Error) => void
}) {
  return commitMutation<unminimizeCommentMutation>(environment, {
    mutation: graphql`
      mutation unminimizeCommentMutation($input: UnminimizeCommentInput!) @raw_response_type {
        unminimizeComment(input: $input) {
          clientMutationId
          unminimizedComment {
            isMinimized
            minimizedReason
          }
        }
      }
    `,
    variables: {
      input: {subjectId: id},
    },
    optimisticResponse: {
      unminimizeComment: {
        clientMutationId: '',
        unminimizedComment: {
          id,
          __typename: 'IssueComment',
          __isNode: 'IssueComment',
          isMinimized: false,
          minimizedReason: null,
        },
      },
    },
    onCompleted: response => {
      if (response.unminimizeComment === null) {
        onError?.()
      } else {
        commitLocalUpdate(environment, store => {
          const comment = store.get(id)
          comment?.setValue(null, 'pendingMinimizeReason')
        })
        onCompleted?.()
      }
    },
    onError: error => onError?.(error),
  })
}
