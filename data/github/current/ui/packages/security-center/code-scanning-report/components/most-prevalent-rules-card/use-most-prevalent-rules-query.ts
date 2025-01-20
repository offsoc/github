import {useQuery, type UseQueryResult} from '@tanstack/react-query'

import {usePaths} from '../../../common/contexts/Paths'
import {fetchJson} from '../../../common/utils/fetch-json'

export interface MostPrevalentRulesResult {
  items: Array<{
    ruleName: string
    ruleSarifIdentifier: string
    count: number
  }>
  previous?: string
  next?: string
}

export interface UseMostPrevalentRulesQueryParams {
  query: string
  startDate: string
  endDate: string
  cursor?: string
  pageSize: number
  enabled?: boolean
}
export default function useMostPrevalentRulesQuery({
  query,
  startDate,
  endDate,
  cursor,
  pageSize,
  enabled = true,
}: UseMostPrevalentRulesQueryParams): UseQueryResult<MostPrevalentRulesResult> {
  const paths = usePaths()

  return useQuery({
    enabled,
    queryKey: ['most-prevalent-rules', query, startDate, endDate, cursor, pageSize],
    queryFn: () => {
      const path = paths.codeScanningMostPrevalentRulesPath({
        query,
        startDate,
        endDate,
        cursor,
        pageSize,
      })
      return fetchJson(path)
    },
  })
}
