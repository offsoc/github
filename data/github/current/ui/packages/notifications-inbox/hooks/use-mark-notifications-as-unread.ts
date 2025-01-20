import {useCallback} from 'react'
import {useRelayEnvironment} from 'react-relay'

import {markNotificationsAsUnread} from '../notifications/mutations'

const useMarkNotificationsAsUnread = (notificationIds: Set<string>) => {
  const environment = useRelayEnvironment()
  const callback = useCallback(
    (event: KeyboardEvent | React.MouseEvent) => {
      if (notificationIds.size === 0) return

      event.stopPropagation()
      event.preventDefault()

      markNotificationsAsUnread({
        environment,
        notificationIds,
      })
    },
    [environment, notificationIds],
  )
  return callback
}

export default useMarkNotificationsAsUnread
