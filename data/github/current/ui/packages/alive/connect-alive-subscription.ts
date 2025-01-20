import type {getSession} from '@github-ui/alive'
import {Topic} from '@github/alive-client'

/**
 * Connect to an Alive subscription
 * @param aliveSession the Alive session
 * @param channelName the signed channel name
 * @param callback a callback to receive events from the alive channel. This callback should be memoized to avoid unnecessary resubscribes when React re-renders.
 */

export function connectAliveSubscription<T>(
  aliveSession: Awaited<ReturnType<typeof getSession>>,
  channelName: string | null,
  callback: (data: T) => unknown,
) {
  if (!aliveSession) {
    // the alive session failed to connect
    throw new Error('Not connected to alive')
  }

  if (!channelName) {
    throw new Error('No channel name')
  }

  const topic = Topic.parse(channelName)

  if (!topic) {
    throw new Error('Invalid channel name')
  }

  const aliveSubscription = {
    subscriber: {
      dispatchEvent: (event: Event) => {
        if (event instanceof CustomEvent) {
          const subscriptionEvent = event.detail
          callback(subscriptionEvent.data)
        }
      },
    },
    topic,
  }

  aliveSession.subscribe([aliveSubscription])
  return {
    unsubscribe: () => aliveSession.unsubscribeAll(aliveSubscription.subscriber),
  }
}
