import {mockFetch} from '@github-ui/mock-fetch'
import {waitFor} from '@testing-library/react'

import {JSON_HEADER} from '../../../../common/utils/fetch-json'
import {renderHook} from '../../../../test-utils/render-hook'
import useRepositoriesQuery from '../use-repositories-query'

describe('useRepositoriesQuery', () => {
  const BASE_ROUTE = '/orgs/github/security/metrics/codeql/repositories'
  const BASE_ROUTE_REGEX = new RegExp(BASE_ROUTE)

  const MOCK_RESPONSE = {
    items: [
      {
        id: 'github/foo',
        displayName: 'foo',
        href: `http://localhost/github/foo`,
        countUnresolved: Math.floor(Math.random() * 100),
        countDismissed: Math.floor(Math.random() * 100),
        countFixedWithoutAutofix: Math.floor(Math.random() * 100),
        countFixedWithAutofix: Math.floor(Math.random() * 100),
      },
      {
        id: 'github/bar',
        displayName: 'bar',
        href: `http://localhost/github/bar`,
        countUnresolved: Math.floor(Math.random() * 100),
        countDismissed: Math.floor(Math.random() * 100),
        countFixedWithoutAutofix: Math.floor(Math.random() * 100),
        countFixedWithAutofix: Math.floor(Math.random() * 100),
      },
    ],
    previous: null,
    next: 'some-opaque-value',
  }

  it('fetches data', async () => {
    const mock = mockFetch.mockRoute(BASE_ROUTE_REGEX, MOCK_RESPONSE, {headers: new Headers(JSON_HEADER)})

    const {result} = renderHook(() =>
      useRepositoriesQuery({
        query: 'foobar',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        cursor: 'some-opaque-value',
        sort: {
          field: 'countUnresolved',
          direction: 'desc',
        },
      }),
    )

    expect(mock).toHaveBeenCalled()
    expect(mock).toHaveBeenCalledWith(
      `${BASE_ROUTE}?query=foobar&startDate=2024-01-01&endDate=2024-12-31&cursor=some-opaque-value&sortField=countUnresolved&sortDirection=desc`,
      expect.anything(),
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(MOCK_RESPONSE)
  })

  it('omits empty query parameters', async () => {
    const mock = mockFetch.mockRoute(BASE_ROUTE_REGEX, MOCK_RESPONSE, {headers: new Headers(JSON_HEADER)})

    const {result} = renderHook(() =>
      useRepositoriesQuery({
        query: 'foobar',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      }),
    )

    expect(mock).toHaveBeenCalled()
    expect(mock).toHaveBeenCalledWith(
      `${BASE_ROUTE}?query=foobar&startDate=2024-01-01&endDate=2024-12-31`,
      expect.anything(),
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('returns error state if request fails', async () => {
    const mock = mockFetch.mockRoute(BASE_ROUTE_REGEX, undefined, {status: 500})

    const {result} = renderHook(() =>
      useRepositoriesQuery({
        query: 'foobar',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      }),
    )

    expect(mock).toHaveBeenCalled()
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.data).toBeUndefined()
  })
})
