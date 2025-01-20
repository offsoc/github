import {useAlive} from '@github-ui/use-alive'
import {throttle} from '@github/mini-throttle'
import useIsMounted from '@github-ui/use-is-mounted'
import {useCallback, useMemo} from 'react'

type EventUpdate = {
  [key: string]: boolean
}

export function useRefetchOnAliveUpdate(channel: string, refetch: () => void, watchFor?: EventUpdate): void {
  const isMounted = useIsMounted()

  const throttledRefetch = useMemo(
    () =>
      throttle(() => {
        if (isMounted()) {
          refetch()
        }
      }, 2000),
    [isMounted, refetch],
  )

  const handleNotification = useCallback(
    (data: {wait?: number; event_updates: EventUpdate}) => {
      if (watchFor && data.event_updates) {
        for (const [key, value] of Object.entries(watchFor)) {
          if (!!data.event_updates[key] === !!value) {
            window.setTimeout(throttledRefetch, data.wait || 0)
          }
        }
      } else {
        // If we're not watching for anything specific, just refetch
        window.setTimeout(throttledRefetch, data.wait || 0)
      }
    },
    [throttledRefetch, watchFor],
  )

  useAlive(channel, handleNotification)
}
