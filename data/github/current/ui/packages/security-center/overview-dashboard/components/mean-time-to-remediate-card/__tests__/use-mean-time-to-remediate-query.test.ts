import {mockFetch} from '@github-ui/mock-fetch'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import type {UseQueryResult} from '@tanstack/react-query'

import {JSON_HEADER} from '../../../../common/utils/fetch-json'
import {renderHook} from '../../../../test-utils/render-hook'
import {
  getTrend,
  type MeanTimeToRemediateResult,
  resultsReducer,
  useMeanTimeToRemediateQuery,
} from '../use-mean-time-to-remediate-query'

afterEach(() => {
  jest.clearAllMocks()
})

jest.mock('@github-ui/react-core/use-feature-flag')
function mockUseFeatureFlag(flag: string, value: boolean): void {
  ;(useFeatureFlag as jest.Mock).mockImplementation(flagName => flagName === flag && value)
}

const BASE_ROUTE = '/orgs/github/security/overview/mean-time-to-remediate'
const BASE_ROUTE_REGEX = new RegExp(BASE_ROUTE)

const MOCK_RESPONSE = {
  isSuccess: true,
  data: {
    count: 500,
    value: 0,
    alertCount: 0,
  },
}

const startDate = '2024-01-01'
const endDate = '2024-12-31'
const query = 'foobar'

describe('useMeanTimeToRemediateQuery', () => {
  it('performs a single fetch when no feature flags are enabled', async () => {
    const mock = mockFetch.mockRoute(BASE_ROUTE_REGEX, MOCK_RESPONSE, {
      headers: new Headers(JSON_HEADER),
    })

    renderHook(() => useMeanTimeToRemediateQuery({query, startDate, endDate}))

    expect(mock).toHaveBeenCalledTimes(1)
    expect(mock).toHaveBeenCalledWith(
      `${BASE_ROUTE}?startDate=2024-01-01&endDate=2024-12-31&query=foobar`,
      expect.anything(),
    )
  })

  it('fetches data for each tool when feature flag is enabled', async () => {
    mockUseFeatureFlag('security_center_dashboards_cards_parallel_queries_per_tool', true)

    const mock = mockFetch.mockRoute(BASE_ROUTE_REGEX, MOCK_RESPONSE, {
      headers: new Headers(JSON_HEADER),
    })

    renderHook(() => useMeanTimeToRemediateQuery({query, startDate, endDate}))

    expect(mock).toHaveBeenCalledTimes(3)
    expect(mock).toHaveBeenCalledWith(
      `${BASE_ROUTE}?startDate=2024-01-01&endDate=2024-12-31&query=foobar+tool%3Asecret-scanning`,
      expect.anything(),
    )
    expect(mock).toHaveBeenCalledWith(
      `${BASE_ROUTE}?startDate=2024-01-01&endDate=2024-12-31&query=foobar+tool%3Asecret-scanning`,
      expect.anything(),
    )
    expect(mock).toHaveBeenCalledWith(
      `${BASE_ROUTE}?startDate=2024-01-01&endDate=2024-12-31&query=foobar+tool%3Asecret-scanning`,
      expect.anything(),
    )
  })

  it('fetches data for each tool with 4 slices when feature flag is enabled', async () => {
    mockUseFeatureFlag('security_center_dashboards_parallel_queries_by_4_slices', true)

    const mock = mockFetch.mockRoute(BASE_ROUTE_REGEX, MOCK_RESPONSE, {
      headers: new Headers(JSON_HEADER),
    })

    renderHook(() => useMeanTimeToRemediateQuery({query, startDate, endDate}))

    // 3 tools * 4 slices = 12 fetches
    expect(mock).toHaveBeenCalledTimes(12)
  })
})

describe('resultsReducer', () => {
  it('returns the correct data from a single fetch', () => {
    const mockResult = [MOCK_RESPONSE] as Array<UseQueryResult<MeanTimeToRemediateResult>>
    const data = resultsReducer(mockResult)

    expect(data).toEqual({
      count: 500,
      isSuccess: true,
      isPending: false,
      isError: false,
    })
  })

  it('returns the correct data from parallel queries', () => {
    const mockFetchResult = {
      isSuccess: true,
      data: {
        value: 2,
        alertCount: 1,
      },
    }
    const mockResult = new Array(3).fill(mockFetchResult) as Array<UseQueryResult<MeanTimeToRemediateResult>>
    const data = resultsReducer(mockResult)

    expect(data).toEqual({
      count: 2,
      isSuccess: true,
      isPending: false,
      isError: false,
    })
  })
})

describe('getTrend', () => {
  it('returns calculated trend when both periods are successful', () => {
    const currentPeriodData = {
      count: 1,
      isSuccess: true,
      isPending: false,
      isError: false,
    }
    const previousPeriodData = {
      count: 2,
      isSuccess: true,
      isPending: false,
      isError: false,
    }

    const trend = getTrend(currentPeriodData, previousPeriodData)
    expect(trend).toEqual(-50)
  })

  it('returns 0 when one of the periods is not successful', () => {
    const currentPeriodData = {
      count: 1,
      isSuccess: false,
      isPending: false,
      isError: false,
    }
    const previousPeriodData = {
      count: 2,
      isSuccess: true,
      isPending: false,
      isError: false,
    }

    const trend = getTrend(currentPeriodData, previousPeriodData)
    expect(trend).toEqual(0)
  })
})
