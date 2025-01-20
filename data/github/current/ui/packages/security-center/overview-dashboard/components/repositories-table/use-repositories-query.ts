import {useQuery, type UseQueryResult} from '@tanstack/react-query'

import {usePaths} from '../../../common/contexts/Paths'
import {fetchJson} from '../../../common/utils/fetch-json'

export interface Repository {
  id: number
  repository: string
  ownerType: string
  total: number
  critical: number
  high: number
  medium: number
  low: number
}

interface RepositoriesResult {
  repositories: Repository[]
  urlInfo: {[repositoryId: number]: string}
}

export interface UseRepositoriesQueryParams {
  query: string
  startDate: string
  endDate: string
}

export default function useRepositoriesQuery({
  query,
  startDate,
  endDate,
}: UseRepositoriesQueryParams): UseQueryResult<RepositoriesResult> {
  const paths = usePaths()

  return useQuery({
    queryKey: ['repositories', query, startDate, endDate],
    queryFn: () => {
      const path = paths.repositoriesPath({
        query,
        startDate,
        endDate,
      })
      return fetchJson(path)
    },
  })
}
