import {useQuery, type UseQueryResult} from '@tanstack/react-query'

import {usePaths} from '../../../common/contexts/Paths'
import {fetchJson} from '../../../common/utils/fetch-json'

interface CountsResult {
  open: number
  closed: number
}

export type CountsQueryResult = UseQueryResult<CountsResult>

interface UseAlertCountsQueryParams {
  query?: string
}
export function useAlertCountsQuery({query}: UseAlertCountsQueryParams): CountsQueryResult {
  const paths = usePaths()

  let params: {[key: string]: string | number | undefined} = {
    query,
  }

  // filter empty values from object
  params = Object.fromEntries(Object.entries(params).filter(([_, v]) => v))

  return useQuery({
    queryKey: ['counts', params],
    queryFn: () => {
      const path = paths.unifiedAlertsCountsPath(params)
      return fetchJson(path)
    },
  })
}
