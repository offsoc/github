import {useCallback} from 'react'
import {useRelayEnvironment} from 'react-relay'

import {unsubscribeFromNotifications} from '../notifications/mutations'

type EventProps = KeyboardEvent | React.MouseEvent
type CallbackProps = {(e: EventProps): void}

const useNotificationsUnsubscribe = (subjectIds: Set<string>, onCompleteCallback?: CallbackProps) => {
  const environment = useRelayEnvironment()
  const callback = useCallback(
    (event: EventProps) => {
      if (subjectIds.size === 0) return

      event.stopPropagation()
      event.preventDefault()

      unsubscribeFromNotifications({
        environment,
        subjectIds,
        onCompleted: () => {
          onCompleteCallback && onCompleteCallback(event)
        },
      })
    },
    [environment, onCompleteCallback, subjectIds],
  )
  return callback
}

export default useNotificationsUnsubscribe
