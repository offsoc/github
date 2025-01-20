import type {QueryKey, UseQueryResult} from '@tanstack/react-query'
import {hashKey, useQueryClient} from '@tanstack/react-query'
import {useCallback, useMemo} from 'react'

import {getQueryDataForMemexItemsTotalCounts} from '../query-client-api/memex-totals'
import {invalidateInactiveInitialQueries} from '../query-client-api/page-params'
import {isPageParamsDataGrouped, isPageParamsDataGroupedWithSecondaryGroups} from './query-data-helpers'
import {
  buildGroupedItemBatchQueryKey,
  buildGroupedMemexItemsQueryKey,
  createGroupedItemsId,
  getPageTypeFromQueryKey,
  type GroupedItemBatchQueryKey,
  type GroupId,
  isPageTypeForGroupedItems,
  isQueryKeyForGroups,
  isQueryKeyForSecondaryGroups,
  type PageTypeForGroupedItems,
  type PaginatedMemexItemsQueryKey,
} from './query-keys'
import {
  type GroupedItemBatchPageParam,
  type GroupedItemBatchPageQueryData,
  type GroupedPageParamsQueryData,
  type MemexGroupsPageQueryData,
  type MemexItemsPageQueryData,
  type MemexItemsTotalCountsQueryData,
  type MemexPageQueryData,
  type PageParam,
  pageParamForInitialPage,
  pageParamForNextPlaceholder,
  type PaginatedGroupQueryData,
  type PaginatedMemexItemsQueryVariables,
  type WithTotal,
} from './types'
import {useMemexItemsPageParams} from './use-memex-items-page-params'
import {useNextPlaceholderQuery} from './use-next-placeholder-query'
import {usePaginatedMemexItemsActiveQueries} from './use-paginated-memex-items-active-queries'
import {usePaginatedMemexItemsQueryVariables} from './use-paginated-memex-items-query-variables'

export function usePaginatedMemexItemsQuery() {
  const variables = usePaginatedMemexItemsQueryVariables({withSliceByValue: true})
  const {queries, queryKeys, groupedItemBatchesQueries, groupedItemBatchesQueryKeys} =
    usePaginatedMemexItemsActiveQueries(variables)
  const queryClient = useQueryClient()
  const totalCounts = getQueryDataForMemexItemsTotalCounts(queryClient, variables)

  // Our queries from usePaginatedMemexItemsActiveQueries can be 1 of 2 types:
  // 1. A query for a page of memex items (queriesForItems: Array<MemexItemsPageQueryData>)
  // 2. A query for a page of groups (queriesForGroups: Array<MemexGroupsPageQueryData>)
  // We need to separate these into 2 arrays, so that consumers of this hook can easily
  // stitch together items data based on those pages, but also provide access to the
  // groups pages for looking up information about the groups and their `pageInfo`.
  const {
    queriesForItems,
    queryKeysForItems,
    queriesForGroups,
    queryKeysForGroups,
    queriesForSecondaryGroups,
    queryKeysForSecondaryGroups,
  } = useMemo(() => {
    return separateQueriesForItemsAndGroups(queries, queryKeys)
  }, [queries, queryKeys])

  const data = useMemo(
    () =>
      queriesForItems.map(
        pageQuery => pageQuery.data || {nodes: [], pageInfo: {hasNextPage: false, hasPreviousPage: false}},
      ),
    [queriesForItems],
  )

  const {groupedItemQueries, groupsById} = useMemo(() => {
    return {
      // If we aren't grouped, we don't need to call buildGroupedItemQueries
      groupedItemQueries:
        queriesForGroups.length === 0 ? {} : buildGroupedItemQueries(queriesForItems, queryKeysForItems),
      groupsById: buildGroupsById([...queriesForGroups, ...queriesForSecondaryGroups], totalCounts),
    }
  }, [queriesForGroups, queriesForItems, queriesForSecondaryGroups, queryKeysForItems, totalCounts])

  const result = {
    data,
    queriesForItems,
    queryKeysForItems,
    queriesForGroups,
    queryKeysForGroups,
    queriesForSecondaryGroups,
    queryKeysForSecondaryGroups,
    groupedItemQueries,
    groupsById,
    ...useMemexItemsPagination(queriesForItems, queriesForGroups, variables),
    ...useMemexItemsSecondaryGroupsPagination(queriesForSecondaryGroups, variables),
    ...useMemexItemsGroupPagination(queriesForItems, queryKeysForItems, variables),
    ...useGroupedItemBatchesPagination(
      groupedItemBatchesQueryKeys,
      groupedItemBatchesQueries,
      queriesForGroups,
      queriesForSecondaryGroups,
      variables,
    ),
    ...useInvalidateAllQueries(
      queryKeysForItems,
      queryKeysForGroups,
      queryKeysForSecondaryGroups,
      groupedItemBatchesQueryKeys,
      variables,
    ),
    totalCount: totalCounts?.totalCount,
  }
  return result
}

function useMemexItemsPagination(
  itemQueries: Array<UseQueryResult<MemexItemsPageQueryData>>,
  groupQueries: Array<UseQueryResult<MemexGroupsPageQueryData>>,
  variables: PaginatedMemexItemsQueryVariables,
) {
  const {getPageParamsQueryData, setPageParamsQueryData} = useMemexItemsPageParams(variables)
  const currentPageParamsQueryData = getPageParamsQueryData()
  // Decide if working with pages of groups or pages of ungrouped items
  const queriesArray = isPageParamsDataGrouped(currentPageParamsQueryData) ? groupQueries : itemQueries
  // Get last page query
  const indexOfLastPage = currentPageParamsQueryData.pageParams.length - 1
  const lastPage = queriesArray[indexOfLastPage]

  const fetchNextPage = useCallback(() => {
    const endCursor = lastPage?.data?.pageInfo.endCursor
    const newPageParam: PageParam = endCursor == null ? pageParamForInitialPage : {after: endCursor}
    setPageParamsQueryData({
      ...currentPageParamsQueryData,
      pageParams: [...currentPageParamsQueryData.pageParams, newPageParam],
    })
  }, [currentPageParamsQueryData, lastPage, setPageParamsQueryData])

  const hasNextPage = lastPage?.data == null || lastPage?.data.pageInfo.hasNextPage
  const isFetchingNextPage = lastPage?.isFetching ?? false
  const isRefetching = queriesArray.some(query => query.isRefetching)

  return {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  }
}

function useInvalidateAllQueries(
  queryKeysForItems: Array<PaginatedMemexItemsQueryKey>,
  queryKeysForGroups: Array<PaginatedMemexItemsQueryKey>,
  queryKeysForSecondaryGroups: Array<PaginatedMemexItemsQueryKey>,
  groupedItemBatchesQueryKeys: Array<GroupedItemBatchQueryKey>,
  variables: PaginatedMemexItemsQueryVariables,
) {
  const queryClient = useQueryClient()
  const {setUpNextPlaceholderQueries} = useNextPlaceholderQuery(variables)
  const invalidateAllQueries = useCallback(async () => {
    // Gather the queryKeys for the currently active view
    const currentQueryKeys = [
      ...queryKeysForItems.concat(queryKeysForGroups).concat(queryKeysForSecondaryGroups),
      ...groupedItemBatchesQueryKeys,
    ]
    // Setup placeholder data to display while we refresh the view
    setUpNextPlaceholderQueries()
    // Remove actual data for all loaded pages of the current view,
    // this will trigger an immediate re-request of the data
    for (const queryKey of currentQueryKeys) {
      // Don't remove the placeholder queries
      if (queryKey[3] !== pageParamForNextPlaceholder) {
        queryClient.removeQueries({queryKey})
      }
    }
    // For each inactive view:
    // - remove all data except the first page
    // - then invalidate the first page
    // This will trigger a re-request of the first page
    // the next time the view becomes active. The stale first
    // page will be displayed until the re-request completes.
    invalidateInactiveInitialQueries(queryClient)
  }, [
    queryKeysForItems,
    queryKeysForGroups,
    queryKeysForSecondaryGroups,
    groupedItemBatchesQueryKeys,
    setUpNextPlaceholderQueries,
    queryClient,
  ])
  return {invalidateAllQueries}
}

function useMemexItemsSecondaryGroupsPagination(
  secondaryGroupQueries: Array<UseQueryResult<MemexGroupsPageQueryData>>,
  variables: PaginatedMemexItemsQueryVariables,
) {
  const {getPageParamsQueryData, setPageParamsQueryData} = useMemexItemsPageParams(variables)
  const currentPageParamsQueryData = getPageParamsQueryData()

  const queriesArray = secondaryGroupQueries
  // Get last page query
  const indexOfLastPage =
    'secondaryGroups' in currentPageParamsQueryData ? (currentPageParamsQueryData.secondaryGroups?.length ?? 0) - 1 : -1
  const lastPage = queriesArray[indexOfLastPage]

  const fetchNextPageForSecondaryGroups = useCallback(() => {
    const endCursor = lastPage?.data?.pageInfo.endCursor
    const newPageParam: PageParam = endCursor == null ? pageParamForInitialPage : {after: endCursor}
    const oldSecondaryGroups =
      'secondaryGroups' in currentPageParamsQueryData ? currentPageParamsQueryData.secondaryGroups ?? [] : []
    setPageParamsQueryData({
      ...currentPageParamsQueryData,
      secondaryGroups: [...oldSecondaryGroups, newPageParam],
    })
  }, [currentPageParamsQueryData, lastPage, setPageParamsQueryData])

  // The last page in the group will have a null data value if it hasn't been fetched yet,
  // in which case we still have a `hasNextPage` value of true - otherwise,
  // return the `hasNextPage` value from our query data.
  const lastGroupPageData = lastPage?.data
  const hasNextPageForSecondaryGroups = lastGroupPageData == null || lastGroupPageData.pageInfo.hasNextPage

  const isFetchingNextPageForSecondaryGroups = lastPage == null ? false : lastPage.isFetching

  return {
    fetchNextPageForSecondaryGroups,
    hasNextPageForSecondaryGroups,
    isFetchingNextPageForSecondaryGroups,
  }
}

function useMemexItemsGroupPagination(
  itemQueries: Array<UseQueryResult<MemexItemsPageQueryData>>,
  queryKeysForItems: Array<PaginatedMemexItemsQueryKey>,
  variables: PaginatedMemexItemsQueryVariables,
) {
  const {getPageParamsQueryData, setPageParamsQueryData} = useMemexItemsPageParams(variables)
  const currentPageParamsQueryData = getPageParamsQueryData()
  const pageParamsByGroupedItemsId = useMemo(
    () => (isPageParamsDataGrouped(currentPageParamsQueryData) ? currentPageParamsQueryData.groupedItems : {}),
    [currentPageParamsQueryData],
  )

  const getLastPageForGroupedItems = useCallback(
    (pageType: PageTypeForGroupedItems) => {
      const groupedItemsId = createGroupedItemsId(pageType)
      const pageParamsForGroupedItems = pageParamsByGroupedItemsId[groupedItemsId] || []
      const lastPageParam = pageParamsForGroupedItems[pageParamsForGroupedItems.length - 1]
      const queryKeyForLastPageOfGroupedItems = buildGroupedMemexItemsQueryKey(variables, pageType, lastPageParam)
      return getPageQueryForQueryKey(queryKeyForLastPageOfGroupedItems, itemQueries, queryKeysForItems)
    },
    [pageParamsByGroupedItemsId, itemQueries, queryKeysForItems, variables],
  )

  const fetchNextPageForGroupedItems = useCallback(
    (pageType: PageTypeForGroupedItems) => {
      const pageQuery = getLastPageForGroupedItems(pageType)
      const endCursor = pageQuery?.data?.pageInfo.endCursor
      const newPageParam: PageParam = endCursor == null ? pageParamForInitialPage : {after: endCursor}

      // Find the current entry for the group and add the new pageParam
      // We use `getPageParamsQueryData` instead of `pageParamsQueryData` or `pageParamsByGroupedItemsId`
      // to ensure that we're reading from the latest state before we write data.
      // See https://github.com/github/projects-platform/issues/1870
      const existingPageParamsQueryData = getPageParamsQueryData()
      const oldGroupedItems = isPageParamsDataGrouped(existingPageParamsQueryData)
        ? existingPageParamsQueryData.groupedItems || {}
        : {}
      const groupedItemsId = createGroupedItemsId(pageType)
      const previousPageParams = oldGroupedItems[groupedItemsId] || []
      const newPageParams = [...previousPageParams, newPageParam]
      const newGroupedItems = {...oldGroupedItems, [groupedItemsId]: newPageParams}
      const newPageParamsQueryData: GroupedPageParamsQueryData = {
        ...existingPageParamsQueryData,
        groupedItems: newGroupedItems,
      }
      setPageParamsQueryData(newPageParamsQueryData)
    },
    [getPageParamsQueryData, getLastPageForGroupedItems, setPageParamsQueryData],
  )

  const hasNextPageForGroupedItems = useCallback(
    (pageType: PageTypeForGroupedItems) => {
      const pageQuery = getLastPageForGroupedItems(pageType)
      // If we're unable to find a query matching the key, then we will return false.
      if (!pageQuery) {
        return false
      }

      // The last page in the group will have a null data value if it hasn't been fetched yet,
      // in which case we still have a `hasNextPage` value of true - otherwise,
      // return the `hasNextPage` value from our query data.
      const lastGroupPageData = pageQuery.data
      return lastGroupPageData == null || lastGroupPageData.pageInfo.hasNextPage
    },
    [getLastPageForGroupedItems],
  )

  const isFetchingNextPageForGroupedItems = useCallback(
    (pageType: PageTypeForGroupedItems) => {
      const pageQuery = getLastPageForGroupedItems(pageType)
      return pageQuery?.isFetching
    },
    [getLastPageForGroupedItems],
  )

  return {
    fetchNextPageForGroupedItems,
    hasNextPageForGroupedItems,
    isFetchingNextPageForGroupedItems,
  }
}

function useGroupedItemBatchesPagination(
  queryKeysForGroupedItemBatches: Array<GroupedItemBatchQueryKey>,
  queriesForGroupedItemBatches: Array<UseQueryResult<GroupedItemBatchPageQueryData>>,
  queriesForGroups: Array<UseQueryResult<MemexGroupsPageQueryData>>,
  queriesForSecondaryGroups: Array<UseQueryResult<MemexGroupsPageQueryData>>,
  variables: PaginatedMemexItemsQueryVariables,
) {
  const {getPageParamsQueryData, setPageParamsQueryData} = useMemexItemsPageParams(variables)
  const currentPageParamsQueryData = getPageParamsQueryData()

  const fetchGroupedItemsBatch = useCallback(
    (primaryGroupId: GroupId, secondaryGroupId: GroupId) => {
      if (isPageParamsDataGroupedWithSecondaryGroups(currentPageParamsQueryData)) {
        const indexOfPrimaryGroupId = findIndexOfQueryForGroupId(queriesForGroups, primaryGroupId)
        const indexOfSecondaryGroupId = findIndexOfQueryForGroupId(queriesForSecondaryGroups, secondaryGroupId)
        // If we can find the queries that have the group ids in question,
        // we then want to look to the _previous_ queries and use the end cursors from
        // those as the after/secondaryAfter parameters.
        const after = queriesForGroups[indexOfPrimaryGroupId - 1]?.data?.pageInfo.endCursor
        const secondaryAfter = queriesForSecondaryGroups[indexOfSecondaryGroupId - 1]?.data?.pageInfo.endCursor
        if (after && secondaryAfter) {
          // Form a new PrimaryAndSecondaryPageParam based on these values
          const newPageParam: GroupedItemBatchPageParam = {after, secondaryAfter}
          const oldGroupedItemsBatch = currentPageParamsQueryData.groupedItemBatches

          // Multiple group / secondary group id pairs could use the
          // same page param, but we don't want to duplicate these,
          // so check to see if its already there before updating.
          if (!groupedItemsBatchContainsPageParam(oldGroupedItemsBatch, newPageParam)) {
            setPageParamsQueryData({
              ...currentPageParamsQueryData,
              groupedItemBatches: [...oldGroupedItemsBatch, newPageParam],
            })
          }
        }
      }
    },
    [currentPageParamsQueryData, queriesForGroups, queriesForSecondaryGroups, setPageParamsQueryData],
  )

  const hasDataForGroupedItemsBatch = useCallback(
    (primaryGroupId: GroupId, secondaryGroupId: GroupId) => {
      // Find page of groups data for primary group id
      // Find page of groups data for secondary group id
      // If either one of them represent the first page of data,
      // then we know the data exists.
      // If both were requested with an `after` param, then we need
      // to check to see if there is a grouped item batch query for
      // the two after params.

      const indexOfPrimaryGroupId = findIndexOfQueryForGroupId(queriesForGroups, primaryGroupId)
      const indexOfSecondaryGroupId = findIndexOfQueryForGroupId(queriesForSecondaryGroups, secondaryGroupId)

      const pageInfoForPrimaryGroup = queriesForGroups[indexOfPrimaryGroupId]?.data?.pageInfo
      const pageInfoForSecondaryGroup = queriesForSecondaryGroups[indexOfSecondaryGroupId]?.data?.pageInfo

      if (pageInfoForPrimaryGroup && pageInfoForSecondaryGroup) {
        if (!pageInfoForPrimaryGroup.hasPreviousPage || !pageInfoForSecondaryGroup.hasPreviousPage) {
          return true
        }

        const previousPageInfoForPrimaryGroup = queriesForGroups[indexOfPrimaryGroupId - 1]?.data?.pageInfo
        const previousPageInfoForSecondaryGroup = queriesForSecondaryGroups[indexOfSecondaryGroupId - 1]?.data?.pageInfo

        const after = previousPageInfoForPrimaryGroup?.endCursor
        const secondaryAfter = previousPageInfoForSecondaryGroup?.endCursor
        if (after && secondaryAfter) {
          // Form a new PrimaryAndSecondaryPageParam based on these values
          const pageParam: GroupedItemBatchPageParam = {after, secondaryAfter}
          const queryKeyForGroupedItemBatch = buildGroupedItemBatchQueryKey(variables, pageParam)
          const query = getPageQueryForQueryKey(
            queryKeyForGroupedItemBatch,
            queriesForGroupedItemBatches,
            queryKeysForGroupedItemBatches,
          )
          return query != null
        }
      }
      return true
    },
    [
      queriesForGroupedItemBatches,
      queriesForGroups,
      queriesForSecondaryGroups,
      queryKeysForGroupedItemBatches,
      variables,
    ],
  )

  const isFetchingGroupedItemsBatch = useCallback(
    (primaryGroupId: GroupId, secondaryGroupId: GroupId) => {
      // Find page of groups data for primary group id
      // Find page of groups data for secondary group id
      // Get page params for both of these pages
      // Get the grouped items batch query that uses these two page params and check its `isFetching`

      const indexOfPrimaryGroupId = findIndexOfQueryForGroupId(queriesForGroups, primaryGroupId)
      const indexOfSecondaryGroupId = findIndexOfQueryForGroupId(queriesForSecondaryGroups, secondaryGroupId)

      const after = queriesForGroups[indexOfPrimaryGroupId - 1]?.data?.pageInfo.endCursor
      const secondaryAfter = queriesForSecondaryGroups[indexOfSecondaryGroupId - 1]?.data?.pageInfo.endCursor
      if (after && secondaryAfter) {
        // Form a new PrimaryAndSecondaryPageParam based on these values
        const pageParam: GroupedItemBatchPageParam = {after, secondaryAfter}
        const queryKeyForGroupedItemBatch = buildGroupedItemBatchQueryKey(variables, pageParam)
        const query = getPageQueryForQueryKey(
          queryKeyForGroupedItemBatch,
          queriesForGroupedItemBatches,
          queryKeysForGroupedItemBatches,
        )

        if (query) {
          return query.isFetching
        }
      }

      return false
    },
    [
      queriesForGroupedItemBatches,
      queriesForGroups,
      queriesForSecondaryGroups,
      queryKeysForGroupedItemBatches,
      variables,
    ],
  )

  return {
    fetchGroupedItemsBatch,
    hasDataForGroupedItemsBatch,
    isFetchingGroupedItemsBatch,
  }
}

function getPageQueryForQueryKey<TQueryKey extends QueryKey, TQueryData>(
  queryKey: TQueryKey,
  queries: Array<UseQueryResult<TQueryData>>,
  queryKeys: Array<TQueryKey>,
) {
  // We want to correlate that query key to a query, but since query keys are arrays,
  // we need to hash the key first before performing the comparison
  const hashForQueryKey = hashKey(queryKey)
  const queryKeyIndex = queryKeys.findIndex(key => hashKey(key) === hashForQueryKey)
  return queries[queryKeyIndex]
}

function separateQueriesForItemsAndGroups(
  pageQueries: Array<UseQueryResult<MemexPageQueryData>>,
  pageQueryKeys: Array<PaginatedMemexItemsQueryKey>,
) {
  const queriesForItems: Array<UseQueryResult<MemexItemsPageQueryData>> = []
  const queryKeysForItems: Array<PaginatedMemexItemsQueryKey> = []
  const queriesForGroups: Array<UseQueryResult<MemexGroupsPageQueryData>> = []
  const queryKeysForGroups: Array<PaginatedMemexItemsQueryKey> = []
  const queriesForSecondaryGroups: Array<UseQueryResult<MemexGroupsPageQueryData>> = []
  const queryKeysForSecondaryGroups: Array<PaginatedMemexItemsQueryKey> = []

  for (const [index, query] of pageQueries.entries()) {
    const queryKey = pageQueryKeys[index] as PaginatedMemexItemsQueryKey
    // We want to separate out queries for groups from queries for items based on the query key.
    // We unfortunately cannot rely on the shape of the data, as it might still be undefined,
    // while the data is loading.
    if (isQueryKeyForGroups(queryKey)) {
      queriesForGroups.push(query as UseQueryResult<MemexGroupsPageQueryData>)
      queryKeysForGroups.push(queryKey)
    } else if (isQueryKeyForSecondaryGroups(queryKey)) {
      queriesForSecondaryGroups.push(query as UseQueryResult<MemexGroupsPageQueryData>)
      queryKeysForSecondaryGroups.push(queryKey)
    } else {
      queriesForItems.push(query as UseQueryResult<MemexItemsPageQueryData>)
      queryKeysForItems.push(queryKey)
    }
  }
  return {
    queriesForItems,
    queryKeysForItems,
    queriesForGroups,
    queryKeysForGroups,
    queriesForSecondaryGroups,
    queryKeysForSecondaryGroups,
  }
}

export type GroupsById = Record<GroupId, WithTotal<PaginatedGroupQueryData>>

export type GroupedItemQueries = Record<GroupId, Array<UseQueryResult<MemexItemsPageQueryData>>>

/**
 * Given all our queries for items, we want to map all of the item queries to their corresponding group.
 * For scenarios where we only have primary groups, we group all of the item queries by their group id
 *  (which is extracted from its query key).
 * When we have secondary groups, we'll include keys for each group id, secondary group id, and
 * "cell" representing the combination of a primary and secondary group id.
 */
function buildGroupedItemQueries(
  itemQueries: Array<UseQueryResult<MemexItemsPageQueryData>>,
  itemQueryKeys: Array<PaginatedMemexItemsQueryKey>,
): GroupedItemQueries {
  const groupedItemQueries: Record<string, Array<UseQueryResult<MemexItemsPageQueryData>>> = {}

  // Let's iterate through all of our item query keys and group their corresponding queries by group id.
  for (const [index, queryKey] of itemQueryKeys.entries()) {
    const pageType = getPageTypeFromQueryKey(queryKey)
    const relatedQuery = itemQueries[index]
    if (relatedQuery && isPageTypeForGroupedItems(pageType)) {
      // If we only have primary groups, these ids will just be
      // the primary group's id.
      // However, if we have secondary groups, these ids will be
      // a combination of the primary and secondary group's id.
      const groupedItemsId = createGroupedItemsId(pageType)

      const queriesForGroupedItems = groupedItemQueries[groupedItemsId] || []
      queriesForGroupedItems.push(relatedQuery)
      groupedItemQueries[groupedItemsId] = queriesForGroupedItems

      if (pageType.secondaryGroupId) {
        // If we have a secondaryGroupId, in addition to including this query in
        // the list of queries for the primary/secondary group id combination,
        // we also want to include it in a list of queries related to the
        // groupId and secondaryGroupId individually.
        // For example, if the page type was {groupId: 'group1', secondaryGroupId: 'secondaryGroup1'}
        // We would include this query in the arrays for the following keys:
        // 'group1-secondaryGroup1
        // `group1`
        // `secondaryGroup1`
        const queriesForGroup = groupedItemQueries[pageType.groupId] || []
        queriesForGroup.push(relatedQuery)
        groupedItemQueries[pageType.groupId] = queriesForGroup

        const queriesForSecondaryGroup = groupedItemQueries[pageType.secondaryGroupId] || []
        queriesForSecondaryGroup.push(relatedQuery)
        groupedItemQueries[pageType.secondaryGroupId] = queriesForSecondaryGroup
      }
    }
  }
  return groupedItemQueries
}

/**
 * We sometimes want to find information about a group by its id, so
 * this method transforms a collection of queries of groups into a lookup.
 * We often need the total count information alongside the group's value and
 * metadata, so this helper also accepts that query data, so that we can bolt
 * it onto the group.
 */
function buildGroupsById(
  groupQueries: Array<UseQueryResult<MemexGroupsPageQueryData>>,
  totalCountQuery: MemexItemsTotalCountsQueryData | undefined,
): GroupsById {
  const groupsById: GroupsById = {}

  for (const groupQuery of groupQueries) {
    // Each group query could have multiple groups
    // We want to iterate over each of these groups and stitch the
    // group together with the total count data, so that
    // each can be easily looked up together by the group id
    const groups = groupQuery.data?.groups || []
    for (const group of groups) {
      const totalCount = totalCountQuery?.groups[group.groupId] || {value: 0, isApproximate: false}
      groupsById[group.groupId] = {...group, totalCount}
    }
  }

  return groupsById
}

/**
 * Finds the index of a specific query of groups in our query cache, where
 * a group in the query matches the provided group id.
 * We iterate over the queries, and then iterate over the groups within the
 * queries, until we find a matching group.
 * If no matching group is found, we return -1.
 */
function findIndexOfQueryForGroupId(
  groupQueries: Array<UseQueryResult<MemexGroupsPageQueryData>>,
  groupId: GroupId,
): number {
  for (const [index, query] of groupQueries.entries()) {
    if (query.data) {
      for (const group of query.data.groups) {
        if (group.groupId === groupId) {
          return index
        }
      }
    }
  }
  return -1
}

function groupedItemsBatchContainsPageParam(
  groupedItemBatches: Array<GroupedItemBatchPageParam>,
  pageParam: GroupedItemBatchPageParam,
) {
  return groupedItemBatches.some(
    param => param.after === pageParam.after && param.secondaryAfter === pageParam.secondaryAfter,
  )
}
