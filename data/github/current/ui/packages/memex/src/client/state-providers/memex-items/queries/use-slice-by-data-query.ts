import {useQuery} from '@tanstack/react-query'

import {buildSliceDataQueryKey} from './query-keys'
import type {SliceByQueryData} from './types'
import {usePaginatedMemexItemsQueryVariables} from './use-paginated-memex-items-query-variables'

export function useSliceByDataQuery() {
  const variables = usePaginatedMemexItemsQueryVariables({withSliceByValue: false})
  const query = useQuery({
    queryKey: buildSliceDataQueryKey(variables),
    enabled: false,
    queryFn: () => {
      // We don't expect to use this queryFn, but by providing it we can
      // properly type the data returned by this query.
      return {
        slices: [],
      } as SliceByQueryData
    },
  })

  return query
}
