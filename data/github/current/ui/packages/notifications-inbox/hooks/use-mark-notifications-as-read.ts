import {useCallback} from 'react'
import {useRelayEnvironment} from 'react-relay'

import {markNotificationsAsRead} from '../notifications/mutations'

const useMarkNotificationsAsRead = (notificationIds: Set<string>) => {
  const environment = useRelayEnvironment()
  const callback = useCallback(
    (event: KeyboardEvent | React.MouseEvent) => {
      if (notificationIds.size === 0) return

      event.stopPropagation()
      event.preventDefault()

      markNotificationsAsRead({
        environment,
        notificationIds,
      })
    },
    [environment, notificationIds],
  )
  return callback
}

export default useMarkNotificationsAsRead
