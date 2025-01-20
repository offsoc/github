import {cloneElement, useEffect} from 'react'
import type {MockResolvers} from 'relay-test-utils/lib/RelayMockPayloadGenerator'
import type {RelayMockEnvironment} from 'relay-test-utils/lib/RelayModernMockEnvironment'
import {MockPayloadGenerator} from 'relay-test-utils'
import {
  useQueryLoader,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
  type GraphQLTaggedNode,
  type PreloadedQuery,
} from 'react-relay'
import type {OperationType, VariablesOf} from 'relay-runtime'
import {createRelayMockEnvironment, type EnvironmentHistory} from './RelayMockEnvironment'
import {DefaultMocks} from './mock-resolvers'

/**
 * The name of a query. Use to map a query config to resolved `QueryRefs` and `QueryData`
 *
 * Used as the key in `RelayMockProps["query"]`,
 * as well as the key in `ResolvedQueries["queryRefs"]` and `ResolvedQueries["queryData"]
 */
type QueryName = string

/**
 * Type Generic for Relay Test Utils.
 * Record of
 */
export type Queries = Record<QueryName, OperationType>

/**
 * `PreloadedQuery` references from from queries of `type: 'preloaded'`. Keyed by `queryName`.
 */
export type QueryRefs<TQueries extends Queries> = {
  [Key in keyof TQueries]: PreloadedQuery<TQueries[Key]>
}

/**
 * `<TQuery>$data` responses from queries of `type: 'fragment'`. Keyed by `queryName`.
 */
export type QueryData<TQueries extends Queries> = {
  [Key in keyof TQueries]: TQueries[Key]['response']
}

/**
 * Resolved queries produced by query mocks defined in `relay.queries[queryName]`.
 */
export type ResolvedQueries<TQueries extends Queries> = {
  /**
   * Propagates `PreloadedQuery` references from queries of `type: 'preloaded'`
   */
  queryRefs: QueryRefs<TQueries>
  /**
   * Propagates `<TQuery>$data` responses from queries of `type: 'fragment'`
   */
  queryData: QueryData<TQueries>
}

export type TestComponentProps<TQueries extends Queries> = ResolvedQueries<TQueries> & {
  /**
   * Provides access to the relay mock environment used internally by these test utils so you can pass it down
   * to your components in cases where the `RelayEnvironmentProvider` is not directly wrapping your component.
   */
  relayMockEnvironment: RelayMockEnvironment
  /**
   * Provides access to the relay mock history that corresponds to the `relayMockEnvironment` and records operations
   * on the environment. Note this may be undefined if you pass an `environment` but not a `history`.
   */
  relayMockHistory?: EnvironmentHistory
}
/**
 * Type of query to mock.
 * Depending on the query type, the ref/data will be available on different places:
 * `preloaded` - Propagated to the `queryRefs` argument
 * `fragment` - Propagated to the `queryData` argument
 * `lazy` - Won't be passed as the usage of this data is independent
 */
export type QueryType = 'preloaded' | 'fragment' | 'lazy'

/**
 * Query config for a mocked `preloaded` or ``fragment` query
 */
export type QueryOptions<TOperation extends OperationType> = {
  /**
   * The query to mock
   */
  query: GraphQLTaggedNode
  /**
   * Variables used by the mock query
   */
  variables: VariablesOf<TOperation>
  /**
   * Type of query to mock.
   * Depending on the query type, the ref/data will be available on different places:
   * - `preloaded` - Propagated to the `queryRefs` argument
   * - `fragment` - Propagated to the `queryData` argument
   * - `lazy` - Won't be passed as the usage of this data is independent
   */
  type: Exclude<QueryType, 'lazy'>
}

/**
 * Query config for mocked `lazy` query
 */
export type LazyQueryOptions = {
  /**
   * Type of query to mock.
   * Depending on the query type, the ref/data will be available on different places:
   * - `preloaded` - Propagated to the `queryRefs` argument
   * - `fragment` - Propagated to the `queryData` argument
   * - `lazy` - Won't be passed as the usage of this data is independent
   */
  type: Extract<QueryType, 'lazy'>
}

export type RelayMockProps<TQueries extends Queries> = {
  /**
   * By default an `environment` will be created internally. If you need to reference the `environment` in your tests
   * you can pass one in.
   *
   * This is useful if you want to inspect the operations on the `environment`, or if you want to
   * resolve queries that are run after render (for example in response to user interaction.)
   */
  environment?: RelayMockEnvironment
  /**
   * By default a `history` will be created internally. If you passed in an `environment` you may also want to pass
   * in a corresponding `history`.
   */
  history?: EnvironmentHistory
  /**
   * Query configs for mocked queries. Keyed by `queryName`
   */
  queries: {
    [Key in keyof TQueries]: QueryOptions<TQueries[Key]> | LazyQueryOptions
  }
  /**
   * Use `mockResolves` to mock the data for your query.
   * @see https://relay.dev/docs/guides/testing-relay-components/#mock-payload-generator-and-the-relay_test_operation-directive
   */
  mockResolvers?: MockResolvers
}

interface LoaderProps<TQueries extends Queries> {
  children: JSX.Element
  query: GraphQLTaggedNode
  queryRefs?: QueryRefs<TQueries> | Record<string, never>
  queryData?: QueryData<TQueries> | Record<string, never>
  queryName: string
  variables: VariablesOf<TQueries[string]>
}

export function relayTestFactory<TQueries extends Queries>({
  environment,
  history,
  queries,
  mockResolvers,
}: RelayMockProps<TQueries>) {
  if (!environment) {
    if (history) throw new Error('Cannot pass `history` without also passing an `environment`')
    const {environment: relayMockEnvironment, history: relayMockHistory} = createRelayMockEnvironment()
    environment = relayMockEnvironment
    history = relayMockHistory
  }
  const decorator = (Component: React.ComponentType<TestComponentProps<TQueries>>) => {
    // @ts-expect-error On first render `queryRefs` and `queryData` props are missing: they will get set correctly via `LoaderComponent`
    let components = <Component relayMockEnvironment={environment} relayMockHistory={history} />

    for (const [queryName, queryOptions] of Object.entries<(typeof queries)[string]>(queries)) {
      const {type} = queryOptions

      environment.mock.queueOperationResolver(operation => {
        return MockPayloadGenerator.generate(operation, {...DefaultMocks, ...mockResolvers})
      })

      if (type === 'lazy') continue

      const {query, variables} = queryOptions

      environment.mock.queuePendingOperation(query, variables)

      let LoaderComponent: typeof QueryLoader | typeof LazyQueryLoader
      switch (type) {
        case 'preloaded': {
          LoaderComponent = QueryLoader
          break
        }
        case 'fragment': {
          LoaderComponent = LazyQueryLoader
          break
        }
      }
      // nest a `LoaderComponent` for each query with `Component` as the leaf child
      components = (
        <LoaderComponent queryName={queryName} query={query} variables={variables}>
          {components}
        </LoaderComponent>
      )
    }

    return <RelayEnvironmentProvider environment={environment}>{components}</RelayEnvironmentProvider>
  }

  return {
    decorator,
    relayMockEnvironment: environment,
    relayMockHistory: history,
  }
}

function LazyQueryLoader<TQueries extends Queries>({
  children,
  queryData = {},
  query,
  queryName,
  variables,
}: LoaderProps<TQueries>) {
  const response = useLazyLoadQuery<TQueries[string]>(query, variables)
  // @ts-expect-error TODO: how do I fix this? need a type-safe way to build this queryRefs
  queryData[queryName] = response
  return <>{cloneElement(children, {queryData})}</>
}

function QueryLoader<TQueries extends Queries>({
  children,
  queryRefs = {},
  query,
  queryName,
  variables,
}: LoaderProps<TQueries>) {
  const [queryRef, loadQuery, dispose] = useQueryLoader(query)
  // @ts-expect-error TODO: how do I fix this? need a type-safe way to build this queryRefs
  queryRefs[queryName] = queryRef
  useEffect(() => {
    loadQuery(variables)
    return () => dispose()
  }, [loadQuery, dispose, variables])
  return queryRef === null ? null : <>{cloneElement(children, {queryRefs})}</>
}
