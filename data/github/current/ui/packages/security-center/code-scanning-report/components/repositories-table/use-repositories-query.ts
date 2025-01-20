import {useQuery, type UseQueryResult} from '@tanstack/react-query'

import {usePaths} from '../../../common/contexts/Paths'
import {fetchJson} from '../../../common/utils/fetch-json'
import type {Sort} from './SortHeader'

export interface RepositoryRow {
  id: string
  displayName: string
  href: string
  countUnresolved: number
  countDismissed: number
  countFixedWithoutAutofix: number
  countFixedWithAutofix: number
}

interface RepositoriesResult {
  items: RepositoryRow[]
  previous?: string
  next?: string
}

interface UseRepositoriesQueryParams {
  query: string
  startDate: string
  endDate: string
  cursor?: string
  sort?: Sort<RepositoryRow>
}
export default function useRepositoriesQuery({
  query,
  startDate,
  endDate,
  cursor,
  sort,
}: UseRepositoriesQueryParams): UseQueryResult<RepositoriesResult> {
  const paths = usePaths()

  return useQuery({
    queryKey: ['repositories', query, startDate, endDate, cursor, sort, sort?.field, sort?.direction],
    queryFn: () => {
      const path = paths.codeScanningRepositoriesPath({
        query,
        startDate,
        endDate,
        cursor,
        sortField: sort?.field,
        sortDirection: sort?.direction,
      })
      return fetchJson(path)
    },
  })
}
