import {type MouseEvent, useCallback} from 'react'
import {useRelayEnvironment} from 'react-relay'

import {markNotificationAsDone} from '../../notifications/mutations'

const useMarkNotificationAsDone = (notificationId?: string | null) => {
  const environment = useRelayEnvironment()
  const callback = useCallback(
    (event: KeyboardEvent | MouseEvent) => {
      if (!notificationId) return

      event.stopPropagation()
      event.preventDefault()

      markNotificationAsDone({
        environment,
        notificationId,
      })
    },
    [environment, notificationId],
  )
  return callback
}

export default useMarkNotificationAsDone
