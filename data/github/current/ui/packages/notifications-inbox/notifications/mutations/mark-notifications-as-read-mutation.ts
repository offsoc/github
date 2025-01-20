import {commitMutation, graphql} from 'react-relay'
import type {Environment, RecordSourceSelectorProxy} from 'relay-runtime'

import mutationRequest, {
  type markNotificationsAsReadMutation,
} from './__generated__/markNotificationsAsReadMutation.graphql'

type MarkNotificationsAsReadMutationProps = {
  environment: Environment
  notificationIds: Set<string>
  onError?: (error: Error) => void
  onCompleted?: () => void
}

graphql`
  mutation markNotificationsAsReadMutation($input: MarkNotificationsAsReadInput!) @raw_response_type {
    markNotificationsAsRead(input: $input) {
      success
    }
  }
`
export function updateNotificationsById(store: RecordSourceSelectorProxy, ids: Set<string>) {
  for (const id of ids) {
    const notification = store.get(id)
    if (!notification) return
    notification.setValue(false, 'isUnread')
  }
}

export function markNotificationsAsRead({
  environment,
  notificationIds,
  onError,
  onCompleted,
}: MarkNotificationsAsReadMutationProps) {
  return commitMutation<markNotificationsAsReadMutation>(environment, {
    mutation: mutationRequest,
    variables: {input: {ids: Array.from(notificationIds)}},
    optimisticUpdater: store => updateNotificationsById(store, notificationIds),
    updater: store => {
      updateNotificationsById(store, notificationIds)
    },
    onError,
    onCompleted: () => onCompleted && onCompleted(),
  })
}
