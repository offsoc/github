import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {useQueries, type UseQueryResult} from '@tanstack/react-query'

import {usePaths} from '../../../common/contexts/Paths'
import {fetchJson} from '../../../common/utils/fetch-json'
import {getQueriesByFilterValue} from '../../utils/query-parser'
import type {GroupingType} from './grouping-type'

export interface AlertTrend {
  x: string
  y: number
}

export interface AlertTrendsResult {
  alertTrends: {[key: string]: AlertTrend[]}
}

export type AlertTrendsData = Map<string, AlertTrend[]>

export interface UseAlertTrendsQueryParams {
  query: string
  startDate: string
  endDate: string
  grouping: GroupingType
  alertState: 'open' | 'closed'
}

export interface SliceQueryParams {
  slice: string
  query: string
}

export function useTotalAlertCountData(periodData: Array<UseQueryResult<AlertTrendsResult>>): number | undefined {
  const isSuccess = periodData.every(result => result.isSuccess)
  if (isSuccess) {
    const toolData = periodData.map(result => result.data.alertTrends)
    const values = toolData.flatMap(data => Object.values(data))
    return values.reduce((sum: number, trend: AlertTrend[]) => {
      const lastDataPoint = trend[trend.length - 1]
      if (!lastDataPoint) return sum + 0

      return sum + lastDataPoint.y
    }, 0)
  } else {
    return 0
  }
}

export function useAlertTrendsData(periodData: Array<UseQueryResult<AlertTrendsResult>>): AlertTrendsData {
  const isSuccess = periodData.every(result => result.isSuccess)
  const alertTrends = new Map<string, AlertTrend[]>()
  if (isSuccess) {
    const toolData = periodData.map(result => result.data.alertTrends)
    for (const tool of toolData) {
      for (const [name, dataPoints] of Object.entries(tool)) {
        if (!alertTrends.has(name)) {
          alertTrends.set(name, [])
        }

        for (const dataPoint of dataPoints) {
          const existingDataPoint = alertTrends.get(name)?.find(alertTrend => alertTrend.x === dataPoint.x)
          if (existingDataPoint) {
            existingDataPoint.y += dataPoint.y
          } else {
            alertTrends.get(name)?.push({...dataPoint})
          }
        }
      }
    }
  }
  return alertTrends
}

export function useAlertTrendsQuery({
  query,
  startDate,
  endDate,
  grouping,
  alertState,
}: UseAlertTrendsQueryParams): Array<UseQueryResult<AlertTrendsResult>> {
  const parallelQueriesBy4Slices = useFeatureFlag('security_center_dashboards_parallel_queries_by_4_slices')

  const sliceParams = []
  if (parallelQueriesBy4Slices) {
    // parallelize by tool and slice4
    const perToolQueries = getQueriesByFilterValue(query, 'tool', [
      'secret-scanning',
      'dependabot',
      'codeql',
      'third-party',
    ])
    for (const perToolQuery of perToolQueries) {
      for (const slice of ['0', '1', '2', '3']) {
        sliceParams.push({query: perToolQuery, slice4: slice})
      }
    }
  } else {
    // parallelize by tool
    const perToolQueries = getQueriesByFilterValue(query, 'tool', [
      'secret-scanning',
      'dependabot',
      'codeql',
      'third-party',
    ])
    for (const perToolQuery of perToolQueries) {
      sliceParams.push({query: perToolQuery})
    }
  }

  const paths = usePaths()

  const dataQueries = useQueries({
    queries: sliceParams.map(params => {
      return {
        queryKey: ['alert-trends', params, startDate, endDate, grouping, alertState],
        queryFn: (): Promise<AlertTrendsResult> => {
          const path = paths.alertTrendsPath({
            startDate,
            endDate,
            grouping,
            alertState,
            ...params,
          })
          return fetchJson(path)
        },
      }
    }),
  })

  return dataQueries
}
