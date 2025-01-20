import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {act, renderHook, waitFor} from '@testing-library/react'
import {useCallback} from 'react'

import {JSON_HEADER} from '../../../common/utils/fetch-json'
import {type NumberCardDataStates, useNumberCardData} from '../use-number-card-data'

const mockData = {
  count: 150,
}

const previousPeriodMockData = {
  count: 50,
}

jest.mock('@github-ui/react-core/use-feature-flag')
function mockUseFeatureFlag(flag: string, value: boolean): void {
  ;(useFeatureFlag as jest.Mock).mockImplementation(flagName => flagName === flag && value)
}

function countReducer(results: Array<{count: number}>): number {
  return results.reduce((acc, result) => acc + result.count, 0)
}

describe('useNumberCardData', () => {
  it('returns the correct data when parallelQueriesPerTool=false', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => mockData,
      headers: new Headers(JSON_HEADER),
      ok: true,
    } as Response)
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => previousPeriodMockData,
      headers: new Headers(JSON_HEADER),
      ok: true,
    } as Response)
    mockUseFeatureFlag('security_center_dashboards_cards_parallel_queries_per_tool', false)

    let result: NumberCardDataStates = {
      currentPeriodState: {kind: 'loading'},
      previousPeriodState: {kind: 'loading'},
      trend: 0,
    }
    renderHook(() =>
      act(() => {
        result = useNumberCardData({
          startDate: '2024-01-09',
          endDate: '2024-01-10',
          endpoint: useCallback(() => 'endpoint', []),
          query: 'query',
          resultsReducer: countReducer,
        })
      }),
    )

    await waitFor(() =>
      expect(result).toStrictEqual({
        currentPeriodState: {kind: 'ready', count: mockData.count},
        previousPeriodState: {kind: 'ready', count: previousPeriodMockData.count},
        trend: 200,
      }),
    )
  })

  it('returns the correct data when parallelQueriesPerTool=true', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => mockData,
      headers: new Headers(JSON_HEADER),
      ok: true,
    } as Response)
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => mockData,
      headers: new Headers(JSON_HEADER),
      ok: true,
    } as Response)
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => mockData,
      headers: new Headers(JSON_HEADER),
      ok: true,
    } as Response)
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => previousPeriodMockData,
      headers: new Headers(JSON_HEADER),
      ok: true,
    } as Response)
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => previousPeriodMockData,
      headers: new Headers(JSON_HEADER),
      ok: true,
    } as Response)
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => previousPeriodMockData,
      headers: new Headers(JSON_HEADER),
      ok: true,
    } as Response)
    mockUseFeatureFlag('security_center_dashboards_cards_parallel_queries_per_tool', true)

    let result: NumberCardDataStates = {
      currentPeriodState: {kind: 'loading'},
      previousPeriodState: {kind: 'loading'},
      trend: 0,
    }
    renderHook(() =>
      act(() => {
        result = useNumberCardData({
          startDate: '2024-01-09',
          endDate: '2024-01-10',
          endpoint: useCallback(() => 'endpoint', []),
          query: 'query',
          resultsReducer: countReducer,
        })
      }),
    )

    await waitFor(() =>
      expect(result).toStrictEqual({
        currentPeriodState: {kind: 'ready', count: mockData.count * 3},
        previousPeriodState: {kind: 'ready', count: previousPeriodMockData.count * 3},
        trend: 200,
      }),
    )
  })

  it('returns the correct data when parallelQueriesBy4Slices=true', async () => {
    for (let i = 0; i < 12; i++) {
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => mockData,
        headers: new Headers(JSON_HEADER),
        ok: true,
      } as Response)
    }

    for (let i = 0; i < 12; i++) {
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => previousPeriodMockData,
        headers: new Headers(JSON_HEADER),
        ok: true,
      } as Response)
    }

    mockUseFeatureFlag('security_center_dashboards_parallel_queries_by_4_slices', true)

    let result: NumberCardDataStates = {
      currentPeriodState: {kind: 'loading'},
      previousPeriodState: {kind: 'loading'},
      trend: 0,
    }
    renderHook(() =>
      act(() => {
        result = useNumberCardData({
          startDate: '2024-01-09',
          endDate: '2024-01-10',
          endpoint: useCallback(() => 'endpoint', []),
          query: 'query',
          resultsReducer: countReducer,
        })
      }),
    )

    await waitFor(() =>
      expect(result).toStrictEqual({
        // The counts are 4x because we are mocking 4 slices
        currentPeriodState: {kind: 'ready', count: mockData.count * 3 * 4},
        previousPeriodState: {kind: 'ready', count: previousPeriodMockData.count * 3 * 4},
        trend: 200,
      }),
    )
  })

  it('returns an error if it fails to fetch data when parallelQueriesPerTool=false', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => {},
      headers: new Headers(JSON_HEADER),
      ok: false,
    } as Response)
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => {},
      headers: new Headers(JSON_HEADER),
      ok: false,
    } as Response)
    mockUseFeatureFlag('security_center_dashboards_cards_parallel_queries_per_tool', false)

    let result: NumberCardDataStates = {
      currentPeriodState: {kind: 'loading'},
      previousPeriodState: {kind: 'loading'},
      trend: 0,
    }
    renderHook(() =>
      act(() => {
        result = useNumberCardData({
          startDate: '2024-01-09',
          endDate: '2024-01-10',
          endpoint: useCallback(() => 'endpoint', []),
          query: 'query',
          resultsReducer: countReducer,
        })
      }),
    )

    await waitFor(() =>
      expect(result).toStrictEqual({
        currentPeriodState: {kind: 'error', msg: 'Failed to fetch data'},
        previousPeriodState: {kind: 'error', msg: 'Failed to fetch data'},
        trend: 0,
      }),
    )
  })

  it('returns an error if it fails to fetch data when parallelQueriesBy4Slices=true', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: async () => {},
      headers: new Headers(JSON_HEADER),
      ok: true,
    } as Response)
    for (let i = 0; i < 23; i++) {
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => {},
        headers: new Headers(JSON_HEADER),
        ok: false,
      } as Response)
    }
    mockUseFeatureFlag('security_center_dashboards_parallel_queries_by_4_slices', true)

    let result: NumberCardDataStates = {
      currentPeriodState: {kind: 'loading'},
      previousPeriodState: {kind: 'loading'},
      trend: 0,
    }
    renderHook(() =>
      act(() => {
        result = useNumberCardData({
          startDate: '2024-01-09',
          endDate: '2024-01-10',
          endpoint: useCallback(() => 'endpoint', []),
          query: 'query',
          resultsReducer: countReducer,
        })
      }),
    )

    await waitFor(() =>
      expect(result).toStrictEqual({
        currentPeriodState: {kind: 'error', msg: 'Failed to fetch data'},
        previousPeriodState: {kind: 'error', msg: 'Failed to fetch data'},
        trend: 0,
      }),
    )
  })

  it('returns an error if the date period is more than 2 years ago', async () => {
    let result: NumberCardDataStates = {
      currentPeriodState: {kind: 'loading'},
      previousPeriodState: {kind: 'loading'},
      trend: 0,
    }
    renderHook(() =>
      act(() => {
        result = useNumberCardData({
          startDate: '2022-01-01',
          endDate: '2022-01-10',
          endpoint: useCallback(() => 'endpoint', []),
          query: 'query',
          resultsReducer: countReducer,
        })
      }),
    )

    await waitFor(() =>
      expect(result).toStrictEqual({
        currentPeriodState: {kind: 'error', msg: 'Data is only available for the last 2 years'},
        previousPeriodState: {kind: 'error', msg: 'Data is only available for the last 2 years'},
        trend: 0,
      }),
    )
  })
})
