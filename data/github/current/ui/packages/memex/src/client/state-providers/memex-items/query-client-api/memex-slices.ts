import type {QueryClient} from '@tanstack/react-query'

import {buildSliceDataQueryKey} from '../queries/query-keys'
import type {PaginatedMemexItemsQueryVariables, SliceByQueryData, SliceByQueryVariables} from '../queries/types'

export function setSliceByQueryData(
  queryClient: QueryClient,
  variables: SliceByQueryVariables | PaginatedMemexItemsQueryVariables,
  queryData: SliceByQueryData,
) {
  const variablesWithoutSliceValue = {...variables, sliceByValue: undefined}
  queryClient.setQueryData(buildSliceDataQueryKey(variablesWithoutSliceValue), queryData)
}
