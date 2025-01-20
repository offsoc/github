import {mockFetch} from '@github-ui/mock-fetch'
import {renderHook, waitFor} from '@testing-library/react'

import {JSON_HEADER} from '../../../../common/utils/fetch-json'
import {getProviderWrappers} from '../../../test-utils/test-helpers'
import {useAlertCountsQuery} from '../use-alert-counts-query'

describe('useAlertCountsQuery', () => {
  const BASE_ROUTE = new RegExp('/orgs/github/security/alerts/counts')

  it('fetches data', async () => {
    const mockResponse = {open: 123, closed: 456}
    const mock = mockFetch.mockRoute(BASE_ROUTE, mockResponse, {headers: new Headers(JSON_HEADER)})

    const {result} = renderHook(() => useAlertCountsQuery({query: 'hello world'}), {wrapper: getProviderWrappers})

    expect(mock).toHaveBeenCalled()
    expect(mock).toHaveBeenCalledWith('/orgs/github/security/alerts/counts?query=hello+world', expect.anything())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockResponse)
  })

  it('omits empty query parameters', async () => {
    const mockResponse = {open: 123, closed: 456}
    const mock = mockFetch.mockRoute(BASE_ROUTE, mockResponse, {headers: new Headers(JSON_HEADER)})

    const {result} = renderHook(() => useAlertCountsQuery({}), {wrapper: getProviderWrappers})

    expect(mock).toHaveBeenCalled()
    expect(mock).toHaveBeenCalledWith('/orgs/github/security/alerts/counts?', expect.anything())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('returns error state if request fails', async () => {
    const mock = mockFetch.mockRoute(BASE_ROUTE, undefined, {status: 500})

    const {result} = renderHook(() => useAlertCountsQuery({}), {wrapper: getProviderWrappers})

    expect(mock).toHaveBeenCalled()
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.data).toBeUndefined()
  })
})
