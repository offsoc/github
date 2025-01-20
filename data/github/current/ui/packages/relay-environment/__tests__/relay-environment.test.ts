import type {RequestParameters, Variables} from 'relay-runtime'
import {fetchRelayInternal, type FeatureFlagMap} from '../relay-environment'

jest.mock('@github-ui/ssr-utils', () => ({
  ...jest.requireActual('@github-ui/ssr-utils'),
  wasServerRendered: jest.fn().mockReturnValue(true),
}))

const getDefaultParams = (): RequestParameters => ({
  name: 'TestQuery',
  text: 'query TestQuery {}',
  id: null,
  cacheID: '',
  operationKind: 'query',
  metadata: {
    isRelayRouteRequest: true,
  },
  providedVariables: {},
})

describe('fetchRelayInternal', () => {
  beforeEach(() => {
    process.env.APP_ENV = 'test'
  })

  it('should throw an error if params.id is not defined', () => {
    const params = getDefaultParams()
    const variables: Variables = {}
    const ssrPreloadedQueries = new Map()
    const enabledFeatures: FeatureFlagMap = {}
    const next = jest.fn()
    const complete = jest.fn()
    const observer = {next, complete, error: jest.fn(), closed: false}
    expect(() => fetchRelayInternal({params, variables, ssrPreloadedQueries, enabledFeatures, observer})).toThrow(
      'params has no id property!',
    )
  })

  it('should return a preloaded query result if available', () => {
    const params = {...getDefaultParams(), id: 'TestQuery'} as RequestParameters

    const variables: Variables = {}
    const ssrPreloadedQueries = new Map()
    const result = {data: {test: true}}
    const enabledFeatures: FeatureFlagMap = {}

    ssrPreloadedQueries.set('TestQuery', new Map().set('{}', result))
    const next = jest.fn()
    const complete = jest.fn()
    const observer = {next, complete, error: jest.fn(), closed: false}

    fetchRelayInternal({params, variables, ssrPreloadedQueries, enabledFeatures, observer})
    expect(next).toHaveBeenCalledWith(result)
    expect(complete).toHaveBeenCalled()
  })

  it('should log a warning if no preloaded queries are found', () => {
    const params = {...getDefaultParams(), id: 'TestQuery'} as RequestParameters
    const variables: Variables = {}
    const ssrPreloadedQueries = new Map()
    const enabledFeatures: FeatureFlagMap = {}

    const emitWarning = jest.fn()
    const next = jest.fn()
    const complete = jest.fn()
    const observer = {next, complete, error: jest.fn(), closed: false}

    fetchRelayInternal({params, variables, ssrPreloadedQueries, emitWarning, enabledFeatures, observer})

    expect(emitWarning).toHaveBeenCalledWith(
      'Relay SSR Error: There where no preloaded queries found. \n' +
        'More context can be found here: https://thehub.github.com/support/ecosystem/api-graphql/training/graphql-relay/#ssr-error-1',
    )
  })

  it('should log a warning if no preloaded queries are found for a specific query', () => {
    const params = {...getDefaultParams(), id: 'TestQuery'} as RequestParameters
    const variables: Variables = {}
    const ssrPreloadedQueries = new Map()
    const enabledFeatures: FeatureFlagMap = {}

    const emitWarning = jest.fn()

    ssrPreloadedQueries.set('OtherQuery', new Map())
    const next = jest.fn()
    const complete = jest.fn()
    const observer = {next, complete, error: jest.fn(), closed: false}

    fetchRelayInternal({params, variables, ssrPreloadedQueries, emitWarning, enabledFeatures, observer})

    expect(emitWarning).toHaveBeenCalledWith(
      `Relay SSR Error: There where no preloaded queries found for TestQuery \n` +
        'More context can be found here: https://thehub.github.com/support/ecosystem/api-graphql/training/graphql-relay/#ssr-error-2',
    )
  })

  it('should log a warning if no preloaded queries are found for a specific query and variables', () => {
    const params = {...getDefaultParams(), id: 'TestQuery'} as RequestParameters
    const variables: Variables = {test: true}
    const ssrPreloadedQueries = new Map()
    const enabledFeatures: FeatureFlagMap = {}

    const emitWarning = jest.fn()

    ssrPreloadedQueries.set('TestQuery', new Map())
    const next = jest.fn()
    const complete = jest.fn()
    const observer = {next, complete, error: jest.fn(), closed: false}

    fetchRelayInternal({params, variables, ssrPreloadedQueries, emitWarning, enabledFeatures, observer})

    expect(emitWarning).toHaveBeenCalledWith(
      `Relay SSR Error: There where no preloaded queries found for TestQuery with variables {"test":true} \n` +
        `The persisted query (TestQuery) contains preloaded queries for the following set of variables: \n` +
        ` \n` +
        'More context can be found here: https://thehub.github.com/support/ecosystem/api-graphql/training/graphql-relay/#ssr-error-3',
    )
  })
})
