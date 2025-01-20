import {type MouseEvent, useCallback} from 'react'
import {useRelayEnvironment} from 'react-relay'

import {markNotificationAsUnread} from '../../notifications/mutations'

const useMarkNotificationAsUnread = (notificationId?: string | null) => {
  const environment = useRelayEnvironment()
  const callback = useCallback(
    (event: KeyboardEvent | MouseEvent) => {
      if (!notificationId) return

      event.stopPropagation()
      event.preventDefault()

      markNotificationAsUnread({
        environment,
        notificationId,
      })
    },
    [environment, notificationId],
  )
  return callback
}

export default useMarkNotificationAsUnread
