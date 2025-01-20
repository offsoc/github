import {useQuery, type UseQueryResult} from '@tanstack/react-query'

import {usePaths} from '../../../common/contexts/Paths'
import {fetchJson} from '../../../common/utils/fetch-json'

interface AlertsFixedWithAutofixResult {
  accepted: number
  suggested: number
}

export interface UseAlertsFixedWithAutofixQueryParams {
  query: string
  startDate: string
  endDate: string
}
export default function useAlertsFixedWithAutofixQuery({
  query,
  startDate,
  endDate,
}: UseAlertsFixedWithAutofixQueryParams): UseQueryResult<AlertsFixedWithAutofixResult> {
  const paths = usePaths()

  return useQuery({
    queryKey: ['alerts-fixed-with-autofix', query, startDate, endDate],
    queryFn: () => {
      const path = paths.codeScanningAlertsFixedWithAutofixPath({
        query,
        startDate,
        endDate,
      })
      return fetchJson(path)
    },
  })
}
