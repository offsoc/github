import {mockFetch} from '@github-ui/mock-fetch'
import {renderHook, waitFor} from '@testing-library/react'

import {JSON_HEADER} from '../../../../common/utils/fetch-json'
import {getProviderWrappers} from '../../../test-utils/test-helpers'
import {type AlertGroupsResult, useAlertGroupsQuery} from '../use-alert-groups-query'

describe('useAlertGroupsQuery', () => {
  const BASE_ROUTE = new RegExp('/orgs/github/security/alerts/groups')

  it('fetches data', async () => {
    const mockResponse: AlertGroupsResult = {
      alertGroups: [
        {
          key: 'team-a',
          name: 'Point of sale team',
          countCritical: 4,
          countHigh: 3,
          countMedium: 2,
          countLow: 1,
          total: 12,
        },
        {key: 'team-b', name: 'Delivery team', countCritical: 4, countHigh: 3, countMedium: 2, countLow: 1, total: 12},
        {key: 'team-c', name: 'Warehouse team', countCritical: 4, countHigh: 3, countMedium: 2, countLow: 1, total: 12},
        {key: 'team-d', name: 'Rewards team', countCritical: 4, countHigh: 3, countMedium: 2, countLow: 1, total: 12},
        {key: 'team-e', name: 'Reports team', countCritical: 4, countHigh: 3, countMedium: 2, countLow: 1, total: 12},
      ],
      previous: undefined,
      next: 'abc123',
    }
    const mock = mockFetch.mockRoute(BASE_ROUTE, mockResponse, {headers: new Headers(JSON_HEADER)})

    const {result} = renderHook(() => useAlertGroupsQuery({groupKey: 'repo', query: 'hello world', cursor: '50'}), {
      wrapper: getProviderWrappers,
    })

    expect(mock).toHaveBeenCalled()
    expect(mock).toHaveBeenCalledWith(
      '/orgs/github/security/alerts/groups?groupKey=repo&query=hello+world&cursor=50',
      expect.anything(),
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockResponse)
  })

  it('omits empty query parameters', async () => {
    const mock = mockFetch.mockRoute(BASE_ROUTE, {}, {headers: new Headers(JSON_HEADER)})

    const {result} = renderHook(() => useAlertGroupsQuery({groupKey: 'repo'}), {wrapper: getProviderWrappers})

    expect(mock).toHaveBeenCalled()
    expect(mock).toHaveBeenCalledWith('/orgs/github/security/alerts/groups?groupKey=repo', expect.anything())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('returns error state if request fails', async () => {
    const mock = mockFetch.mockRoute(BASE_ROUTE, undefined, {status: 500})

    const {result} = renderHook(() => useAlertGroupsQuery({groupKey: 'repo'}), {wrapper: getProviderWrappers})

    expect(mock).toHaveBeenCalled()
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.data).toBeUndefined()
  })
})
