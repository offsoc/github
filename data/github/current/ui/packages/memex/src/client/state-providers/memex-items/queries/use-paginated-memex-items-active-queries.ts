import {useQueries, useQueryClient, type UseQueryOptions, type UseQueryResult} from '@tanstack/react-query'
import {useMemo, useRef} from 'react'

import {useEnabledFeatures} from '../../../hooks/use-enabled-features'
import {useColumnsStableContext} from '../../columns/use-columns-stable-context'
import {useUpdateLoadedColumns} from '../../columns/use-update-loaded-columns'
import {buildGroupValuesFromQueryData} from '../query-client-api/memex-groups'
import {nextPlaceholderPageInfo} from '../query-client-api/page-params'
import {GroupedItemBatchRequestResolver, paginatedViewRequestResolverFactory} from './paginated-view-request-resolver'
import {isPageParamsDataGrouped, isPageParamsDataGroupedWithSecondaryGroups} from './query-data-helpers'
import type {GroupedItemBatchQueryKey, PageType, PaginatedMemexItemsQueryKey} from './query-keys'
import {
  buildGroupedItemBatchQueryKey,
  buildMemexItemsOrGroupsQueryKey,
  createGroupedItemsPageTypeFromGroupedItemsId,
  isPageOfItems,
  pageTypeForGroups,
  pageTypeForSecondaryGroups,
  pageTypeForUngroupedItems,
} from './query-keys'
import {
  type GroupedItemBatchPageQueryData,
  type MemexPageQueryData,
  type PageParam,
  pageParamForNextPlaceholder,
  type PageParamsQueryData,
  type PaginatedMemexItemsQueryVariables,
} from './types'
import {useMemexItemsPageParams} from './use-memex-items-page-params'
import {useNextPlaceholderQuery} from './use-next-placeholder-query'

type UsePaginatedMemexItemsActiveQueriesReturnType = {
  queryKeys: Array<PaginatedMemexItemsQueryKey>
  queries: Array<UseQueryResult<MemexPageQueryData>>
  groupedItemBatchesQueryKeys: Array<GroupedItemBatchQueryKey>
  groupedItemBatchesQueries: Array<UseQueryResult<GroupedItemBatchPageQueryData>>
}

/**
 * Based on data stored in the `pageParamsQueryData` query, this hook
 * builds up a list of options to pass to `useQueries`, so that we can dynamically
 * monitor multiple queries representing memex items data.
 * @param variables PaginatedMemexItemsQueryVariables to use in QueryKey
 * @returns UsePaginatedMemexItemsActiveQueriesReturnType
 */
export function usePaginatedMemexItemsActiveQueries(
  variables: PaginatedMemexItemsQueryVariables,
): UsePaginatedMemexItemsActiveQueriesReturnType {
  const {memex_mwl_swimlanes} = useEnabledFeatures()
  const {pageParamsQueryData} = useMemexItemsPageParams(variables)
  const groupedItemBatchesResult = memex_mwl_swimlanes
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      useGroupedItemBatchesQueries(variables, pageParamsQueryData)
    : {groupedItemBatchesQueries: [], groupedItemBatchesQueryKeys: []}
  return {
    ...useItemsAndGroupsQueries(variables, pageParamsQueryData),
    ...groupedItemBatchesResult,
  }
}

function useItemsAndGroupsQueries(
  variables: PaginatedMemexItemsQueryVariables,
  pageParamsQueryData: PageParamsQueryData,
) {
  const queryClient = useQueryClient()
  const {updateMemexItemsNextPlaceholderQuery, updateMemexGroupsNextPlaceholderQuery} =
    useNextPlaceholderQuery(variables)
  const {updateLoadedColumns} = useUpdateLoadedColumns()
  const {loadedFieldIdsRef} = useColumnsStableContext()

  // Build up a set of options to pass to useQueries
  const queries = useMemo(() => {
    const options: Array<UseQueryOptions<MemexPageQueryData>> = []
    // This will be a flat list of query keys (in this case just the groupId + pageIndex pairs) for
    // all queries/pages that we want to monitor.
    const queryKeys = buildQueryKeysFromPageParamsQueryData(pageParamsQueryData)
    const groupValuesMap = buildGroupValuesFromQueryData(queryClient)
    for (const {pageType, pageParam} of queryKeys) {
      options.push({
        queryKey: buildMemexItemsOrGroupsQueryKey(variables, pageType, pageParam),
        queryFn: async ({signal}) => {
          if (pageParam === pageParamForNextPlaceholder) {
            // We never want to be making a request for this query, as it is just a placeholder
            return {nodes: [], pageInfo: nextPlaceholderPageInfo, totalCount: {value: 0, isApproximate: false}}
          }

          const requestResolver = paginatedViewRequestResolverFactory(variables, groupValuesMap, pageType, pageParam)
          const response = await requestResolver.fetchData(signal)
          // if we abort, then there is nothing to do with what was fetched, so return dummy content to appease
          // typescript (see https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation)
          if (signal.aborted) {
            return {nodes: [], pageInfo: nextPlaceholderPageInfo, totalCount: {value: 0, isApproximate: false}}
          }

          requestResolver.handleResponse(queryClient)

          const {totalCount, ...responseWithoutTotalCount} = response

          if ('groups' in responseWithoutTotalCount) {
            // Handle next_placeholder data for top-level groups, if any exist
            updateMemexGroupsNextPlaceholderQuery(responseWithoutTotalCount)
          } else if (isPageOfItems(pageType)) {
            // Handle next_placeholder data for items, if any exist
            updateMemexItemsNextPlaceholderQuery(responseWithoutTotalCount, pageType)
          }

          // Mark requested fields as loaded
          for (const id of variables.fieldIds || []) {
            if (loadedFieldIdsRef.current.has(id)) {
              continue
            }
            updateLoadedColumns(id)
          }

          return requestResolver.queryData()
        },
        structuralSharing: false,
        staleTime: Infinity,
      })
    }
    return options
  }, [
    loadedFieldIdsRef,
    pageParamsQueryData,
    queryClient,
    updateLoadedColumns,
    updateMemexGroupsNextPlaceholderQuery,
    updateMemexItemsNextPlaceholderQuery,
    variables,
  ])

  const queryKeys = useMemo(() => queries.map(q => (q.queryKey as PaginatedMemexItemsQueryKey) || []), [queries])
  const queryResults = useQueries({
    queries,
  })
  const memoizedQueries = useQueriesMemo(queryResults)

  // The queries that are returned by `useQueries` do not have any information about their own query keys,
  // so we return the queryKeys alongside them so that downstream consumers can map back and forth by index
  return {
    queries: memoizedQueries,
    queryKeys,
  }
}

function useGroupedItemBatchesQueries(
  variables: PaginatedMemexItemsQueryVariables,
  pageParamsQueryData: PageParamsQueryData,
) {
  const {updateMemexGroupsNextPlaceholderQuery} = useNextPlaceholderQuery(variables)
  const queryClient = useQueryClient()

  const queries = useMemo(() => {
    const options: Array<UseQueryOptions<GroupedItemBatchPageQueryData>> = []

    if (isPageParamsDataGroupedWithSecondaryGroups(pageParamsQueryData)) {
      for (const groupedItemsBatch of pageParamsQueryData.groupedItemBatches) {
        options.push({
          queryKey: buildGroupedItemBatchQueryKey(variables, groupedItemsBatch),
          queryFn: async ({signal}) => {
            const requestResolver = new GroupedItemBatchRequestResolver(variables, groupedItemsBatch)
            const response = await requestResolver.fetchData(signal)
            updateMemexGroupsNextPlaceholderQuery(response)
            requestResolver.handleResponse(queryClient)

            // We don't actually care to store anything in this query - we're only using it
            // for the side-effects; however, `react-query` will complain if we have a
            // query that doesn't return anything.
            return groupedItemsBatch
          },
          structuralSharing: false,
          staleTime: Infinity,
        })
      }
    }

    return options
  }, [pageParamsQueryData, queryClient, updateMemexGroupsNextPlaceholderQuery, variables])

  const groupedItemBatchesQueryKeys = useMemo(() => queries.map(q => q.queryKey as GroupedItemBatchQueryKey), [queries])
  const queryResults = useQueries({
    queries,
  })
  const groupedItemBatchesQueries = useQueriesMemo(queryResults)

  // The queries that are returned by `useQueries` do not have any information about their own query keys,
  // so we return the queryKeys alongside them so that downstream consumers can map back and forth by index
  return {
    groupedItemBatchesQueries,
    groupedItemBatchesQueryKeys,
  }
}

/**
 * Builds a set of query keys based on a PageParamsQueryData object.
 * For ungrouped data, we return an array of {pageType: pageTypeForUngroupedItems, pageParam: pageParam} for each entry
 * in our pageParamsQueryData.pageParams.
 * .
 * For grouped data, we return an array of {pageType: pageTypeForGroups, pageParam: pageParam} for each entry, and
 * we also return keys for each individual group's pageParams.
 * We do this by building a map of groupId -> pageParams, and then returning
 * {pageType: PageTypeForGroupedItems, pageParam: pageParam} for each pageParam of each group.
 */
function buildQueryKeysFromPageParamsQueryData(
  pageParamsQueryData: PageParamsQueryData,
): Array<{pageType: PageType; pageParam: PageParam}> {
  if (isPageParamsDataGrouped(pageParamsQueryData)) {
    const queryKeysForItems = Object.entries(pageParamsQueryData.groupedItems).flatMap(([groupId, pageParams]) =>
      pageParams.map(pageParam => ({pageType: createGroupedItemsPageTypeFromGroupedItemsId(groupId), pageParam})),
    )
    const queryKeysForGroups = pageParamsQueryData.pageParams.map(
      pageParam =>
        ({
          pageType: pageTypeForGroups,
          pageParam,
        }) as const,
    )

    const queryKeysForSecondaryGroups = isPageParamsDataGroupedWithSecondaryGroups(pageParamsQueryData)
      ? pageParamsQueryData.secondaryGroups.map(
          pageParam =>
            ({
              pageType: pageTypeForSecondaryGroups,
              pageParam,
            }) as const,
        )
      : []

    return [...queryKeysForItems, ...queryKeysForGroups, ...queryKeysForSecondaryGroups]
  } else {
    return pageParamsQueryData.pageParams.map(pageParam => ({pageType: pageTypeForUngroupedItems, pageParam}))
  }
}

/**
 * `useQueries` returns an array of `UseQueryResult` objects. The array returned here
 * will be a new object each time, which makes it impossible the use the return value
 * in the dependencies of any downstream `useMemo`s. This function works around
 * this behavior by using a custom algorithm for determining whether or not to return a new array
 * based on `data` attributes of each item in the array, which is what we want to use
 * to indicate we need to re-memoize because something about the items has changed.
 */
function useQueriesMemo<T>(queriesResultArray: Array<UseQueryResult<T>>) {
  // this holds reference to previous value - it will only change if
  // the number of queries in the array changes or the data of a query changes
  const stableQueriesArrayRef = useRef<Array<UseQueryResult<T>>>([])
  // check if the queries length is the same and the data in each query is the same
  const areArraysConsideredTheSame =
    stableQueriesArrayRef.current && queriesResultArray.length === stableQueriesArrayRef.current.length
      ? queriesResultArray.every((element, i) => {
          const dataAtIndexIsTheSame =
            stableQueriesArrayRef.current && element.data === stableQueriesArrayRef.current[i]?.data

          if (dataAtIndexIsTheSame) {
            // Even though the data is the same, we could have a new query result here, so let's update the reference
            // of the stableQueriesArrayRef for this query result.

            // If the data is not the same, then we will replace the entire stableQueriesArrayRef below.
            stableQueriesArrayRef.current[i] = element
          }

          return dataAtIndexIsTheSame
        })
      : false

  //only update the ref tracking the queries array if they are different
  if (!areArraysConsideredTheSame) {
    stableQueriesArrayRef.current = queriesResultArray
  }
  return stableQueriesArrayRef.current
}
