import {unstable_batchedUpdates} from 'react-dom'
import type {Environment as RelayEnvironment} from 'react-relay'
import type {
  RequestParameters,
  Variables,
  TaskScheduler,
  CacheConfig,
  INetwork,
  GraphQLTaggedNode,
  OperationType,
  GraphQLResponse,
} from 'relay-runtime'
import {
  Environment,
  Network,
  Observable,
  RecordSource,
  Store,
  createOperationDescriptor,
  fetchQuery,
  generateClientID,
  getRequest,
} from 'relay-runtime'
import type {ErrorCallbacks, GraphQLResult, GraphQLSubscriptionResult} from '@github-ui/fetch-graphql'
import fetchGraphQL from '@github-ui/fetch-graphql'
import {missingFieldHandlers} from './missing-field-handlers'
import {subscribe} from './alive-subscription'
import {scheduleLowPriority} from './scheduler'
import {wasServerRendered, IS_BROWSER} from '@github-ui/ssr-utils'
import type {Sink} from 'relay-runtime/lib/network/RelayObservable'

type QueryId = string
type SerializedParams = string
type ParamsToResult = Map<SerializedParams, GraphQLResult>
type fetchRelayInternalType = {
  params: RequestParameters
  variables: Variables
  observer: Sink<GraphQLResponse>
  ssrPreloadedQueries?: Map<QueryId, ParamsToResult>
  baseUrl?: string
  emitWarning?: (message: string) => void
  enabledFeatures: FeatureFlagMap
  maxAge?: number
  errorCallbacks?: ErrorCallbacks
}

export type FeatureFlagMap = {
  [key: string]: boolean
}

// Wrapped helper that first tries to fetch from preloaded data in the JSON
// island and falls back to the API if nothing is there.
export function fetchRelayInternal({
  params,
  variables,
  ssrPreloadedQueries,
  baseUrl,
  emitWarning,
  enabledFeatures,
  maxAge,
  errorCallbacks,
  observer,
}: fetchRelayInternalType) {
  if (!params.id) throw new Error('params has no id property!')

  // try to get the query from the environment options via the preloaded queries
  if (params.id && ssrPreloadedQueries) {
    const variablesKey = JSON.stringify(variables)
    const result = ssrPreloadedQueries.get(params.id)?.get(variablesKey)

    const currentTimestamp = Math.floor(new Date().getTime() / 1000)
    const responseTimestamp = result?.timestamp

    const isStale = maxAge && responseTimestamp ? currentTimestamp > responseTimestamp + maxAge : false
    if (result) {
      // we have a preloaded query notifying the observer with the result
      observer.next(result)
      // if the query is not stale we can complete the observer
      // otherwise we need to fetch the query from the server to make sure it is up to date
      if (!isStale) {
        observer.complete()
        return
      }
    }

    if (
      params.metadata?.isRelayRouteRequest &&
      wasServerRendered() &&
      emitWarning &&
      (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')
    ) {
      if (ssrPreloadedQueries.size === 0) {
        emitWarning(
          'Relay SSR Error: There where no preloaded queries found. \n' +
            'More context can be found here: https://thehub.github.com/support/ecosystem/api-graphql/training/graphql-relay/#ssr-error-1',
        )
      } else {
        const queryMap = ssrPreloadedQueries.get(params.id)
        if (!queryMap) {
          emitWarning(
            `Relay SSR Error: There where no preloaded queries found for ${params.id} \n` +
              'More context can be found here: https://thehub.github.com/support/ecosystem/api-graphql/training/graphql-relay/#ssr-error-2',
          )
        } else {
          emitWarning(
            `Relay SSR Error: There where no preloaded queries found for ${params.id} with variables ${variablesKey} \n` +
              `The persisted query (${params.id}) contains preloaded queries for the following set of variables: \n` +
              `${Array.from(queryMap.keys()).join('\n')} \n` +
              'More context can be found here: https://thehub.github.com/support/ecosystem/api-graphql/training/graphql-relay/#ssr-error-3',
          )
        }
      }
    }
  }

  const method = params.operationKind === 'mutation' ? 'POST' : 'GET'
  // only fetch from the API if we are in the browser
  if (IS_BROWSER) {
    // return the promise
    return fetchGraphQL(params.id, variables, method, baseUrl, enabledFeatures, errorCallbacks, observer)
  }
}

// this fixes a bug in relay where children can be re-rendered with deleted relay data
// before the parent re-renders, causing a crash. This is a workaround provided by the relay team
// in https://github.com/facebook/relay/issues/3514
const RelayScheduler: TaskScheduler = {
  cancel: () => false,
  schedule: task => {
    unstable_batchedUpdates(task)
    return ''
  },
}

type ServerPreloadedData<T> = Map<string, T>
export type ServerPreloadedSubscription = ServerPreloadedData<GraphQLSubscriptionResult>
export type ServerPreloadedQuery = ServerPreloadedData<GraphQLResult>

export class SSRNetwork {
  relayNetwork: INetwork
  ssrPreloadedData: Map<string, ServerPreloadedQuery>
  preloadedSubscriptions: Map<string, ServerPreloadedSubscription>
  warningsShown: Set<string>
  enabled_features: FeatureFlagMap
  maxAge?: number
  errorCallbacks?: ErrorCallbacks
  constructor(
    ssrPreloadedData: Map<string, ServerPreloadedQuery>,
    enabled_features: FeatureFlagMap = {},
    preloadedSubscriptions: Map<string, ServerPreloadedSubscription>,
    baseUrl?: string,
    maxAge?: number,
    errorCallbacks?: ErrorCallbacks,
  ) {
    this.ssrPreloadedData = ssrPreloadedData
    this.enabled_features = enabled_features
    this.preloadedSubscriptions = preloadedSubscriptions
    this.warningsShown = new Set()
    this.maxAge = maxAge
    this.errorCallbacks = errorCallbacks
    this.relayNetwork = Network.create(
      (params: RequestParameters, variables: Variables) => {
        return Observable.create(observer => {
          const response = fetchRelayInternal({
            params,
            variables,
            ssrPreloadedQueries: this.ssrPreloadedData,
            baseUrl,
            emitWarning: (message: string) => {
              if (!this.warningsShown.has(message)) {
                this.warningsShown.add(message)
                // eslint-disable-next-line no-console
                console.warn(message)
              }
            },
            enabledFeatures: this.enabled_features,
            maxAge,
            errorCallbacks: this.errorCallbacks,
            observer,
          })

          if (response instanceof Promise) {
            // eslint-disable-next-line github/no-then
            response.then(resolved => {
              if (!Array.isArray(resolved)) {
                if ('extensions' in resolved && resolved.extensions && resolved.extensions.subscriptions) {
                  const subscriptions = resolved.extensions.subscriptions
                  for (const queryId in subscriptions) {
                    if (!this.preloadedSubscriptions.has(queryId)) {
                      this.preloadedSubscriptions.set(queryId, new Map())
                    }
                    for (const variablesKey in subscriptions[queryId]) {
                      this.preloadedSubscriptions.get(queryId)?.set(variablesKey, subscriptions[queryId][variablesKey])
                    }
                  }
                }
              }

              observer.next(resolved)
              observer.complete()
            })
          }
        })
      },
      (params: RequestParameters, variables: Variables) => {
        return subscribe(params, variables, this.preloadedSubscriptions)
      },
    )
  }

  execute(
    request: RequestParameters,
    variables: Variables,
    cacheConfig: CacheConfig,
    // uploadables: UploadableMap | undefined = undefined,
  ) {
    return this.relayNetwork.execute(request, variables, cacheConfig)
  }

  getPreloadedSubscriptions() {
    return this.preloadedSubscriptions
  }
}

// Relay environment with missingFieldHandlers. This is used mainly for controlled rollout of missingFieldHandlers.
// Once we gain confidence in these changes we will upstream to the main Environment instance.
export const relayEnvironmentWithMissingFieldHandlerForNode = (
  baseUrl?: string,
  errorCallbacks?: ErrorCallbacks,
): Environment => {
  const customNetwork = new SSRNetwork(new Map(), {}, new Map(), baseUrl, undefined, errorCallbacks)
  const localEnvironment = new Environment({
    scheduler: RelayScheduler,
    store: new Store(new RecordSource(), {
      // Keep a buffer of at most 50 released queries to avoid them being disposed. Helpful for back forward
      // navigation in short succession alleviates the need for a query to go out to the network if a component
      // is remounted quickly.
      gcReleaseBufferSize: 50,
      // Keep stale entries around for a maximum of 5 mins.
      queryCacheExpirationTime: 5 * 60 * 1e3,
      // Don't garbage collect immediately, wait at least 10s before performing garbage collection.
      // See: https://relay.dev/docs/guided-tour/reusing-cached-data/presence-of-data/#gc-scheduler
      gcScheduler: scheduleLowPriority,
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getDataID: (fieldValue: {[key: string]: any}, typeName: string) => {
      // This is basically the default (defaultGetDataID.js) implementation
      // Special handling for ProjectV2SingleSelectFieldOption due to it having a non-unique id field
      if (typeName === 'Viewer') {
        return fieldValue.id == null ? generateClientID('client:root', 'viewer') : fieldValue.id
      }
      if (typeName === 'ProjectV2SingleSelectFieldOption') {
        const idFields: Array<string | number> = []
        if (fieldValue.id) idFields.push(fieldValue.id)
        if (fieldValue.name) idFields.push(fieldValue.name)
        if (fieldValue.color) idFields.push(fieldValue.color)
        if (fieldValue.description) idFields.push(getHash(fieldValue.description))
        return idFields.join('_')
      }
      return fieldValue.id
    },
    network: customNetwork,
    missingFieldHandlers,
  })

  localEnvironment.options = {
    baseUrl,
    getPreloadedSubscriptions: () => {
      return customNetwork.getPreloadedSubscriptions()
    },
  }
  return localEnvironment
}

function getHash(input: string) {
  let hash = 0
  if (input.length === 0) return hash
  for (let i = 0; i < input.length; i++) {
    const chr = input.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0
  }
  return hash
}

export function clientSideRelayFetchQueryRetained<T extends OperationType>({
  environment,
  query,
  variables = {},
}: {
  environment: RelayEnvironment
  query: GraphQLTaggedNode
  variables?: Record<string, unknown>
}) {
  const queryRequest = getRequest(query)
  const queryDescriptor = createOperationDescriptor(queryRequest, variables)
  environment.retain(queryDescriptor)
  return fetchQuery<T>(environment, query, variables, {fetchPolicy: 'store-or-network'})
}
