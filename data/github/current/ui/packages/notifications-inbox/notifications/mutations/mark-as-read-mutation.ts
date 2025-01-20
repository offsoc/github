import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import mutationRequest, {type markAsReadMutation} from './__generated__/markAsReadMutation.graphql'

type MarkAsReadMutationProps = {
  environment: Environment
  notificationId: string
  onError?: (error: Error) => void
  onCompleted?: () => void
}

graphql`
  mutation markAsReadMutation($input: MarkNotificationAsReadInput!) @raw_response_type {
    markNotificationAsRead(input: $input) {
      success
      notificationThread {
        id
        isUnread
      }
    }
  }
`

export function markNotificationAsRead({environment, notificationId, onError, onCompleted}: MarkAsReadMutationProps) {
  return commitMutation<markAsReadMutation>(environment, {
    mutation: mutationRequest,
    variables: {input: {id: notificationId}},
    optimisticResponse: {
      markNotificationAsRead: {
        success: true,
        notificationThread: {
          id: notificationId,
          isUnread: false,
        },
      },
    },
    onError,
    onCompleted: () => onCompleted && onCompleted(),
  })
}
