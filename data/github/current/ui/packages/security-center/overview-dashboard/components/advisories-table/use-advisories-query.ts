import {useQuery, type UseQueryResult} from '@tanstack/react-query'

import {usePaths} from '../../../common/contexts/Paths'
import {fetchJson} from '../../../common/utils/fetch-json'

export interface Advisory {
  summary: string
  cveId: string | undefined
  ghsaId: string
  ecosystem: string
  openAlerts: number
  severity: string
}

interface AdvisoriesResult {
  advisories: Advisory[]
}

export interface UseAdvisoriesQueryParams {
  query: string
  startDate: string
  endDate: string
}

export default function useAdvisoriesQuery({
  query,
  startDate,
  endDate,
}: UseAdvisoriesQueryParams): UseQueryResult<AdvisoriesResult> {
  const paths = usePaths()

  return useQuery({
    queryKey: ['advisories', query, startDate, endDate],
    queryFn: () => {
      const path = paths.advisoriesPath({
        query,
        startDate,
        endDate,
      })
      return fetchJson(path)
    },
  })
}
