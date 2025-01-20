import {useQuery, type UseQueryResult} from '@tanstack/react-query'

import {usePaths} from '../../../common/contexts/Paths'
import {fetchJson} from '../../../common/utils/fetch-json'

export interface UseSecretsBypassedQueryParams {
  query: string
  startDate: string
  endDate: string
}

export interface CountsResponse {
  totalBlocksCount: number
  successfulBlocksCount: number
  bypassedAlertsCount: number
}

export interface NoDataResponse {
  noData: string
}

export type SecretsBypassedResponse = NoDataResponse | CountsResponse

export default function useSecretsBypassedQuery({
  query,
  startDate,
  endDate,
}: UseSecretsBypassedQueryParams): UseQueryResult<SecretsBypassedResponse> {
  const paths = usePaths()

  return useQuery({
    queryKey: ['secrets-bypassed', query, startDate, endDate],
    queryFn: () => {
      const path = paths.secretsBypassedPath({
        startDate,
        endDate,
        query,
      })
      return fetchJson(path)
    },
  })
}
