import {mockFetch} from '@github-ui/mock-fetch'
import {waitFor} from '@testing-library/react'

import {JSON_HEADER} from '../../../../common/utils/fetch-json'
import {renderHook} from '../../../../test-utils/render-hook'
import {useAlertTrendsQuery} from '../use-alert-trends-query'

describe('useAlertTrendsQuery', () => {
  const BASE_ROUTE = '/orgs/github/security/metrics/codeql/alert-trends-by'
  const BASE_ROUTE_BY_STATUS = new RegExp('/orgs/github/security/metrics/codeql/alert-trends-by-status')
  const BASE_ROUTE_BY_SEVERITY = new RegExp('/orgs/github/security/metrics/codeql/alert-trends-by-severity')

  const MOCK_RESPONSE = [
    {
      label: 'Critical',
      data: [
        {x: '2024-06-25', y: 100},
        {x: '2024-06-25', y: 200},
      ],
    },
    {
      label: 'High',
      data: [
        {x: '2024-06-25', y: 300},
        {x: '2024-06-25', y: 400},
      ],
    },
  ]

  it('fetches data grouped by status', async () => {
    const mock = mockFetch.mockRoute(BASE_ROUTE_BY_STATUS, MOCK_RESPONSE, {headers: new Headers(JSON_HEADER)})

    const {result} = renderHook(() =>
      useAlertTrendsQuery({
        groupKey: 'status',
        query: 'foobar',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      }),
    )

    expect(mock).toHaveBeenCalled()
    expect(mock).toHaveBeenCalledWith(
      `${BASE_ROUTE}-status?query=foobar&startDate=2024-01-01&endDate=2024-12-31`,
      expect.anything(),
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(MOCK_RESPONSE)
  })

  it('fetches data grouped by severity', async () => {
    const mock = mockFetch.mockRoute(BASE_ROUTE_BY_SEVERITY, MOCK_RESPONSE, {headers: new Headers(JSON_HEADER)})

    const {result} = renderHook(() =>
      useAlertTrendsQuery({
        groupKey: 'severity',
        query: 'foobar',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      }),
    )

    expect(mock).toHaveBeenCalled()
    expect(mock).toHaveBeenCalledWith(
      `${BASE_ROUTE}-severity?query=foobar&startDate=2024-01-01&endDate=2024-12-31`,
      expect.anything(),
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(MOCK_RESPONSE)
  })

  it('returns error state if request fails', async () => {
    const mock = mockFetch.mockRoute(BASE_ROUTE_BY_STATUS, undefined, {status: 500})

    const {result} = renderHook(() =>
      useAlertTrendsQuery({
        groupKey: 'status',
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
