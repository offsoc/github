import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {useQueries, type UseQueryResult} from '@tanstack/react-query'

import {usePaths} from '../../../common/contexts/Paths'
import {fetchJson} from '../../../common/utils/fetch-json'
import {getQueriesByFilterValue} from '../../utils/query-parser'

export interface AlertActivity {
  date: string
  endDate: string
  closed: number
  opened: number
}

export interface AlertActivityResult {
  data: AlertActivity[]
}

export type AlertActivityData = {
  data: AlertActivity[]
  sum: number
}

export interface UseAlertActivityQueryParams {
  query: string
  startDate: string
  endDate: string
}

export interface SliceQueryParams {
  slice: string
  query: string
}

export function useAlertActivityData(fetchData: Array<UseQueryResult<AlertActivityResult>>): AlertActivityData {
  const isSuccess = fetchData.every(result => result.isSuccess)
  if (isSuccess) {
    // Iterate over each result and accumulate it in perToolData array of type AlertActivityChartData
    // Each result json will contain same array of elements
    // {date: 'Sep 25', endDate: 'Sep 28', closed: 0, opened: 0}
    // So we need to combine the dates into 1 array and sum the closed and open values

    const perToolData = fetchData.map(r => r.data.data)
    // Combine the perToolData sub-arrays by date key into 1 array, and add up open and closed counts by day
    const combinedData: AlertActivity[] = perToolData
      .reduce((acc: AlertActivity[], cur: AlertActivity[]) => acc.concat(cur), []) // combine all sub-arrays into one
      .reduce((acc: AlertActivity[], cur: AlertActivity) => {
        // Accumulate into separate array, which discoveres duplicates (by date) in the combined array and adds them together
        const date = cur.date
        const existing = acc.find(d => d.date === date)
        if (existing) {
          existing.closed += cur.closed
          existing.opened += cur.opened
        } else {
          // Set up a new element, which will also contain endDate
          acc.push(cur)
        }
        return acc
      }, [])

    // Sum all closed and open values, and if the sum is 0, then set no data to true.
    const sumClosed = combinedData.reduce((acc: number, cur: AlertActivity) => acc + cur.closed, 0)
    const sumOpened = combinedData.reduce((acc: number, cur: AlertActivity) => acc + cur.opened, 0)
    const sum = sumClosed + sumOpened

    return {data: combinedData, sum}
  }
  return {data: [], sum: 0}
}

export function useAlertActivityQuery({
  query,
  startDate,
  endDate,
}: UseAlertActivityQueryParams): Array<UseQueryResult<AlertActivityResult>> {
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
        queryKey: ['alert-activity', params, startDate, endDate],
        queryFn: (): Promise<AlertActivityResult> => {
          const path = paths.alertActivityPath({
            startDate,
            endDate,
            ...params,
          })
          return fetchJson(path)
        },
      }
    }),
  })

  return dataQueries
}
