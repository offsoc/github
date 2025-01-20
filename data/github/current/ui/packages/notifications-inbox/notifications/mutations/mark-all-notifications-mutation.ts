import {commitMutation, graphql} from 'react-relay'
import type {Environment, RecordSourceSelectorProxy} from 'relay-runtime'

import mutationRequest, {
  type markAllNotificationsMutation,
  type NotificationStatus,
} from './__generated__/markAllNotificationsMutation.graphql'

type MarkAllNotificationsMutationProps = {
  environment: Environment
  state: NotificationStatus
  onError?: (error: Error) => void
  onCompleted?: () => void
  onUpdated?: (store: RecordSourceSelectorProxy) => void
}

graphql`
  mutation markAllNotificationsMutation($input: MarkAllNotificationsInput!) @raw_response_type {
    markAllNotifications(input: $input) {
      success
    }
  }
`

export function markAllNotifications({
  environment,
  state,
  onError,
  onCompleted,
  onUpdated,
}: MarkAllNotificationsMutationProps) {
  return commitMutation<markAllNotificationsMutation>(environment, {
    mutation: mutationRequest,
    variables: {input: {state, query: ''}},
    optimisticUpdater: store => onUpdated && onUpdated(store),
    updater: store => {
      onUpdated && onUpdated(store)
    },
    onError,
    onCompleted: () => onCompleted && onCompleted(),
  })
}
