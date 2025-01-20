import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {act, renderHook, waitFor} from '@testing-library/react'

import {JSON_HEADER} from '../../../../common/utils/fetch-json'
import {PathsProvider} from '../../../../test-utils/PathsProvider'
import {type DataState, useAlertTrendsChartData, useTotalAlertCountData} from '../use-alert-trends-chart-data'

jest.mock('@github-ui/react-core/use-feature-flag')
function mockUseFeatureFlag(flag: string, value: boolean): void {
  ;(useFeatureFlag as jest.Mock).mockImplementation(flagName => flagName === flag && value)
}

const mockData = {
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
}

window.performance.mark = jest.fn()

describe('useAlertTrendsChartData', () => {
  it('returns the correct data', async () => {
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

    let result: DataState = {kind: 'loading'}
    renderHook(
      () =>
        act(() => {
          result = useAlertTrendsChartData('2024-01-09', '2024-01-10', 'archived:false', true, 'severity')
        }),
      {wrapper: PathsProvider},
    )

    await waitFor(() =>
      expect(result).toStrictEqual({
        kind: 'ready',
        data: {
          alertTrends: new Map([
            [
              'Low',
              [
                {x: '2024-01-09', y: 300},
                {x: '2024-01-10', y: 3},
              ],
            ],
            [
              'Medium',
              [
                {x: '2024-01-09', y: 600},
                {x: '2024-01-10', y: 6},
              ],
            ],
            [
              'High',
              [
                {x: '2024-01-09', y: 900},
                {x: '2024-01-10', y: 9},
              ],
            ],
            [
              'Critical',
              [
                {x: '2024-01-09', y: 1200},
                {x: '2024-01-10', y: 12},
              ],
            ],
          ]),
        },
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

    mockUseFeatureFlag('security_center_dashboards_parallel_queries_by_4_slices', true)

    let result: DataState = {kind: 'loading'}
    renderHook(
      () =>
        act(() => {
          result = useAlertTrendsChartData('2024-01-09', '2024-01-10', 'archived:false', true, 'severity')
        }),
      {wrapper: PathsProvider},
    )

    await waitFor(() =>
      expect(result).toStrictEqual({
        kind: 'ready',
        data: {
          alertTrends: new Map([
            [
              'Low',
              [
                {x: '2024-01-09', y: 300 * 4},
                {x: '2024-01-10', y: 3 * 4},
              ],
            ],
            [
              'Medium',
              [
                {x: '2024-01-09', y: 600 * 4},
                {x: '2024-01-10', y: 6 * 4},
              ],
            ],
            [
              'High',
              [
                {x: '2024-01-09', y: 900 * 4},
                {x: '2024-01-10', y: 9 * 4},
              ],
            ],
            [
              'Critical',
              [
                {x: '2024-01-09', y: 1200 * 4},
                {x: '2024-01-10', y: 12 * 4},
              ],
            ],
          ]),
        },
      }),
    )
  })
})

describe('useTotalAlertCountData', () => {
  it('returns undefined if the periodState is not ready', async () => {
    expect(useTotalAlertCountData({kind: 'loading'})).toBe(undefined)
  })

  it('returns the sum of the last day data if the periodState is ready', async () => {
    expect(
      useTotalAlertCountData({
        kind: 'ready',
        data: {
          alertTrends: new Map([
            [
              'Low',
              [
                {x: '2024-01-09', y: 100},
                {x: '2024-01-10', y: 1},
              ],
            ],
            [
              'Medium',
              [
                {x: '2024-01-09', y: 200},
                {x: '2024-01-10', y: 2},
              ],
            ],
            [
              'High',
              [
                {x: '2024-01-09', y: 300},
                {x: '2024-01-10', y: 3},
              ],
            ],
            [
              'Critical',
              [
                {x: '2024-01-09', y: 400},
                {x: '2024-01-10', y: 4},
              ],
            ],
          ]),
        },
      }),
    ).toBe(10)
  })
})
