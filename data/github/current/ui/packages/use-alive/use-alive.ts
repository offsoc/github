import {useEffect} from 'react'
import useIsMounted from '@github-ui/use-is-mounted'
import {getSession} from '@github-ui/alive'
import {connectAliveSubscription} from '@github-ui/alive/connect-alive-subscription'
import {useTestSubscribeToAlive} from './TestAliveSubscription'

/**
 * Subscribe to an alive channel with a signed channel name. Event data
 * will be passed to the callback.
 * @param signedChannel the signed channel name, provided from the server
 * @param callback a callback to receive events from the alive channel. This callback should be memoized to avoid unnecessary resubscribes when React re-renders.
 */
export function useAlive<T>(signedChannel: string, callback: (data: T) => unknown) {
  const isMounted = useIsMounted()
  const testSubscribeToAlive = useTestSubscribeToAlive()

  useEffect(() => {
    let unsubscribeFromAlive = () => {}
    let closed = false

    async function subscribeToAlive() {
      if (typeof testSubscribeToAlive === 'function') {
        const subs = await testSubscribeToAlive(signedChannel, callback as (data: unknown) => unknown)
        if (subs) {
          unsubscribeFromAlive = subs.unsubscribe
        }
        return
      }

      try {
        const aliveSession = await getSession()
        if (closed) {
          // Possible we unsubscribed before the session returned
          // this is fine, we just don't subscribe to the channel on the alive side
          return
        }
        const resp = connectAliveSubscription(aliveSession, signedChannel, callback)
        if (resp?.unsubscribe) {
          if (isMounted()) {
            unsubscribeFromAlive = resp.unsubscribe
          } else {
            resp.unsubscribe()
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      }
    }

    subscribeToAlive()

    return () => {
      closed = true
      unsubscribeFromAlive()
    }
  }, [signedChannel, callback, isMounted, testSubscribeToAlive])
}
