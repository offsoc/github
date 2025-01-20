import {useQuery, type UseQueryResult} from '@tanstack/react-query'

import {usePaths} from '../../../common/contexts/Paths'
import {fetchJson} from '../../../common/utils/fetch-json'

interface AutofixSuggestionsResult {
  count: number
  percentage: number
}

export interface UseAutofixSuggestionsQueryParams {
  query: string
  startDate: string
  endDate: string
}
export default function useAutofixSuggestionsQuery({
  query,
  startDate,
  endDate,
}: UseAutofixSuggestionsQueryParams): UseQueryResult<AutofixSuggestionsResult> {
  const paths = usePaths()

  return useQuery({
    queryKey: ['autofix-suggestions', query, startDate, endDate],
    queryFn: () => {
      const path = paths.codeScanningAutofixSuggestionsPath({
        query,
        startDate,
        endDate,
      })
      return fetchJson(path)
    },
  })
}
