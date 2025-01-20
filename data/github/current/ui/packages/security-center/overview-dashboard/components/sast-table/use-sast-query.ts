import {useQuery, type UseQueryResult} from '@tanstack/react-query'

import {usePaths} from '../../../common/contexts/Paths'
import {fetchJson} from '../../../common/utils/fetch-json'

export interface SastData {
  countOpenAlerts: number
  cwes: string[]
  name: string
  severity: string
}

interface SastResult {
  data: SastData[]
}

export interface UseSastQueryParams {
  query: string
  startDate: string
  endDate: string
}

export default function useSastQuery({query, startDate, endDate}: UseSastQueryParams): UseQueryResult<SastResult> {
  const paths = usePaths()

  return useQuery({
    queryKey: ['sast', query, startDate, endDate],
    queryFn: () => {
      const path = paths.sastPath({
        query,
        startDate,
        endDate,
      })
      return fetchJson(path)
    },
  })
}
