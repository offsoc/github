import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {useEffect, useState} from 'react'

import {usePaths} from '../../../common/contexts/Paths'
import {dateIsMoreThanTwoYearsAgo} from '../../../common/utils/date-period'
import {fetchJson} from '../../../common/utils/fetch-json'
import {getQueriesByFilterValue} from '../../utils/query-parser'
import {type AlertTrend, type FetchResponse, isNoDataResponse} from './fetch-types'
import type {GroupingType} from './grouping-type'
import {groupingValues} from './grouping-type'

export interface LoadingState {
  kind: 'loading'
}

export interface NoDataState {
  kind: 'no-data'
}

export interface ErrorState {
  kind: 'error'
  msg?: string
}

export interface ReadyState {
  kind: 'ready'
  data: {alertTrends: Map<string, AlertTrend[]>}
}

export type DataState = LoadingState | NoDataState | ErrorState | ReadyState

export function isReadyState(state: DataState): state is ReadyState {
  return state.kind === 'ready'
}

export function isLoadingState(state: DataState): state is LoadingState {
  return state.kind === 'loading'
}

export function isErrorState(state: DataState): state is ErrorState {
  return state.kind === 'error'
}

export function isNoDataState(state: DataState): state is NoDataState {
  return state.kind === 'no-data'
}

export const alertTrendsStartMark = 'security_overview_dashboard_alert_trends_start'
export const alertTrendsEndMark = 'security_overview_dashboard_alert_trends_end'

export function useAlertTrendsChartData(
  startDate: string,
  endDate: string,
  query: string,
  isOpenSelected: boolean,
  grouping: GroupingType,
): DataState {
  const [periodState, setPeriodState] = useState<DataState>({kind: 'loading'})
  const paths = usePaths()
  const parallelQueriesBy4Slices = useFeatureFlag('security_center_dashboards_parallel_queries_by_4_slices')

  useEffect(() => {
    let abortFetch = false
    const alertState = isOpenSelected ? 'open' : 'closed'

    async function fetchData(): Promise<void> {
      setPeriodState({kind: 'loading'})

      const alertTrends = new Map<string, AlertTrend[]>()
      const queries = getQueriesByFilterValue(query, 'tool', ['secret-scanning', 'dependabot', 'codeql', 'third-party'])
      const promises = queries
        .map(perToolQuery => {
          if (parallelQueriesBy4Slices) {
            return ['0', '1', '2', '3'].map(slice => {
              const url = paths.alertTrendsPath({
                startDate,
                endDate,
                query: perToolQuery,
                alertState,
                grouping,
                slice4: slice,
              })
              return fetchJson<FetchResponse>(url)
            })
          } else {
            const url = paths.alertTrendsPath({
              startDate,
              endDate,
              query: perToolQuery,
              alertState,
              grouping,
            })
            return [fetchJson<FetchResponse>(url)]
          }
        })
        .flat()

      // Get all responses and check if any of them are not ok
      const [responses, responseOk] = await (async (): Promise<[FetchResponse[], boolean]> => {
        try {
          return [await Promise.all(promises), true]
        } catch {
          return [[], false]
        }
      })()

      if (abortFetch) {
        return
      }

      if (!responseOk) {
        setPeriodState({kind: 'error'})
        return
      }

      for (const response of responses) {
        if (isNoDataResponse(response)) {
          setPeriodState({kind: 'no-data'})
          return
        }

        for (const [name, dataPoints] of Object.entries(response.alertTrends)) {
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

      const sum = Array.from(alertTrends.values()).reduce((accOuter: number, alertTrend: AlertTrend[]) => {
        const trendSum = alertTrend.reduce((accInner: number, trend: AlertTrend) => accInner + trend.y, 0)
        return accOuter + trendSum
      }, 0)

      if (sum === 0) {
        setPeriodState({kind: 'no-data'})
        return
      }

      setPeriodState({kind: 'ready', data: {alertTrends}})
    }

    async function fetchAndTime(): Promise<void> {
      window.performance.mark(alertTrendsStartMark)

      if (!groupingValues.includes(grouping)) {
        setPeriodState({kind: 'no-data'})
      } else {
        await fetchData()
      }

      window.performance.mark(alertTrendsEndMark)
    }

    if (dateIsMoreThanTwoYearsAgo(endDate)) {
      setPeriodState({kind: 'error', msg: 'Data is only available for the last 2 years'})
    } else {
      fetchAndTime()
    }

    return (): void => {
      abortFetch = true
    }
  }, [paths, startDate, endDate, query, isOpenSelected, grouping, parallelQueriesBy4Slices])

  return periodState
}

export function useTotalAlertCountData(periodState: DataState): number | undefined {
  if (isReadyState(periodState)) {
    return Array.from(periodState.data.alertTrends.values()).reduce((sum: number, trend: AlertTrend[]) => {
      const lastDataPoint = trend[trend.length - 1]
      if (!lastDataPoint) return sum + 0

      return sum + lastDataPoint.y
    }, 0)
  }
}
