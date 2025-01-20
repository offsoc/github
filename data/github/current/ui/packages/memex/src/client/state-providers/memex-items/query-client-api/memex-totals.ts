import type {QueryClient} from '@tanstack/react-query'

import type {PaginatedTotalCount} from '../../../api/memex-items/paginated-views'
import {buildPaginatedTotalCountsQueryKey, type GroupId} from '../queries/query-keys'
import type {MemexItemsTotalCountsQueryData, PaginatedMemexItemsQueryVariables} from '../queries/types'

// A default value for total counts data
const EmptyTotalCounts = {totalCount: {value: 0, isApproximate: false}, groups: {}}

/**
 * A wrapper around setQueryData for setting total counts data for a query.
 * It merges totals with existing totals to prevent subsequent pages
 * from overriding previous pages.
 * @param queryClient
 * @param variables PaginatedMemexItemsQueryVariables used in the query key
 * @param queryData The new total counts data
 */
export function mergeQueryDataForMemexItemsTotalCounts(
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
  newQueryData: Partial<MemexItemsTotalCountsQueryData>,
) {
  const queryKey = buildPaginatedTotalCountsQueryKey(variables)
  queryClient.setQueryData<MemexItemsTotalCountsQueryData>(queryKey, queryData => {
    const currentTotals = queryData ?? EmptyTotalCounts
    return {
      totalCount: newQueryData.totalCount || currentTotals?.totalCount,
      groups: {...currentTotals?.groups, ...newQueryData.groups},
    }
  })
}

/**
 * Finds the top-level totalCount object,
 * increments the value by the provided increment amount,
 * and returns the resulting totalCount object.
 * @param queryClient
 * @param variables PaginatedMemexItemsQueryVariables used in the query key
 * @param increment The amount increment (or decrement) the total count value by
 */
export function incrementMemexItemsTotalCount(
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
  increment: number,
): PaginatedTotalCount {
  const currentTotalCounts = getQueryDataForMemexItemsTotalCounts(queryClient, variables)
  const value = currentTotalCounts.totalCount.value + increment
  return {...currentTotalCounts.totalCount, value} as PaginatedTotalCount
}

/**
 * Finds the current totalCount object for a groupId,
 * increments the value by the provided increment amount,
 * and returns the resulting totalCount object for the group.
 * @param queryClient
 * @param variables PaginatedMemexItemsQueryVariables used in the query key
 * @param groupId The groupId to increment the total count for
 * @param increment The amount increment (or decrement) the total count value by
 */
export function incrementMemexItemsTotalCountForGroup(
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
  groupId: GroupId,
  increment: number,
): PaginatedTotalCount {
  const currentTotalCounts = getQueryDataForMemexItemsTotalCounts(queryClient, variables)
  const currentGroupTotal = currentTotalCounts.groups[groupId] ?? {isApproximate: false}
  const value = (currentTotalCounts.groups[groupId]?.value ?? 0) + increment
  return {...currentGroupTotal, value}
}

/**
 * A thin wrapper around getQueryData for retrieving the total counts data for a query.
 * @param queryClient
 * @param variables PaginatedMemexItemsQueryVariables used in the query key
 */
export function getQueryDataForMemexItemsTotalCounts(
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
): MemexItemsTotalCountsQueryData {
  const queryKey = buildPaginatedTotalCountsQueryKey(variables)
  return queryClient.getQueryData<MemexItemsTotalCountsQueryData>(queryKey) || EmptyTotalCounts
}
