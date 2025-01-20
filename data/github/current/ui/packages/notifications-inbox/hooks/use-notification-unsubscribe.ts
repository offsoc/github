import {type MouseEvent, useCallback} from 'react'
import {useRelayEnvironment} from 'react-relay'

import {updateSubscription} from '../notifications/mutations'

type EventProps = KeyboardEvent | MouseEvent
type CallbackProps = {(e: EventProps): void}

const useNotificationUnsubscribe = (subscribableId?: string | null, onCompleteCallback?: CallbackProps) => {
  const environment = useRelayEnvironment()
  const callback = useCallback(
    (event: EventProps) => {
      if (!subscribableId) return

      event.stopPropagation()
      event.preventDefault()

      updateSubscription({
        environment,
        subscribableId,
        state: 'UNSUBSCRIBED',
        onCompleted: () => {
          onCompleteCallback && onCompleteCallback(event)
        },
      })
    },
    [environment, onCompleteCallback, subscribableId],
  )
  return callback
}

export default useNotificationUnsubscribe
