import type {QueryClient, QueryFilters} from '@tanstack/react-query'

import {isPageParamsDataGrouped, isPageParamsDataGroupedWithSecondaryGroups} from '../queries/query-data-helpers'
import {
  buildPageParamsQueryKey,
  createGroupedItemsId,
  getPageTypeFromQueryKey,
  type GroupedMemexItemsQueryKey,
  isInitialQueryKeyForView,
  isPageTypeForGroupedItems,
  isQueryForItemsMetadata,
  isQueryKeyForGroupedItems,
  type PageTypeForGroupedItems,
  pageTypeForGroups,
  pageTypeForSecondaryGroups,
  type PaginatedMemexItemsQueryKey,
  paginatedMemexItemsQueryKey,
} from '../queries/query-keys'
import {
  type MemexGroupsPageQueryData,
  pageParamForInitialPage,
  pageParamForNextPlaceholder,
  type PageParamsByGroupedItemsId,
  type PageParamsQueryData,
  type PaginatedMemexItemsQueryVariables,
} from '../queries/types'

/**
 * A thin wrapper around `getQueryData`, that returns the page params for which query keys should be
 * active in our view
 * @param queryClient
 * @param variables PaginatedMemexItemsQueryVariables to use in our query key
 * @returns PageParamsQueryData
 */
export function getPageParamsQueryDataForVariables(
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
) {
  return (
    queryClient.getQueryData<PageParamsQueryData>(buildPageParamsQueryKey(variables)) || {
      pageParams: [],
    }
  )
}

/**
 * A thin wrapper around `setQueryData`, that sets the page params for which query keys should be
 * active in our view
 * @param queryClient
 * @param variables PaginatedMemexItemsQueryVariables that is used in our queryKey
 * @param newQueryData
 */
export function setPageParamsQueryDataForVariables(
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
  newQueryData: PageParamsQueryData,
) {
  queryClient.setQueryData<PageParamsQueryData>(buildPageParamsQueryKey(variables), newQueryData)
}

/**
 * Removes inactive queryData except the first page for each view.
 * Invalidates that first page so that it will be refetched
 * the next time the view becomes active.
 * @param queryClient
 */
export const invalidateInactiveInitialQueries = (queryClient: QueryClient) => {
  const baseInactiveMemexItemsQueryFilter: QueryFilters = {
    queryKey: [paginatedMemexItemsQueryKey],
    exact: false,
    type: 'inactive',
  }
  // When a user returns to a view, their scroll position will be reset to the top.
  // So we don't need to keep subsequent pages of data.
  queryClient.removeQueries({
    ...baseInactiveMemexItemsQueryFilter,
    predicate: query => {
      if (isQueryForItemsMetadata(query)) {
        return false
      }
      const queryKey = query.queryKey as PaginatedMemexItemsQueryKey
      if (queryKey[3] === pageParamForInitialPage && isQueryKeyForGroupedItems(queryKey)) {
        // Remove initial page of groupedItems that aren't in the first top-level page of groups
        return !isGroupedItemsQueryInInitialPageOfGroups(queryClient, queryKey)
      }
      if (isInitialQueryKeyForView(queryKey)) {
        resetPageParamsQueryDataToInitialPage(queryClient, queryKey[1])
      }
      return queryKey[3] !== pageParamForInitialPage && queryKey[3] !== pageParamForNextPlaceholder
    },
  })
  // We want to invalidate the first page of data so that it will be refetched
  // when the view becomes active.
  queryClient.invalidateQueries({
    ...baseInactiveMemexItemsQueryFilter,
    refetchType: 'active',
    predicate: query => {
      const queryKey = query.queryKey as PaginatedMemexItemsQueryKey
      return !isQueryForItemsMetadata(query) && isInitialQueryKeyForView(queryKey)
    },
  })
}

/**
 * Resets each page params query to only include the initial page param.
 * @param queryClient
 * @param variables The variables used in the page params query key
 */
function resetPageParamsQueryDataToInitialPage(queryClient: QueryClient, variables: PaginatedMemexItemsQueryVariables) {
  const pageParamsQueryData = getPageParamsQueryDataForVariables(queryClient, variables)
  if (!pageParamsQueryData || pageParamsQueryData.pageParams.length === 0) return
  if (pageParamsQueryData.pageParams[pageParamsQueryData.pageParams.length - 1] === pageParamForNextPlaceholder) {
    // Skip any page params queries that are tracking placeholder data
    return
  }
  // Reset the top-level page params for the view to just the initial page
  let newPageParams: PageParamsQueryData = {pageParams: [pageParamForInitialPage]}
  if (isPageParamsDataGrouped(pageParamsQueryData)) {
    // If the data is grouped, we should also reset the groupedItems page params
    // to just those in the initial page for the view.
    const groupedItemsPageTypes = buildGroupedItemsPageTypesForInitialPage(queryClient, variables)
    newPageParams = {
      ...newPageParams,
      groupedItems: groupedItemsPageTypes.reduce((acc, pageType) => {
        const groupedItemsId = createGroupedItemsId(pageType)
        acc[groupedItemsId] = [pageParamForInitialPage]
        return acc
      }, {} as PageParamsByGroupedItemsId),
    }
  }
  if (isPageParamsDataGroupedWithSecondaryGroups(pageParamsQueryData)) {
    // if the data is grouped with secondary groups, we should also reset the
    // secondary groups page params for the view to just the initial page
    newPageParams = {
      ...newPageParams,
      secondaryGroups: [pageParamForInitialPage],
      // groupedItemBatches are always for subsequent pages, so we should reset
      // these page params entirely
      groupedItemBatches: [],
    }
  }
  setPageParamsQueryDataForVariables(queryClient, variables, newPageParams)
}

/**
 * Checks if a queryKey is for a groupedItems collection in the initial
 * page of groups returned by the server
 * @param queryClient
 * @param groupQueryKey The queryKey for the groupedItems to verify
 * @returns boolean
 */
function isGroupedItemsQueryInInitialPageOfGroups(queryClient: QueryClient, groupQueryKey: GroupedMemexItemsQueryKey) {
  const groupedItemsPageTypes = buildGroupedItemsPageTypesForInitialPage(queryClient, groupQueryKey[1])
  const groupIdsInInitialPage = groupedItemsPageTypes.map(pageType => createGroupedItemsId(pageType))
  const pageType = getPageTypeFromQueryKey(groupQueryKey)
  const groupedItemsId = isPageTypeForGroupedItems(pageType) ? createGroupedItemsId(pageType) : ''
  return groupIdsInInitialPage.includes(groupedItemsId)
}

/* Builds groupedItems PageTypes for the initial page of groups
 * or initial intersection of groups and secondary groups
 */
const buildGroupedItemsPageTypesForInitialPage = (
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
): Array<PageTypeForGroupedItems> => {
  const initialPageOfGroups = queryClient.getQueryData<MemexGroupsPageQueryData>([
    paginatedMemexItemsQueryKey,
    variables,
    pageTypeForGroups,
    pageParamForInitialPage,
  ])
  if (!initialPageOfGroups) {
    return []
  }
  const initialPageOfSecondaryGroups = queryClient.getQueryData<MemexGroupsPageQueryData>([
    paginatedMemexItemsQueryKey,
    variables,
    pageTypeForSecondaryGroups,
    pageParamForInitialPage,
  ])
  if (!initialPageOfSecondaryGroups) {
    return initialPageOfGroups.groups.map(g => ({groupId: g.groupId}))
  }
  return initialPageOfGroups.groups.reduce((acc, g) => {
    for (const sg of initialPageOfSecondaryGroups.groups) {
      acc.push({groupId: g.groupId, secondaryGroupId: sg.groupId})
    }
    return acc
  }, [] as Array<PageTypeForGroupedItems>)
}

// The next_placeholder should always be the last page param, so hasNextPage must be false.
export const nextPlaceholderPageInfo = {hasNextPage: false, hasPreviousPage: false}
