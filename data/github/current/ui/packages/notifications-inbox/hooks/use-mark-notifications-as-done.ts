import {useCallback} from 'react'
import {useRelayEnvironment} from 'react-relay'

import {markNotificationsAsDone} from '../notifications/mutations'

type CallbackProps = {(itemsUpdated: Set<string>): void}

const useMarkNotificationsAsDone = (notificationIds: Set<string>, onCompleteCallback?: CallbackProps) => {
  const environment = useRelayEnvironment()
  const callback = useCallback(
    (event: KeyboardEvent | React.MouseEvent) => {
      if (notificationIds.size === 0) return

      event.stopPropagation()
      event.preventDefault()

      markNotificationsAsDone({
        environment,
        notificationIds,
        onCompleted: () => {
          onCompleteCallback && onCompleteCallback(notificationIds)
        },
      })
    },
    [environment, notificationIds, onCompleteCallback],
  )
  return callback
}

export default useMarkNotificationsAsDone
