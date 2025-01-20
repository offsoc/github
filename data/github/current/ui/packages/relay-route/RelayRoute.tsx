import JSResource from '@github-ui/js-resource'
import {TransitionType, type LoaderResultLoaded, type RouteRegistration} from '@github-ui/react-core/app-routing-types'
import {useCurrentRouteState} from '@github-ui/react-core/use-current-route-state'
import {SSRNetwork, type FeatureFlagMap, type ServerPreloadedSubscription} from '@github-ui/relay-environment'
import type React from 'react'
import {Suspense} from 'react'
import type {Location, Params} from 'react-router-dom'
import {RecordSource, type OperationType, type Variables} from 'relay-runtime'

import {
  EntryPointContainer,
  RelayEnvironmentProvider,
  loadEntryPoint,
  type EntryPoint,
  type EntryPointComponent,
  type PreloadedEntryPoint,
} from 'react-relay'

import type {GraphQLResult, GraphQLSubscriptionResult} from '@github-ui/fetch-graphql'
import {buildQueries} from './build-queries'
import type {ExtractDynamicSegments, RelayRouteProps, RouteParams, VariableTransformer} from './types'

const defaultVariableTransformer: VariableTransformer<string> = variables => variables

type RelayPayloadType<TEntryPointComponent> = {
  entryPointReference: PreloadedEntryPoint<TEntryPointComponent>
}
type IslandPreloadedQuery = {queryId: string; variables: Variables; result: GraphQLResult; timestamp?: number}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RecordMap = Record<string, any>
type EmbeddedDataType = {
  payload: {
    preloadedQueries?: IslandPreloadedQuery[]
    preloaded_records?: RecordMap
    preloadedSubscriptions?: Record<string, Record<string, GraphQLSubscriptionResult>>
  }
  enabled_features?: FeatureFlagMap
}

type LoadSyncType = {
  pathParams: Params<string>
  searchParams: URLSearchParams
  embeddedData?: EmbeddedDataType
}

/**
 * A utility for building a route registration for a route given a defined Relay entry point).
 * @experimental
 */
export function relayRoute<
  Path extends string,
  // The inferred queries passed to the EntryPointComponent as props
  PreloadedQueryProps extends Record<string, OperationType>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PreloadedEntryPoints extends Record<string, EntryPoint<any, any> | undefined>,
  RuntimeProps extends NonNullable<unknown>,
  ExtraProps extends NonNullable<unknown>,
>(
  {
    path,
    resourceName,
    componentLoader,
    Component,
    queryConfigs,
    transformVariables = defaultVariableTransformer,
    title,
    relayEnvironment,
    fallback,
    maxAge,
    errorCallbacks,
  }: RelayRouteProps<Path, PreloadedQueryProps, PreloadedEntryPoints, RuntimeProps, ExtraProps>,
  runtimeProps = {} as RuntimeProps,
): RouteRegistration<unknown, unknown> {
  type TEntryPointComponent = EntryPointComponent<PreloadedQueryProps, PreloadedEntryPoints, RuntimeProps, ExtraProps>

  const internalResourceName = resourceName || Component?.displayName
  if (internalResourceName === undefined) throw new Error('invalid internal resourceName')
  // construct a Relay entry point:
  const entryPoint: EntryPoint<TEntryPointComponent, RouteParams<ExtractDynamicSegments<Path>>> = {
    root: JSResource(internalResourceName, componentLoader, Component),
    getPreloadProps: rp => {
      return {
        queries: buildQueries(queryConfigs, rp, transformVariables, relayEnvironment),
      }
    },
  }

  // merge 2 maps of subscriptions, favoring the entries in the first map in case of key equality
  function mergeSubscriptions(
    a: Map<string, ServerPreloadedSubscription>,
    b: Map<string, ServerPreloadedSubscription> | undefined,
  ) {
    if (!b || b.size === 0) {
      return a
    }

    const mergedSubscriptions = new Map<string, ServerPreloadedSubscription>(a)

    for (const [key, value] of b) {
      if (!mergedSubscriptions.has(key)) {
        mergedSubscriptions.set(key, value)
      }
    }

    return mergedSubscriptions
  }

  function loadSync({
    pathParams,
    searchParams,
    embeddedData,
  }: LoadSyncType): LoaderResultLoaded<RelayPayloadType<TEntryPointComponent>> {
    // parse the preloaded queries from the embebed data use the embedded data
    const ssrPreloadedQueries = new Map<string, Map<string, GraphQLResult>>()
    if (embeddedData?.payload?.preloadedQueries) {
      for (const {queryId, variables, result, timestamp} of embeddedData.payload.preloadedQueries) {
        let queryRecord = ssrPreloadedQueries.get(queryId)
        if (!queryRecord) {
          queryRecord = new Map<string, GraphQLResult>()
        }
        const key = JSON.stringify(variables)
        result.timestamp = timestamp
        queryRecord.set(key, result)
        ssrPreloadedQueries.set(queryId, queryRecord)
      }
    }
    const preloadedSubscriptions = new Map<string, ServerPreloadedSubscription>()
    if (embeddedData?.payload?.preloadedSubscriptions) {
      for (const [queryId, results] of Object.entries(embeddedData.payload.preloadedSubscriptions)) {
        const subscriptionResults = new Map<string, GraphQLSubscriptionResult>()
        for (const [args, result] of Object.entries(results)) {
          subscriptionResults.set(args, result)
        }
        preloadedSubscriptions.set(queryId, subscriptionResults)
      }
    }

    if (embeddedData?.payload?.preloaded_records) {
      relayEnvironment.getStore().publish(new RecordSource(embeddedData?.payload?.preloaded_records))
    }

    const {baseUrl, getPreloadedSubscriptions} = relayEnvironment.options as {
      baseUrl: string | undefined
      getPreloadedSubscriptions: () => Map<string, ServerPreloadedSubscription> | undefined
    }
    const loadedSubscriptions = getPreloadedSubscriptions ? getPreloadedSubscriptions() : undefined
    const newNetwork = new SSRNetwork(
      ssrPreloadedQueries,
      embeddedData?.enabled_features,
      mergeSubscriptions(preloadedSubscriptions, loadedSubscriptions),
      baseUrl,
      maxAge,
      errorCallbacks,
    )
    // @ts-expect-error `__setNet` is not exposed in types
    relayEnvironment.__setNet(newNetwork)

    relayEnvironment.options = {
      baseUrl,
      getPreloadedSubscriptions: () => newNetwork.getPreloadedSubscriptions(),
    }

    const entryPointReference = loadEntryPoint(
      {
        getEnvironment: () => {
          return relayEnvironment
        },
      },
      entryPoint,
      {pathParams, searchParams},
    )

    return {
      // NOTE: it could make sense to replace this with a "loading" result if we add support for those — but if we do
      // that, we'll need to figure out how to determine that the entrypoint has loaded and update the state. Without
      // updating the state, the framework wouldn't know when to remove the loading bar, update the title, and set the
      // focus state.
      type: 'loaded',
      data: {entryPointReference},
      title,
    }
  }

  async function coreLoader({pathParams, location}: {pathParams: Params<string>; location: Location}) {
    return Promise.resolve(
      loadSync({
        pathParams,
        searchParams: new URLSearchParams(location.search),
      }),
    )
  }

  function loadFromEmbeddedData({
    pathParams,
    embeddedData,
    location,
  }: {
    pathParams: Params<string>
    embeddedData: unknown
    location: Location
  }) {
    const castedEmbeddedData = embeddedData as EmbeddedDataType
    const {data} = loadSync({
      pathParams,
      embeddedData: castedEmbeddedData,
      searchParams: new URLSearchParams(location.search),
    })
    return {data, title}
  }

  const Wrapper: React.FC = () => {
    const state = useCurrentRouteState<{type: 'loaded'; data: RelayPayloadType<TEntryPointComponent>}>()
    const entryPointReference = state?.data?.entryPointReference

    if (!entryPointReference) {
      return null
    }

    return (
      <RelayEnvironmentProvider environment={relayEnvironment}>
        <Suspense fallback={fallback}>
          <EntryPointContainer entryPointReference={entryPointReference} props={runtimeProps} />
        </Suspense>
      </RelayEnvironmentProvider>
    )
  }

  return {
    path,
    Component: Wrapper,
    coreLoader,
    loadFromEmbeddedData,
    transitionType: TransitionType.FETCH_THEN_TRANSITION,
  }
}
