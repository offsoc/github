import {mockFetch} from '@github-ui/mock-fetch'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {waitFor} from '@testing-library/react'

import {JSON_HEADER} from '../../../../common/utils/fetch-json'
import {renderHook} from '../../../../test-utils/render-hook'
import {useAlertTrendsQuery} from '../use-alert-trends-query'

jest.mock('@github-ui/react-core/use-feature-flag')
function mockUseFeatureFlag(flag: string, value: boolean): void {
  ;(useFeatureFlag as jest.Mock).mockImplementation(flagName => flagName === flag && value)
}

// These mocks represent the data returned from a _single_ fetch within the useQueries() hook.
const MOCK_RESPONSE_BY_SEVERITY = {
  isSuccess: true,
  data: {
    alertTrends: {
      // eslint-disable-next-line @typescript-eslint/naming-convention, prettier/prettier
    "Low": [
        {x: '2024-01-09', y: 100},
        {x: '2024-01-10', y: 1},
      ],
      // eslint-disable-next-line @typescript-eslint/naming-convention, prettier/prettier
    "Medium": [
        {x: '2024-01-09', y: 200},
        {x: '2024-01-10', y: 2},
      ],
      // eslint-disable-next-line @typescript-eslint/naming-convention, prettier/prettier
    "High": [
        {x: '2024-01-09', y: 300},
        {x: '2024-01-10', y: 3},
      ],
      // eslint-disable-next-line @typescript-eslint/naming-convention, prettier/prettier
    "Critical": [
        {x: '2024-01-09', y: 400},
        {x: '2024-01-10', y: 4},
      ],
    },
  },
}
const MOCK_RESPONSE_BY_AGE = {
  isSuccess: true,
  alertTrends: {
    // eslint-disable-next-line prettier/prettier
    "< 30 days": [
      {x: '2024-01-09', y: 100},
      {x: '2024-01-10', y: 1},
    ],
    // eslint-disable-next-line prettier/prettier
    "31 - 59 days": [
      {x: '2024-01-09', y: 200},
      {x: '2024-01-10', y: 2},
    ],
    // eslint-disable-next-line prettier/prettier
    "60 - 89 days": [
      {x: '2024-01-09', y: 300},
      {x: '2024-01-10', y: 3},
    ],
    // eslint-disable-next-line prettier/prettier
    "90+ days": [
      {x: '2024-01-09', y: 400},
      {x: '2024-01-10', y: 4},
    ],
  },
}
const MOCK_RESPONSE_BY_TOOL = [
  {
    isSuccess: true,
    alertTrends: {
      // eslint-disable-next-line @typescript-eslint/naming-convention, prettier/prettier
    "Dependabot": [
        {x: '2024-01-09', y: 100},
        {x: '2024-01-10', y: 1},
      ],
    },
  },
  {
    isSuccess: true,
    alertTrends: {
      // eslint-disable-next-line prettier/prettier
    "Secret scanning": [
        {x: '2024-01-09', y: 100},
        {x: '2024-01-10', y: 1},
      ],
    },
  },
  {
    isSuccess: true,
    alertTrends: {
      // eslint-disable-next-line @typescript-eslint/naming-convention, prettier/prettier
    "CodeQL": [
        {x: '2024-01-09', y: 100},
        {x: '2024-01-10', y: 1},
      ],
    },
  },
]

const BASE_ROUTE_BY_SEVERITY = '/orgs/github/security/overview/alert-trends-by-severity'
const BASE_ROUTE_BY_AGE = '/orgs/github/security/overview/alert-trends-by-age'
const BASE_ROUTE_BY_TOOL = '/orgs/github/security/overview/alert-trends-by-tool'
const BASE_ROUTE_BY_SEVERITY_REGEX = new RegExp(BASE_ROUTE_BY_SEVERITY)
const BASE_ROUTE_BY_AGE_REGEX = new RegExp(BASE_ROUTE_BY_AGE)
const BASE_ROUTE_BY_TOOL_REGEX = new RegExp(BASE_ROUTE_BY_TOOL)

describe('useAlertTrendsQuery', () => {
  describe('without query slicing', () => {
    it('fetches data for severity grouping', async () => {
      mockUseFeatureFlag('security_center_dashboards_parallel_queries_by_4_slices', false)

      const mock = mockFetch.mockRoute(BASE_ROUTE_BY_SEVERITY_REGEX, MOCK_RESPONSE_BY_SEVERITY, {
        headers: new Headers(JSON_HEADER),
      })

      const {result} = renderHook(() =>
        useAlertTrendsQuery({
          query: 'foobar',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          grouping: 'severity',
          alertState: 'open',
        }),
      )

      expect(mock).toHaveBeenCalled()
      expect(mock).toHaveBeenCalledWith(
        `${BASE_ROUTE_BY_SEVERITY}?alertTrendsChart%5BisOpenSelected%5D=true&query=foobar+tool%3Asecret-scanning&startDate=2024-01-01&endDate=2024-12-31`,
        expect.anything(),
      )
      expect(mock).toHaveBeenCalledWith(
        `${BASE_ROUTE_BY_SEVERITY}?alertTrendsChart%5BisOpenSelected%5D=true&query=foobar+tool%3Adependabot&startDate=2024-01-01&endDate=2024-12-31`,
        expect.anything(),
      )
      expect(mock).toHaveBeenCalledWith(
        `${BASE_ROUTE_BY_SEVERITY}?alertTrendsChart%5BisOpenSelected%5D=true&query=foobar+tool%3Acodeql%2Cthird-party&startDate=2024-01-01&endDate=2024-12-31`,
        expect.anything(),
      )
      // Each fetch returns a single dataset, but useQueries() will return all of them as an array of query results.
      await waitFor(() => expect(result.current.every(data => data.isSuccess)).toBe(true))
      expect(result.current.length).toBe(3)
      expect(result.current[0]?.data).toEqual(MOCK_RESPONSE_BY_SEVERITY)
      expect(result.current[1]?.data).toEqual(MOCK_RESPONSE_BY_SEVERITY)
      expect(result.current[2]?.data).toEqual(MOCK_RESPONSE_BY_SEVERITY)
    })

    it('fetches data for age grouping', async () => {
      mockUseFeatureFlag('security_center_dashboards_parallel_queries_by_4_slices', false)

      const mock = mockFetch.mockRoute(BASE_ROUTE_BY_AGE_REGEX, MOCK_RESPONSE_BY_AGE, {
        headers: new Headers(JSON_HEADER),
      })

      const {result} = renderHook(() =>
        useAlertTrendsQuery({
          query: 'foobar',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          grouping: 'age',
          alertState: 'open',
        }),
      )

      expect(mock).toHaveBeenCalled()
      expect(mock).toHaveBeenCalledWith(
        `${BASE_ROUTE_BY_AGE}?alertTrendsChart%5BisOpenSelected%5D=true&query=foobar+tool%3Asecret-scanning&startDate=2024-01-01&endDate=2024-12-31`,
        expect.anything(),
      )
      expect(mock).toHaveBeenCalledWith(
        `${BASE_ROUTE_BY_AGE}?alertTrendsChart%5BisOpenSelected%5D=true&query=foobar+tool%3Adependabot&startDate=2024-01-01&endDate=2024-12-31`,
        expect.anything(),
      )
      expect(mock).toHaveBeenCalledWith(
        `${BASE_ROUTE_BY_AGE}?alertTrendsChart%5BisOpenSelected%5D=true&query=foobar+tool%3Acodeql%2Cthird-party&startDate=2024-01-01&endDate=2024-12-31`,
        expect.anything(),
      )
      await waitFor(() => expect(result.current.every(data => data.isSuccess)).toBe(true))
      expect(result.current.length).toBe(3)
      expect(result.current[0]?.data).toEqual(MOCK_RESPONSE_BY_AGE)
      expect(result.current[1]?.data).toEqual(MOCK_RESPONSE_BY_AGE)
      expect(result.current[2]?.data).toEqual(MOCK_RESPONSE_BY_AGE)
    })

    it('fetches data for tool grouping', async () => {
      mockUseFeatureFlag('security_center_dashboards_parallel_queries_by_4_slices', false)

      const mock = mockFetch.mockRoute(BASE_ROUTE_BY_TOOL_REGEX, MOCK_RESPONSE_BY_TOOL, {
        headers: new Headers(JSON_HEADER),
      })

      const {result} = renderHook(() =>
        useAlertTrendsQuery({
          query: 'foobar',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          grouping: 'tool',
          alertState: 'open',
        }),
      )

      expect(mock).toHaveBeenCalled()
      expect(mock).toHaveBeenCalledWith(
        `${BASE_ROUTE_BY_TOOL}-secret-scanning?alertTrendsChart%5BisOpenSelected%5D=true&query=foobar+tool%3Asecret-scanning&startDate=2024-01-01&endDate=2024-12-31`,
        expect.anything(),
      )
      expect(mock).toHaveBeenCalledWith(
        `${BASE_ROUTE_BY_TOOL}-dependabot-alerts?alertTrendsChart%5BisOpenSelected%5D=true&query=foobar+tool%3Adependabot&startDate=2024-01-01&endDate=2024-12-31`,
        expect.anything(),
      )
      expect(mock).toHaveBeenCalledWith(
        `${BASE_ROUTE_BY_TOOL}-code-scanning?alertTrendsChart%5BisOpenSelected%5D=true&query=foobar+tool%3Acodeql%2Cthird-party&startDate=2024-01-01&endDate=2024-12-31`,
        expect.anything(),
      )
      await waitFor(() => expect(result.current.every(data => data.isSuccess)).toBe(true))
      expect(result.current.length).toBe(3)
      expect(result.current[0]?.data).toEqual(MOCK_RESPONSE_BY_TOOL)
      expect(result.current[1]?.data).toEqual(MOCK_RESPONSE_BY_TOOL)
      expect(result.current[2]?.data).toEqual(MOCK_RESPONSE_BY_TOOL)
    })

    it('fetches data for closed alert state', async () => {
      mockUseFeatureFlag('security_center_dashboards_parallel_queries_by_4_slices', false)

      const mock = mockFetch.mockRoute(BASE_ROUTE_BY_SEVERITY_REGEX, MOCK_RESPONSE_BY_SEVERITY, {
        headers: new Headers(JSON_HEADER),
      })

      const {result} = renderHook(() =>
        useAlertTrendsQuery({
          query: 'foobar',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          grouping: 'severity',
          alertState: 'closed',
        }),
      )

      expect(mock).toHaveBeenCalled()
      expect(mock).toHaveBeenCalledWith(
        `${BASE_ROUTE_BY_SEVERITY}?alertTrendsChart%5BisOpenSelected%5D=false&query=foobar+tool%3Asecret-scanning&startDate=2024-01-01&endDate=2024-12-31`,
        expect.anything(),
      )
      expect(mock).toHaveBeenCalledWith(
        `${BASE_ROUTE_BY_SEVERITY}?alertTrendsChart%5BisOpenSelected%5D=false&query=foobar+tool%3Adependabot&startDate=2024-01-01&endDate=2024-12-31`,
        expect.anything(),
      )
      expect(mock).toHaveBeenCalledWith(
        `${BASE_ROUTE_BY_SEVERITY}?alertTrendsChart%5BisOpenSelected%5D=false&query=foobar+tool%3Acodeql%2Cthird-party&startDate=2024-01-01&endDate=2024-12-31`,
        expect.anything(),
      )
      await waitFor(() => expect(result.current.every(data => data.isSuccess)).toBe(true))
      expect(result.current.length).toBe(3)
      expect(result.current[0]?.data).toEqual(MOCK_RESPONSE_BY_SEVERITY)
      expect(result.current[1]?.data).toEqual(MOCK_RESPONSE_BY_SEVERITY)
      expect(result.current[2]?.data).toEqual(MOCK_RESPONSE_BY_SEVERITY)
    })

    it('returns error state if request fails', async () => {
      mockUseFeatureFlag('security_center_dashboards_parallel_queries_by_4_slices', false)

      const mock = mockFetch.mockRoute(BASE_ROUTE_BY_SEVERITY_REGEX, undefined, {status: 500})

      const {result} = renderHook(() =>
        useAlertTrendsQuery({
          query: 'foobar',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          grouping: 'severity',
          alertState: 'closed',
        }),
      )

      expect(mock).toHaveBeenCalled()
      await waitFor(() => expect(result.current.every(data => data.isError)).toBe(true))
      expect(result.current[0]?.data).toBeUndefined()
    })
  })

  describe('with query slicing', () => {
    it('fetches data for severity grouping', async () => {
      mockUseFeatureFlag('security_center_dashboards_parallel_queries_by_4_slices', true)

      const mock = mockFetch.mockRoute(BASE_ROUTE_BY_SEVERITY_REGEX, MOCK_RESPONSE_BY_SEVERITY, {
        headers: new Headers(JSON_HEADER),
      })

      renderHook(() =>
        useAlertTrendsQuery({
          query: 'foobar',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          grouping: 'severity',
          alertState: 'open',
        }),
      )

      // 3 tools * 4 slices = 12 fetches
      expect(mock).toHaveBeenCalledTimes(12)
    })

    it('fetches data for age grouping', async () => {
      mockUseFeatureFlag('security_center_dashboards_parallel_queries_by_4_slices', true)

      const mock = mockFetch.mockRoute(BASE_ROUTE_BY_AGE_REGEX, MOCK_RESPONSE_BY_AGE, {
        headers: new Headers(JSON_HEADER),
      })

      renderHook(() =>
        useAlertTrendsQuery({
          query: 'foobar',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          grouping: 'age',
          alertState: 'open',
        }),
      )

      // 3 tools * 4 slices = 12 fetches
      expect(mock).toHaveBeenCalledTimes(12)
    })

    it('fetches data for tool grouping', async () => {
      mockUseFeatureFlag('security_center_dashboards_parallel_queries_by_4_slices', true)

      const mock = mockFetch.mockRoute(BASE_ROUTE_BY_TOOL_REGEX, MOCK_RESPONSE_BY_TOOL, {
        headers: new Headers(JSON_HEADER),
      })

      renderHook(() =>
        useAlertTrendsQuery({
          query: 'foobar',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          grouping: 'tool',
          alertState: 'open',
        }),
      )

      // 3 tools * 4 slices = 12 fetches
      expect(mock).toHaveBeenCalledTimes(12)
    })

    it('fetches data for closed alert state', async () => {
      mockUseFeatureFlag('security_center_dashboards_parallel_queries_by_4_slices', true)

      const mock = mockFetch.mockRoute(BASE_ROUTE_BY_SEVERITY_REGEX, MOCK_RESPONSE_BY_SEVERITY, {
        headers: new Headers(JSON_HEADER),
      })

      renderHook(() =>
        useAlertTrendsQuery({
          query: 'foobar',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          grouping: 'severity',
          alertState: 'closed',
        }),
      )

      // 3 tools * 4 slices = 12 fetches
      expect(mock).toHaveBeenCalledTimes(12)
    })

    it('returns error state if request fails', async () => {
      mockUseFeatureFlag('security_center_dashboards_parallel_queries_by_4_slices', true)

      const mock = mockFetch.mockRoute(BASE_ROUTE_BY_SEVERITY_REGEX, undefined, {status: 500})

      const {result} = renderHook(() =>
        useAlertTrendsQuery({
          query: 'foobar',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          grouping: 'severity',
          alertState: 'closed',
        }),
      )

      expect(mock).toHaveBeenCalled()
      await waitFor(() => expect(result.current.every(data => data.isError)).toBe(true))
      expect(result.current[0]?.data).toBeUndefined()
    })
  })
})
