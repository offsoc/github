import {mockFetch} from '@github-ui/mock-fetch'
import {waitFor} from '@testing-library/react'

import {JSON_HEADER} from '../../../../common/utils/fetch-json'
import {renderHook} from '../../../../test-utils/render-hook'
import useMostPrevalentRulesQuery from '../use-most-prevalent-rules-query'

describe('useMostPrevalentRulesQuery', () => {
  const BASE_ROUTE = '/orgs/github/security/metrics/codeql/most-prevalent-rules'
  const BASE_ROUTE_REGEX = new RegExp(BASE_ROUTE)

  const MOCK_RESPONSE = {
    items: [
      {
        ruleName: 'cross-site scripting',
        ruleSarifIdentifier: 'java/xss',
        count: 20,
      },
      {
        ruleName: 'Information exposure through a stack trace',
        ruleSarifIdentifier: 'java/stack-trace-exposure',
        count: 20,
      },
      {
        ruleName: 'Database query built from user-controlled sources',
        ruleSarifIdentifier: 'js/sql-injection',
        count: 20,
      },
      {
        ruleName: 'Log injection',
        ruleSarifIdentifier: 'js/log-injection',
        count: 20,
      },
      {
        ruleName: 'Use of a broken or risky cryptographic algorithm',
        ruleSarifIdentifier: 'java/weak-cryptographic-algorithm',
        count: 20,
      },
    ],
    previous: null,
    next: 'some-opaque-value',
  }

  it('fetches data', async () => {
    const mock = mockFetch.mockRoute(BASE_ROUTE_REGEX, MOCK_RESPONSE, {headers: new Headers(JSON_HEADER)})

    const {result} = renderHook(() =>
      useMostPrevalentRulesQuery({
        query: 'foobar',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        cursor: 'some-opaque-value',
        pageSize: 42,
      }),
    )

    expect(mock).toHaveBeenCalled()
    expect(mock).toHaveBeenCalledWith(
      `${BASE_ROUTE}?query=foobar&startDate=2024-01-01&endDate=2024-12-31&cursor=some-opaque-value&pageSize=42`,
      expect.anything(),
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(MOCK_RESPONSE)
  })

  it('omits empty query parameters', async () => {
    const mock = mockFetch.mockRoute(BASE_ROUTE_REGEX, MOCK_RESPONSE, {headers: new Headers(JSON_HEADER)})

    const {result} = renderHook(() =>
      useMostPrevalentRulesQuery({
        query: 'foobar',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        pageSize: 42,
      }),
    )

    expect(mock).toHaveBeenCalled()
    expect(mock).toHaveBeenCalledWith(
      `${BASE_ROUTE}?query=foobar&startDate=2024-01-01&endDate=2024-12-31&pageSize=42`,
      expect.anything(),
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('returns error state if request fails', async () => {
    const mock = mockFetch.mockRoute(BASE_ROUTE_REGEX, undefined, {status: 500})

    const {result} = renderHook(() =>
      useMostPrevalentRulesQuery({
        query: 'foobar',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        pageSize: 42,
      }),
    )

    expect(mock).toHaveBeenCalled()
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.data).toBeUndefined()
  })
})
