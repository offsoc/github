import {useQuery, type UseQueryResult} from '@tanstack/react-query'

import {usePaths} from '../../../common/contexts/Paths'
import {fetchJson} from '../../../common/utils/fetch-json'

interface RemediationRatesResult {
  percentFixedWithAutofixSuggested: number
  percentFixedWithNoAutofixSuggested: number
}

export interface UseRemediationRatesQueryParams {
  query: string
  startDate: string
  endDate: string
}
export default function useRemediationRatesQuery({
  query,
  startDate,
  endDate,
}: UseRemediationRatesQueryParams): UseQueryResult<RemediationRatesResult> {
  const paths = usePaths()

  return useQuery({
    queryKey: ['remediation-rates', query, startDate, endDate],
    queryFn: () => {
      const path = paths.codeScanningRemediationRatesPath({
        query,
        startDate,
        endDate,
      })
      return fetchJson(path)
    },
  })
}
