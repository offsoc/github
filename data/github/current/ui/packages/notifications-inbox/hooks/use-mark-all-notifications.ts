import {useCallback} from 'react'
import {useRelayEnvironment} from 'react-relay'
import type {RecordSourceSelectorProxy} from 'relay-runtime'

import {markAllNotifications} from '../notifications/mutations'
import type {NotificationStatus} from '../notifications/mutations/__generated__/markAllNotificationsMutation.graphql'

type CallbackProps = {(store: RecordSourceSelectorProxy, value: boolean): void}

const useMarkAllNotifications = (state: NotificationStatus, onUpdateCallback?: CallbackProps) => {
  const environment = useRelayEnvironment()
  const callback = useCallback(() => {
    markAllNotifications({
      environment,
      state,
      onUpdated: store => {
        if (state === 'DONE') {
          onUpdateCallback && onUpdateCallback(store, true)
        } else {
          onUpdateCallback && onUpdateCallback(store, state === 'UNREAD')
        }
      },
    })
  }, [environment, onUpdateCallback, state])
  return callback
}

export default useMarkAllNotifications
