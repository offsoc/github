import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {renderHook} from '@testing-library/react'

import usePullRequestPageAppPayload from '../use-pull-request-page-app-payload'

const providedHelpUrl = 'https://my-cool-docs.com'
jest.mock('@github-ui/react-core/use-app-payload')
const mockedUseRoutePayload = jest.mocked(useAppPayload)

describe('usePullRequestPageAppPayload', () => {
  test('returns all the data from the app payload', () => {
    mockedUseRoutePayload.mockReturnValue({
      tracing: true,
      tracing_flamegraph: false,
      refListCacheKey: 'cache-key',
      helpUrl: providedHelpUrl,
    })
    const {result} = renderHook(() => usePullRequestPageAppPayload())
    const {tracing, tracing_flamegraph, refListCacheKey, helpUrl} = result.current

    expect(tracing).toBe(true)
    expect(tracing_flamegraph).toBe(false)
    expect(refListCacheKey).toEqual('cache-key')
    expect(helpUrl).toEqual(providedHelpUrl)
  })

  test('returns the default docs url if the help url is not present', () => {
    mockedUseRoutePayload.mockReturnValue({
      tracing: true,
      tracing_flamegraph: false,
      refListCacheKey: 'cache-key',
    })
    const {result} = renderHook(() => usePullRequestPageAppPayload())
    const {tracing, tracing_flamegraph, refListCacheKey, helpUrl} = result.current

    expect(tracing).toBe(true)
    expect(tracing_flamegraph).toBe(false)
    expect(refListCacheKey).toEqual('cache-key')
    expect(helpUrl).toEqual('https://docs.github.com')
  })
})
