import {useQuery, type UseQueryResult} from '@tanstack/react-query'

import {usePaths} from '../../../common/contexts/Paths'
import {fetchJson} from '../../../common/utils/fetch-json'

interface AlertsFixedResult {
  count: number
  percentage: number
}

export interface UseAlertsFixedQueryParams {
  query: string
  startDate: string
  endDate: string
}
export default function useAlertsFixedQuery({
  query,
  startDate,
  endDate,
}: UseAlertsFixedQueryParams): UseQueryResult<AlertsFixedResult> {
  const paths = usePaths()

  return useQuery({
    queryKey: ['alerts-fixed', query, startDate, endDate],
    queryFn: () => {
      const path = paths.codeScanningAlertsFixedPath({
        query,
        startDate,
        endDate,
      })
      return fetchJson(path)
    },
  })
}
