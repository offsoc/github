import {useCallback} from 'react'
import {useRelayEnvironment} from 'react-relay'

import {updateNotificationViewPreference} from '../notifications/mutations'
import type {NotificationViewPreference} from '../types/notification'

const useUpdateNotificationViewPreference = () => {
  const environment = useRelayEnvironment()
  const callback = useCallback(
    (viewPreference: NotificationViewPreference, onCompleted?: () => void, onError?: () => void) => {
      updateNotificationViewPreference({
        environment,
        viewPreference,
        onCompleted,
        onError,
      })
    },
    [environment],
  )
  return callback
}

export default useUpdateNotificationViewPreference
