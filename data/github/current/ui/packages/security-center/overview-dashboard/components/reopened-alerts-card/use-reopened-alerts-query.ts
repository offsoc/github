import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {useQueries, type UseQueryResult} from '@tanstack/react-query'

import {usePaths} from '../../../common/contexts/Paths'
import {fetchJson} from '../../../common/utils/fetch-json'
import {calculateTrend} from '../../../common/utils/trend-data'
import {getQueriesByFilterValue} from '../../utils/query-parser'

export interface ReopenedAlertsResult {
  count: number
}

export interface UseReopenedAlertsQueryParams {
  query: string
  startDate: string
  endDate: string
}

export type ReopenedAlertsData = {
  count: number
  isSuccess: boolean
  isPending: boolean
  isError: boolean
}

export function getTrend(currentPeriodData: ReopenedAlertsData, previousPeriodData: ReopenedAlertsData): number {
  if (currentPeriodData.isSuccess && previousPeriodData.isSuccess) {
    return calculateTrend(currentPeriodData.count, previousPeriodData.count)
  }
  return 0
}

export function resultsReducer(queries: Array<UseQueryResult<ReopenedAlertsResult>>): ReopenedAlertsData {
  const isSuccess = queries.every(query => query.isSuccess)
  const isPending = queries.some(query => query.isPending)
  const isError = queries.some(query => query.isError)

  if (!isSuccess) {
    return {count: 0, isSuccess, isPending, isError}
  }

  const results = queries.map(query => query.data)
  const totalCount = results.reduce((acc, result) => acc + result.count, 0)

  return {count: totalCount, isSuccess, isPending, isError}
}

export function useReopenedAlertsQuery({query, startDate, endDate}: UseReopenedAlertsQueryParams): ReopenedAlertsData {
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
        queryKey: ['reopened-alerts', params, startDate, endDate],
        queryFn: (): Promise<ReopenedAlertsResult> => {
          const path = paths.reopenedAlertsPath({
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
