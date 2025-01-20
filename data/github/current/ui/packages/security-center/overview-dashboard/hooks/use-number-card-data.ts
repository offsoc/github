import type {PathFunction} from '@github-ui/paths'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {useEffect, useState} from 'react'

import {calculatePreviousDateRange, dateIsMoreThanTwoYearsAgo, type DateRange} from '../../common/utils/date-period'
import {tryFetchJson} from '../../common/utils/fetch-json'
import {calculateTrend} from '../../common/utils/trend-data'
import {type DataState, isReadyState} from '../components/NumberCard'
import {getQueriesByFilterValue} from '../utils/query-parser'

type NumberCardDataProps<T> = DateRange & {
  query: string
  endpoint: PathFunction<{startDate: string; endDate: string; slice4?: string; query: string}>
  resultsReducer: (results: T[]) => number
}

export type NumberCardDataStates = {
  currentPeriodState: DataState
  previousPeriodState: DataState
  trend: number
}

export function useNumberCardData<T>({
  startDate,
  endDate,
  endpoint,
  query,
  resultsReducer,
}: NumberCardDataProps<T>): NumberCardDataStates {
  const [trend, setTrend] = useState(0)

  const currentPeriodState = useDatePeriodData({
    startDate,
    endDate,
    endpoint,
    query,
    resultsReducer,
  })
  const previousPeriodState = usePreviousDatePeriodData({
    startDate,
    endDate,
    endpoint,
    query,
    resultsReducer,
  })

  useEffect(() => {
    if (isReadyState(currentPeriodState) && isReadyState(previousPeriodState)) {
      setTrend(calculateTrend(currentPeriodState.count, previousPeriodState.count))
    }
  }, [currentPeriodState, previousPeriodState])

  return {currentPeriodState, previousPeriodState, trend}
}

function useDatePeriodData<T>({
  startDate,
  endDate,
  endpoint,
  query,
  resultsReducer,
}: NumberCardDataProps<T>): DataState {
  const [periodState, setPeriodState] = useState<DataState>({kind: 'loading'})
  const parallelQueriesPerTool = useFeatureFlag('security_center_dashboards_cards_parallel_queries_per_tool')
  const parallelQueriesBy4Slices = useFeatureFlag('security_center_dashboards_parallel_queries_by_4_slices')

  useEffect(() => {
    async function fetchData(): Promise<void> {
      setPeriodState({kind: 'loading'})

      if (parallelQueriesPerTool || parallelQueriesBy4Slices) {
        // Iterate over all resulting tools and fetch data for each tool
        const promises = getQueriesByFilterValue(query, 'tool', [
          'secret-scanning',
          'dependabot',
          'codeql',
          'third-party',
        ])
          .map(perToolPath => {
            if (parallelQueriesBy4Slices) {
              return ['0', '1', '2', '3'].map(slice => {
                const url = endpoint({startDate, endDate, slice4: slice, query: `${perToolPath}`})
                return tryFetchJson<T>(url)
              })
            } else {
              const url = endpoint({startDate, endDate, query: perToolPath})
              return [tryFetchJson<T>(url)]
            }
          })
          .flat()

        // Get all responses and check if any of them are not ok
        const res = await (async (): Promise<Array<T | null>> => {
          return await Promise.all(promises)
        })()

        const allResultsNotNull = !res.some(result => result == null)

        if (allResultsNotNull) {
          const count = resultsReducer(res as T[])
          setPeriodState({kind: 'ready', count})
        } else {
          setPeriodState({kind: 'error', msg: 'Failed to fetch data'})
        }
      } else {
        const url = endpoint({startDate, endDate, query})
        // Non-parallel cards all use the same return type
        const data = await tryFetchJson<{count: number}>(url)

        if (data == null) {
          setPeriodState({kind: 'error', msg: 'Failed to fetch data'})
        } else {
          setPeriodState({kind: 'ready', count: data.count})
        }
      }
    }

    if (dateIsMoreThanTwoYearsAgo(endDate)) {
      setPeriodState({kind: 'error', msg: 'Data is only available for the last 2 years'})
    } else {
      fetchData()
    }
  }, [startDate, endDate, endpoint, query, parallelQueriesPerTool, parallelQueriesBy4Slices, resultsReducer])

  return periodState
}

function usePreviousDatePeriodData<T>({
  startDate,
  endDate,
  endpoint,
  query,
  resultsReducer,
}: NumberCardDataProps<T>): DataState {
  const previousDateRange = calculatePreviousDateRange(startDate, endDate)
  return useDatePeriodData({
    startDate: previousDateRange.startDate,
    endDate: previousDateRange.endDate,
    endpoint,
    query,
    resultsReducer,
  })
}
