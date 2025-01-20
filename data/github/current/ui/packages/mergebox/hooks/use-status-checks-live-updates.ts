import {useAlive} from '@github-ui/use-alive'
import {throttle} from '@github/mini-throttle'
import useIsMounted from '@github-ui/use-is-mounted'
import {useCallback, useMemo, useRef} from 'react'
import {REFETCH_THROTTLE_INTERVAL_IN_MS} from '../constants'

import {useStatusChecksPageData} from '../page-data/loaders/use-status-checks-page-data'

type CallbackState = {
  func: () => void
  cleanup: () => void
}

/**
 * Hook that returns a function that will execute the provided callback when the page becomes visible. This allows us
 * to delay refetching on alive updates until the user actually sees the page.
 *
 * @returns A function that will execute the provided callback when the page becomes visible
 */
function useFireOnPageVisible() {
  const callbackRef = useRef<CallbackState>()
  return useCallback((func: () => void) => {
    if (!document.hidden) {
      // if the page is visible, execute the callback immediately
      func()
    } else {
      // clean up the previous listener without executing - we only want to execute the last subscribed callback
      // when the page becomes visible again
      callbackRef.current?.cleanup()

      const handler = () => {
        if (!document.hidden) {
          func()
          callbackRef.current?.cleanup()
          callbackRef.current = undefined
        }
      }

      const cleanup = () => {
        window.removeEventListener('visibilitychange', handler)
      }

      callbackRef.current = {func, cleanup}

      // re-subscribe with the new callback
      window.addEventListener('visibilitychange', handler)
    }
  }, [])
}

export function useStatusChecksLiveUpdates(channel: string, pullRequestHeadSha: string): void {
  const {refetch} = useStatusChecksPageData({pullRequestHeadSha})
  const isMounted = useIsMounted()
  const fireOnPageVisible = useFireOnPageVisible()

  const throttledRefetch = useMemo(
    () =>
      throttle(() => {
        if (isMounted()) {
          fireOnPageVisible(refetch)
        }
      }, REFETCH_THROTTLE_INTERVAL_IN_MS),
    [fireOnPageVisible, isMounted, refetch],
  )

  const handleNotification = useCallback(
    (data: {wait?: number}) => {
      // This creates a 2000ms throttle to prevent multiple refetches happening in the same < 500ms time window
      window.setTimeout(throttledRefetch, data.wait || 0)
    },
    [throttledRefetch],
  )

  useAlive(channel, handleNotification)
}
