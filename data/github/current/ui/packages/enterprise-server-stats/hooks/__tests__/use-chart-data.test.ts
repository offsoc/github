import '@testing-library/jest-dom'
import {act, cleanup, renderHook} from '@testing-library/react'
import {useChartData, StatKey} from '../use-chart-data'
import {TimePeriod} from '../../types'

const mockJSON = jest.fn()
const mockVerifiedFetchJSON = jest.fn().mockResolvedValue({
  ok: true,
  statusText: 'OK',
  json: () => mockJSON(),
})

jest.mock('@github-ui/verified-fetch', () => ({
  verifiedFetchJSON: (...args: unknown[]) => mockVerifiedFetchJSON(...args),
}))

const mockReportError = jest.fn()

jest.mock('@github-ui/failbot', () => ({
  reportError: (...args: unknown[]) => mockReportError(...args),
}))

const goodResponse = {
  data: {
    heroStats: [
      {percentChange: 0, label: 'All Pull requests', total: 1234},
      {percentChange: 6.25, label: 'Merged Pull requests', total: 100},
    ],
    series: {
      columns: [
        {dataType: 'datetime', name: 'Date'},
        {dataType: 'int', name: 'Count'},
        {dataType: 'nvarchar', name: 'Pull requests Count'},
      ],
      rows: [
        ['Fri Mar 10 2023 11:53:11 GMT+0000 (Greenwich Mean Time)', 20, 'All Pull requests'],
        ['Fri Mar 10 2023 11:53:11 GMT+0000 (Greenwich Mean Time)', 18, 'Merged Pull requests'],
        ['Fri Mar 11 2023 11:53:11 GMT+0000 (Greenwich Mean Time)', 22, 'All Pull requests'],
        ['Fri Mar 11 2023 11:53:11 GMT+0000 (Greenwich Mean Time)', 17, 'Merged Pull requests'],
        ['Fri Mar 12 2023 11:53:11 GMT+0000 (Greenwich Mean Time)', 20, 'All Pull requests'],
        ['Fri Mar 12 2023 11:53:11 GMT+0000 (Greenwich Mean Time)', 16, 'Merged Pull requests'],
      ],
    },
  },
}

describe('useChart', () => {
  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  test('starts in loading state', async () => {
    mockJSON.mockReturnValue({data: {heroStats: [], series: {rows: [], columns: []}}})
    const {result} = renderHook(() =>
      useChartData(StatKey.Pulls, {enterpriseSlug: 'enterprise-slug', server: 'server-id', period: TimePeriod.Year}),
    )

    await act(() => {
      expect(result.current).toEqual({
        error: undefined,
        loading: true,
        statKey: 'pulls',
        title: 'Pull Requests',
        data: undefined,
      })
    })
  })

  test('fetches data for requested enterprise', async () => {
    renderHook(() =>
      useChartData(StatKey.Pulls, {enterpriseSlug: 'enterprise-1', server: 'server-id', period: TimePeriod.Year}),
    )

    await act(() => {
      expect(mockVerifiedFetchJSON).toHaveBeenCalledTimes(1)
      expect(mockVerifiedFetchJSON).toHaveBeenCalledWith(
        `/enterprises/enterprise-1/enterprise_installations/server_stats/pulls?period=year&server=server-id`,
      )
    })
    mockVerifiedFetchJSON.mockClear()

    renderHook(() =>
      useChartData(StatKey.Pulls, {enterpriseSlug: 'enterprise-2', server: 'server-id', period: TimePeriod.Year}),
    )
    await act(() => {
      expect(mockVerifiedFetchJSON).toHaveBeenCalledTimes(1)
      expect(mockVerifiedFetchJSON).toHaveBeenCalledWith(
        `/enterprises/enterprise-2/enterprise_installations/server_stats/pulls?period=year&server=server-id`,
      )
    })
  })

  test('fetches data for requested server', async () => {
    renderHook(() =>
      useChartData(StatKey.Pulls, {enterpriseSlug: 'enterprise-slug', server: 'server-1', period: TimePeriod.Year}),
    )

    await act(() => {
      expect(mockVerifiedFetchJSON).toHaveBeenCalledTimes(1)
      expect(mockVerifiedFetchJSON).toHaveBeenCalledWith(
        `/enterprises/enterprise-slug/enterprise_installations/server_stats/pulls?period=year&server=server-1`,
      )
    })
    mockVerifiedFetchJSON.mockClear()

    renderHook(() =>
      useChartData(StatKey.Pulls, {enterpriseSlug: 'enterprise-slug', server: 'server-2', period: TimePeriod.Year}),
    )
    await act(() => {
      expect(mockVerifiedFetchJSON).toHaveBeenCalledTimes(1)
      expect(mockVerifiedFetchJSON).toHaveBeenCalledWith(
        `/enterprises/enterprise-slug/enterprise_installations/server_stats/pulls?period=year&server=server-2`,
      )
    })
  })

  test('fetches data for requested chart', async () => {
    for (const statKey of Object.values(StatKey)) {
      mockVerifiedFetchJSON.mockClear()
      renderHook(() =>
        useChartData(statKey, {enterpriseSlug: 'enterprise-slug', server: 'server-id', period: TimePeriod.Year}),
      )

      await act(() => {
        expect(mockVerifiedFetchJSON).toHaveBeenCalledTimes(1)
        expect(mockVerifiedFetchJSON).toHaveBeenCalledWith(
          `/enterprises/enterprise-slug/enterprise_installations/server_stats/${statKey}?period=year&server=server-id`,
        )
      })
    }
  })

  test('fetches data for requested time period', async () => {
    for (const period of Object.values(TimePeriod)) {
      mockVerifiedFetchJSON.mockClear()
      renderHook(() => useChartData(StatKey.Pulls, {enterpriseSlug: 'enterprise-slug', server: 'server-id', period}))

      await act(() => {
        expect(mockVerifiedFetchJSON).toHaveBeenCalledTimes(1)
        expect(mockVerifiedFetchJSON).toHaveBeenCalledWith(
          `/enterprises/enterprise-slug/enterprise_installations/server_stats/pulls?period=${period}&server=server-id`,
        )
      })
    }
  })

  test('returns expected chart data', async () => {
    mockJSON.mockReturnValue(goodResponse)
    const {result} = renderHook(() =>
      useChartData(StatKey.Pulls, {enterpriseSlug: 'enterprise-slug', server: 'server-id', period: TimePeriod.Year}),
    )

    await act(() => {
      expect(result.current.loading).toBe(true)
    })

    await act(() => {
      expect(mockVerifiedFetchJSON).toHaveBeenCalledTimes(1)
      expect(mockVerifiedFetchJSON).toHaveBeenCalledWith(
        '/enterprises/enterprise-slug/enterprise_installations/server_stats/pulls?period=year&server=server-id',
      )
      expect(result.current.loading).toBe(false)
      expect(result.current).toEqual({
        error: undefined,
        loading: false,
        statKey: 'pulls',
        title: 'Pull Requests',
        data: goodResponse.data,
      })
    })
  })

  test('returns expected chart data when options change', async () => {
    mockJSON.mockReturnValue(goodResponse)
    const {result, rerender} = renderHook(({args}: {args: Parameters<typeof useChartData>}) => useChartData(...args), {
      initialProps: {
        args: [StatKey.Pulls, {enterpriseSlug: 'enterprise-slug', server: 'server-id', period: TimePeriod.Year}],
      },
    })

    await act(() => {
      expect(result.current.loading).toBe(true)
    })

    await act(() => {
      expect(result.current).toEqual({
        error: undefined,
        loading: false,
        statKey: 'pulls',
        title: 'Pull Requests',
        data: goodResponse.data,
      })
    })

    mockJSON.mockReturnValue({data: {}})
    rerender({
      args: [StatKey.Issues, {enterpriseSlug: 'enterprise-slug-2', server: 'server-id-2', period: TimePeriod.Month}],
    })

    await act(() => {
      expect(result.current).toEqual({
        error: undefined,
        loading: true,
        statKey: 'issues',
        title: 'Issues',
        data: undefined,
      })
    })

    await act(() => {
      expect(result.current).toEqual({
        error: undefined,
        loading: false,
        statKey: 'issues',
        title: 'Issues',
        data: {},
      })
    })
  })

  test('surfaces `statusText` as error message when chart fetch fails with non-OK response', async () => {
    mockVerifiedFetchJSON.mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
      json: () => mockJSON(),
    })

    const {result} = renderHook(() =>
      useChartData(StatKey.Pulls, {enterpriseSlug: 'enterprise-slug', server: 'server-id', period: TimePeriod.Year}),
    )

    await act(() => {
      expect(result.current.loading).toBe(true)
    })

    await act(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current).toEqual({
        error: 'Internal Server Error',
        loading: false,
        statKey: 'pulls',
        title: 'Pull Requests',
        data: undefined,
      })
    })
  })

  test('reports error to failbot when chart fetch fails with non-OK response', async () => {
    mockVerifiedFetchJSON.mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
      json: () => mockJSON(),
    })

    const {result} = renderHook(() =>
      useChartData(StatKey.Issues, {enterpriseSlug: 'enterprise-slug', server: 'server-id', period: TimePeriod.Year}),
    )

    await act(() => {
      expect(result.current.loading).toBe(true)
    })

    await act(() => {
      expect(result.current.loading).toBe(false)
      expect(mockReportError).toHaveBeenCalledTimes(1)
      expect(mockReportError).toHaveBeenCalledWith(new Error('error fetching chart data: Internal Server Error'))
    })
  })

  test('surfaces error message when chart fetch throws an error', async () => {
    mockVerifiedFetchJSON.mockRejectedValue(new Error('Failed to fetch'))

    const {result} = renderHook(() =>
      useChartData(StatKey.Pulls, {enterpriseSlug: 'enterprise-slug', server: 'server-id', period: TimePeriod.Year}),
    )

    await act(() => {
      expect(result.current.loading).toBe(true)
    })

    await act(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current).toEqual({
        error: 'Failed to fetch',
        loading: false,
        statKey: 'pulls',
        title: 'Pull Requests',
        data: undefined,
      })
    })
  })

  test('reports error to failbot when chart fetch throws an error', async () => {
    mockVerifiedFetchJSON.mockRejectedValue(new Error('Failed to fetch'))

    const {result} = renderHook(() =>
      useChartData(StatKey.Issues, {enterpriseSlug: 'enterprise-slug', server: 'server-id', period: TimePeriod.Year}),
    )

    await act(() => {
      expect(result.current.loading).toBe(true)
    })

    await act(() => {
      expect(result.current.loading).toBe(false)
      expect(mockReportError).toHaveBeenCalledTimes(1)
      expect(mockReportError).toHaveBeenCalledWith(new Error('error fetching chart data: Failed to fetch'))
    })
  })
})
