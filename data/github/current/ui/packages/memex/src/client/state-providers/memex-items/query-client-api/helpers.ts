import type {QueryClient} from '@tanstack/react-query'

import {getEnabledFeatures} from '../../../helpers/feature-flags'
import {paginatedMemexItemsQueryKey} from '../queries/query-keys'
import {useMemexItemsQuery} from '../queries/use-memex-items-query'

export function getPaginatedQueryKeyWithVariables(queryClient: QueryClient) {
  const keyWithoutVariables = [paginatedMemexItemsQueryKey]
  const queryCache = queryClient.getQueryCache()
  const firstActiveQuery = queryCache.find({
    queryKey: keyWithoutVariables,
    exact: false,
    type: 'active',
  })
  if (!firstActiveQuery) {
    // We should not be in this state when normally interacting
    // with the query-client-api, however for tests, we don't always have an active query.
    return keyWithoutVariables
  }
  // We only want to return the first two elements of the query key, which are the
  // primary query key and the variables. We don't want to include the groupId or the pageParam
  return firstActiveQuery.queryKey.slice(0, 2)
}

export function getKey(queryClient: QueryClient) {
  const {memex_table_without_limits} = getEnabledFeatures()
  return memex_table_without_limits ? getPaginatedQueryKeyWithVariables(queryClient) : useMemexItemsQuery.getKey()
}
