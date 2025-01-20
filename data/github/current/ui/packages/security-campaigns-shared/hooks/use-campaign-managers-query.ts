import {useQuery, type UseQueryResult} from '@tanstack/react-query'
import {fetchJson} from '../utils/fetch-json'
import type {User} from '../types/user'

export type SecurityManagersResult = {
  managers: User[]
}

export function useCampaignManagersQuery(path: string): UseQueryResult<SecurityManagersResult> {
  return useQuery({
    queryKey: [path],
    queryFn: () => {
      return fetchJson(path)
    },
  })
}
