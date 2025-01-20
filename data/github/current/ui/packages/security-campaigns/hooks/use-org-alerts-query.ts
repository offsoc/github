import {useQuery, type UseQueryResult} from '@tanstack/react-query'
import type {GetAlertsResponse} from '../types/get-alerts-response'
import {fetchJson} from '@github-ui/security-campaigns-shared/utils/fetch-json'
import {addGetAlertsRequestToPath, type GetAlertsRequest} from '../types/get-alerts-request'

export function useOrgAlertsQuery(path: string, request: GetAlertsRequest): UseQueryResult<GetAlertsResponse> {
  return useQuery({
    queryKey: [path, request],
    queryFn: () => {
      return fetchJson(addGetAlertsRequestToPath(path, request))
    },
  })
}
