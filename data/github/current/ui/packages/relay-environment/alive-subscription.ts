import type {RequestParameters, GraphQLResponse, Variables} from 'relay-runtime'
import {Observable} from 'relay-runtime'
import {fetchGraphQLWithSubscription, type GraphQLSubscriptionResult} from '@github-ui/fetch-graphql'
import {getSession} from '@github-ui/alive'
import {connectAliveSubscription} from '@github-ui/alive/connect-alive-subscription'
// eslint-disable-next-line no-restricted-imports
import {reportError} from '@github-ui/failbot'

type SubscriptionMetadata = {
  subscription_topic: string
  dispatch_time: number
  scope_object?: Record<string, unknown>
}

/**
 * Function to configure the Relay store so that it can handle subscriptions
 */
export function subscribe(
  operation: RequestParameters,
  variables: Variables,
  preloadedSubscriptions: Map<string, Map<string, GraphQLSubscriptionResult>> = new Map(),
): Observable<GraphQLResponse> {
  const persistedQueryId = operation.id

  return Observable.create<GraphQLResponse>(observer => {
    let unsubscribeFromAlive = () => {}
    let closed = false

    async function subscribeToAlive() {
      // Connect the subscription
      if (!persistedQueryId) {
        throw new Error('unexpected operation with no id!')
      }
      const scope = operation.metadata?.scope as string | undefined
      const preloadedSubscription = getPreloadedSubscriptions(
        persistedQueryId,
        variables,
        scope,
        preloadedSubscriptions,
      )
      let channelName = null

      if (preloadedSubscription) {
        channelName = preloadedSubscription.subscriptionId
        if (preloadedSubscription.response) {
          observer.next(preloadedSubscription.response)
        }
      } else {
        const fetchedSubscription = await fetchGraphQLWithSubscription(persistedQueryId, variables, 'GET', {
          isSubscription: true,
          scope,
        })
        channelName = fetchedSubscription.subscriptionId
        if (fetchedSubscription.response) {
          observer.next(fetchedSubscription.response)
        }
      }
      try {
        const aliveSession = await getSession()
        if (closed) {
          // observable was closed before graphql fetch returned
          // this is fine, we just don't subscribe to the channel on the alive side
          return
        }

        const resp = connectAliveSubscription<SubscriptionMetadata>(
          aliveSession,
          channelName,
          async ({scope_object, subscription_topic, dispatch_time}) => {
            try {
              const {response: updateResponse} = await fetchGraphQLWithSubscription(
                persistedQueryId,
                {...variables},
                'GET',
                {
                  isSubscription: true,
                  scopeObject: scope_object,
                  subscriptionTopic: subscription_topic,
                  dispatchTime: dispatch_time,
                  scope,
                },
              )
              if (updateResponse) {
                observer.next(updateResponse)
              }
            } catch (e) {
              reportError(e, {
                message: `Error in fetching update for ${persistedQueryId} with variables ${JSON.stringify(variables)}`,
              })
            }
          },
        )
        if (resp?.unsubscribe) {
          unsubscribeFromAlive = resp.unsubscribe
        }
      } catch (e) {
        // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
        observer.error(e)
      }
    }

    subscribeToAlive()

    // Return object with cleanup function
    // per https://github.com/facebook/relay/blob/aadd54d373cea6e096b95985ad0cdf298d7a7374/packages/relay-runtime/network/RelayObservable.js#L20-L23
    return {
      get closed() {
        return closed
      },
      unsubscribe() {
        closed = true
        unsubscribeFromAlive()
      },
    }
  })
}

/**
 * @param preloadedSubscriptions Map of persisted query ID to preloaded subscription responses for that query. Each
 * response should be keyed by a JSON-stringified object. This object is a map of variable names to expected variables,
 * for example: `{"issueId": "XYZ"}`. The special variable name `"$scope"` can be used to match the `scope`. Extra
 * entries in the `variables` object that are not present in the JSON string will be ignored.
 */
function getPreloadedSubscriptions(
  persistedQueryId: string,
  variables: Variables,
  scope: string | undefined,
  preloadedSubscriptions: Map<string, Map<string, GraphQLSubscriptionResult>>,
): GraphQLSubscriptionResult | undefined {
  const preloadedSubscription = preloadedSubscriptions.get(persistedQueryId)
  if (!preloadedSubscription) return undefined

  subscriptionsLoop: for (const [variablesMatcher, subscription] of preloadedSubscription) {
    for (const [name, expectedValue] of Object.entries(JSON.parse(variablesMatcher)))
      if ((name === '$scope' && scope !== expectedValue) || variables[name] !== expectedValue)
        continue subscriptionsLoop

    return subscription
  }
}
