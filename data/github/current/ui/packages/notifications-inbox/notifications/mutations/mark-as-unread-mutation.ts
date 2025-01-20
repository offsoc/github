import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import mutationRequest, {type markAsUnreadMutation} from './__generated__/markAsUnreadMutation.graphql'

type MarkAsUnreadMutationProps = {
  environment: Environment
  notificationId: string
  onError?: (error: Error) => void
}

graphql`
  mutation markAsUnreadMutation($input: MarkNotificationAsUnreadInput!) @raw_response_type {
    markNotificationAsUnread(input: $input) {
      success
      notificationThread {
        id
        isUnread
      }
    }
  }
`

export function markNotificationAsUnread({environment, notificationId, onError}: MarkAsUnreadMutationProps) {
  return commitMutation<markAsUnreadMutation>(environment, {
    mutation: mutationRequest,
    variables: {input: {id: notificationId}},
    optimisticResponse: {
      markNotificationAsUnread: {
        success: true,
        notificationThread: {
          id: notificationId,
          isUnread: true,
        },
      },
    },
    onError,
  })
}
