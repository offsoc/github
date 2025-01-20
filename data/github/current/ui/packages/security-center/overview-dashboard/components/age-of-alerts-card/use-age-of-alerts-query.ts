import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {useQueries, type UseQueryResult} from '@tanstack/react-query'

import {usePaths} from '../../../common/contexts/Paths'
import {fetchJson} from '../../../common/utils/fetch-json'
import {calculateTrend} from '../../../common/utils/trend-data'
import {getQueriesByFilterValue} from '../../utils/query-parser'

export interface AgeOfAlertsResult {
  count: number
  value: number
  alertCount: number
}

export interface UseAgeOfAlertsQueryParams {
  query: string
  startDate: string
  endDate: string
}

export type AgeOfAlertsData = {
  count: number
  isSuccess: boolean
  isPending: boolean
  isError: boolean
}

export function getTrend(currentPeriodData: AgeOfAlertsData, previousPeriodData: AgeOfAlertsData): number {
  if (currentPeriodData.isSuccess && previousPeriodData.isSuccess) {
    return calculateTrend(currentPeriodData.count, previousPeriodData.count)
  }
  return 0
}

export function resultsReducer(queries: Array<UseQueryResult<AgeOfAlertsResult>>): AgeOfAlertsData {
  const isSuccess = queries.every(query => query.isSuccess)
  const isPending = queries.some(query => query.isPending)
  const isError = queries.some(query => query.isError)

  if (!isSuccess) {
    return {count: 0, isSuccess, isPending, isError}
  }

  const results = queries.map(query => query.data)

  // single fetch returns a single result
  if (results.length === 1) {
    const result = results[0] as AgeOfAlertsResult
    return {count: result.count, isSuccess, isPending, isError}
  }

  const totalAge = results.reduce((acc, result) => acc + result.value * result.alertCount, 0)
  const alertCount = results.reduce((acc, result) => acc + result.alertCount, 0)
  const totalCount = alertCount === 0 ? 0 : Math.round(totalAge / alertCount)

  return {count: totalCount, isSuccess, isPending, isError}
}

export function useAgeOfAlertsQuery({query, startDate, endDate}: UseAgeOfAlertsQueryParams): AgeOfAlertsData {
  const parallelQueriesPerTool = useFeatureFlag('security_center_dashboards_cards_parallel_queries_per_tool')
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
  } else if (parallelQueriesPerTool) {
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
  } else {
    // no parallelization, single fetch
    sliceParams.push({query})
  }

  const paths = usePaths()

  const dataQueries = useQueries({
    queries: sliceParams.map(params => {
      return {
        queryKey: ['age-of-alerts', params, startDate, endDate],
        queryFn: (): Promise<AgeOfAlertsResult> => {
          const path = paths.ageOfAlertsPath({
            startDate,
            endDate,
            ...params,
          })
          return fetchJson(path)
        },
      }
    }),
  })

  return resultsReducer(dataQueries)
}
