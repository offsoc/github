import {createContext, useContext, useEffect, type PropsWithChildren} from 'react'
import {SubscriptionSet, Topic} from '@github/alive-client'

type InitialMessages = Array<[string, unknown]>

const AliveTestContext = createContext<typeof testSubscribeToAlive | null>(null)

let subscriptions: SubscriptionSet<(data: unknown) => unknown> | null = null
/**
 * Provides context required to dispatch mock alive messages via `dispatchAliveTestMessage`
 *
 *@example
 * ```ts
 * import {AliveTestProvider, dispatchAliveTestMessage, signChannel} from '@github-ui/use-alive/test-utils'
 *
 * render(<MyComponent aliveChannel={signChannel("channel-name")} />, {
 *   wrapper: ({children}) => (
 *     <AliveTestProvider
 *       initialMessages={[["channel-name", {data: 1}]]}
 *     >
 *       {children}
 *     </AliveTestProvider>
 * )})
 *
 * // later in the test, you can send another message:
 * dispatchAliveTestMessage("channel-name", {data: 2})
 * ```
 */
export function AliveTestProvider({children, initialMessages}: PropsWithChildren<{initialMessages?: InitialMessages}>) {
  useEffect(() => {
    if (initialMessages) {
      for (const [channel, users] of initialMessages) {
        setTimeout(() => {
          dispatchAliveTestMessage(channel, users)
        }, 0)
      }
    }

    return () => {
      // delete subscriptions on unmount of provider to reset subs between tests
      subscriptions = null
    }
  })
  return <AliveTestContext.Provider value={testSubscribeToAlive}>{children}</AliveTestContext.Provider>
}

/**
 * Send mock Alive messages for tests or storybook etc.
 * Component under test **must** be wrapped in `AliveTestProvider` to enable Alive mocking.
 *
 * @see `AliveTestProvider`
 *
 * @param channel - an unsigned alive channel name: subscribers to this channel will be notified
 * @param data - data to send to subscribers
 */
export function dispatchAliveTestMessage(channel: string, data: unknown) {
  if (subscriptions === null) {
    throw new Error(
      'Test helper `dispatchAliveTestMessage` called outside `AliveTestProvider`. Please wrap your component under test in `AliveTestProvider` from "@github-ui/use-alive/test-utils".',
    )
  }

  const subscribers = Array.from(subscriptions.subscribers(channel))
  for (const subscriber of subscribers) {
    subscriber(data)
  }
}

/**
 * Provides access to the `testSubscribeToAlive` mock if called from within a `AliveTestProvider` context
 */
export function useTestSubscribeToAlive() {
  return useContext(AliveTestContext)
}

/**
 * This function is private and is intended only to be consumable via `AliveTestProvider` / `useTestSubscribeToAlive`
 * Furthermore it is only expected to be used in `use-alive.ts`
 * @param signedChannel - A signed alive channel. You can use `signChannel` to generate a signed channel from a channel name.
 * @param callback - this will be called with data provided via `dispatchAliveTestMessage` to simulate an alive message
 * @private
 */
function testSubscribeToAlive(signedChannel: string, callback: (data: unknown) => unknown) {
  const topic = Topic.parse(signedChannel)
  if (!topic) {
    throw new Error(`Invalid channel name. Did you forget to sign it with \`signChannel("${signedChannel}")\`?`)
  }
  if (!subscriptions) {
    subscriptions = new SubscriptionSet()
  }
  subscriptions.add({topic, subscriber: callback})
  return {
    unsubscribe: () => {
      subscriptions?.delete({topic, subscriber: callback})
    },
  }
}

const fakeTimestamp = 1234567890
const fakeSignature = 'SIGNATURE'

/**
 * Simulate a server-signed alive channel. Useful for passing as the signed channel to `useAlive` in code under test.
 *
 * @param channel - Unsigned channel name. This is the channel you will dispatch messages to.
 * @param [timestamp=1234567890] - Unix Epoch Time the channel was signed on the server. Default is equal to
 *         "2009-02-13T23:31:30.000Z" (multiply by 1000 for JS time in milliseconds)
 * @param [signature='SIGNATURE'] - String used to verify the signature. Ignored in test mode.
 * @returns A signed channel of the form `${btoa({"c": "CHANNEL", "t": 1234567890}')}--SIGNATURE`
 */
export function signChannel(channel: string, timestamp = fakeTimestamp, signature = fakeSignature) {
  return `${btoa(`{"c": "${channel}", "t": ${timestamp}}`)}--${signature}`
}
