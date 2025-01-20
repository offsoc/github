import {useQuery, type UseQueryResult} from '@tanstack/react-query'
import {fetchJson} from '@github-ui/security-campaigns-shared/utils/fetch-json'
import type {Repository} from '@github-ui/security-campaigns-shared/types/repository'

interface UseAlertsSummaryQueryParams {
  query?: string
}

export type AlertsSummaryResponseItem = {
  repository: Repository
  alertCount: number
}

export type AlertsSummaryResponse = {
  repositories: AlertsSummaryResponseItem[]
}

export function useAlertsSummaryQuery(
  path: string,
  params: UseAlertsSummaryQueryParams,
): UseQueryResult<AlertsSummaryResponse> {
  return useQuery({
    queryKey: [path, params],
    queryFn: () => {
      const url = new URL(path, window.location.origin)
      url.searchParams.set('query', params.query ?? '')
      // Do not include the hostname since we're always on the same domain
      return fetchJson(`${url.pathname}?${url.searchParams.toString()}`)
    },
  })
}
