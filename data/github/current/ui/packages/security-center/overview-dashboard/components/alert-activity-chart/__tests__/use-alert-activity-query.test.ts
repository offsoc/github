import {mockFetch} from '@github-ui/mock-fetch'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {waitFor} from '@testing-library/react'

import {JSON_HEADER} from '../../../../common/utils/fetch-json'
import {renderHook} from '../../../../test-utils/render-hook'
import {useAlertActivityQuery} from '../../alert-activity-chart/use-alert-activity-query'

jest.mock('@github-ui/react-core/use-feature-flag')
function mockUseFeatureFlag(flag: string, value: boolean): void {
  ;(useFeatureFlag as jest.Mock).mockImplementation(flagName => flagName === flag && value)
}

// This mock represents the data returned from a _single_ fetch within the useQueries() hook.
const MOCK_RESPONSE = {
  isSuccess: true,
  data: {
    data: [
      {
        opened: 10,
        closed: 4,
        date: 'Oct 1',
        endDate: 'Oct 31',
      },
      {
        opened: 5,
        closed: 2,
        date: 'Nov 1',
        endDate: 'Nov 30',
      },
    ],
  },
}

const BASE_ROUTE = '/orgs/github/security/overview/alert-activity'
const BASE_ROUTE_REGEX = new RegExp(BASE_ROUTE)

describe('useAlertActivityQuery', () => {
  it('fetches data for each tool', async () => {
    mockUseFeatureFlag('security_center_dashboards_parallel_queries_by_4_slices', false)
    const mock = mockFetch.mockRoute(BASE_ROUTE_REGEX, MOCK_RESPONSE, {
      headers: new Headers(JSON_HEADER),
    })

    const {result} = renderHook(() =>
      useAlertActivityQuery({
        query: 'foobar',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      }),
    )

    expect(mock).toHaveBeenCalledTimes(3)
    expect(mock).toHaveBeenCalledWith(
      `${BASE_ROUTE}?startDate=2024-01-01&endDate=2024-12-31&query=foobar+tool%3Asecret-scanning`,
      expect.anything(),
    )
    expect(mock).toHaveBeenCalledWith(
      `${BASE_ROUTE}?startDate=2024-01-01&endDate=2024-12-31&query=foobar+tool%3Adependabot`,
      expect.anything(),
    )
    expect(mock).toHaveBeenCalledWith(
      `${BASE_ROUTE}?startDate=2024-01-01&endDate=2024-12-31&query=foobar+tool%3Acodeql%2Cthird-party`,
      expect.anything(),
    )

    await waitFor(() => expect(result.current.every(data => data.isSuccess)).toBe(true))
    expect(result.current.length).toBe(3)
    expect(result.current[0]?.data).toEqual(MOCK_RESPONSE)
    expect(result.current[1]?.data).toEqual(MOCK_RESPONSE)
    expect(result.current[2]?.data).toEqual(MOCK_RESPONSE)
  })

  it('fetches data for each tool with 4 slices when feature flag is enabled', async () => {
    mockUseFeatureFlag('security_center_dashboards_parallel_queries_by_4_slices', true)

    const mock = mockFetch.mockRoute(BASE_ROUTE_REGEX, MOCK_RESPONSE, {
      headers: new Headers(JSON_HEADER),
    })

    const {result} = renderHook(() =>
      useAlertActivityQuery({
        query: 'foobar',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      }),
    )

    // 3 tools * 4 slices = 12 fetches
    expect(mock).toHaveBeenCalledTimes(12)
    await waitFor(() => expect(result.current.every(data => data.isSuccess)).toBe(true))
    expect(result.current.length).toBe(12)
    expect(result.current[0]?.data).toEqual(MOCK_RESPONSE)
    expect(result.current[1]?.data).toEqual(MOCK_RESPONSE)
    expect(result.current[2]?.data).toEqual(MOCK_RESPONSE)
    expect(result.current[3]?.data).toEqual(MOCK_RESPONSE)
    expect(result.current[4]?.data).toEqual(MOCK_RESPONSE)
    expect(result.current[5]?.data).toEqual(MOCK_RESPONSE)
    expect(result.current[6]?.data).toEqual(MOCK_RESPONSE)
    expect(result.current[7]?.data).toEqual(MOCK_RESPONSE)
    expect(result.current[8]?.data).toEqual(MOCK_RESPONSE)
    expect(result.current[9]?.data).toEqual(MOCK_RESPONSE)
    expect(result.current[10]?.data).toEqual(MOCK_RESPONSE)
    expect(result.current[11]?.data).toEqual(MOCK_RESPONSE)
  })

  it('returns error state if request fails', async () => {
    mockUseFeatureFlag('security_center_dashboards_parallel_queries_by_4_slices', true)

    const mock = mockFetch.mockRoute(BASE_ROUTE_REGEX, undefined, {status: 500})

    const {result} = renderHook(() =>
      useAlertActivityQuery({
        query: 'foobar',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      }),
    )

    expect(mock).toHaveBeenCalled()
    await waitFor(() => expect(result.current.every(data => data.isError)).toBe(true))
    expect(result.current[0]?.data).toBeUndefined()
  })
})
