import {useQuery, type UseQueryResult} from '@tanstack/react-query'

import {usePaths} from '../../../common/contexts/Paths'
import {fetchJson} from '../../../common/utils/fetch-json'

interface AlertsFoundResult {
  count: number
}

export interface UseAlertsFoundQueryParams {
  query: string
  startDate: string
  endDate: string
}
export default function useAlertsFoundQuery({
  query,
  startDate,
  endDate,
}: UseAlertsFoundQueryParams): UseQueryResult<AlertsFoundResult> {
  const paths = usePaths()

  return useQuery({
    queryKey: ['alerts-found', query, startDate, endDate],
    queryFn: () => {
      const path = paths.codeScanningAlertsFoundPath({
        query,
        startDate,
        endDate,
      })
      return fetchJson(path)
    },
  })
}
