import {commitMutation, graphql} from 'react-relay'
import type {Environment, RecordSourceSelectorProxy} from 'relay-runtime'

import mutationRequest, {
  type markNotificationsAsUnreadMutation,
} from './__generated__/markNotificationsAsUnreadMutation.graphql'

type MarkNotificationsAsUnreadMutationProps = {
  environment: Environment
  notificationIds: Set<string>
  onError?: (error: Error) => void
  onCompleted?: () => void
}

graphql`
  mutation markNotificationsAsUnreadMutation($input: MarkNotificationsAsUnreadInput!) @raw_response_type {
    markNotificationsAsUnread(input: $input) {
      success
    }
  }
`
export function updateNotificationsById(store: RecordSourceSelectorProxy, ids: Set<string>) {
  for (const id of ids) {
    const notification = store.get(id)
    if (!notification) return
    notification.setValue(true, 'isUnread')
  }
}

export function markNotificationsAsUnread({
  environment,
  notificationIds,
  onError,
  onCompleted,
}: MarkNotificationsAsUnreadMutationProps) {
  return commitMutation<markNotificationsAsUnreadMutation>(environment, {
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
