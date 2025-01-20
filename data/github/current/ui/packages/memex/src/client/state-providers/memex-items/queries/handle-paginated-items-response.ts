import type {QueryClient} from '@tanstack/react-query'

import type {
  PaginatedGroupsAndSecondaryGroupsData,
  PaginatedGroupsData,
  PaginatedMemexItemsData,
  PaginatedTotalCount,
} from '../../../api/memex-items/paginated-views'
import {createMemexItemModel} from '../../../models/memex-item-model'
import {setQueryDataForMemexSecondaryGroupsPage} from '../query-client-api/memex-groups'
import {setQueryDataForGroupedItemsPage} from '../query-client-api/memex-items'
import {setSliceByQueryData} from '../query-client-api/memex-slices'
import {mergeQueryDataForMemexItemsTotalCounts} from '../query-client-api/memex-totals'
import {
  createGroupedItemsId,
  createGroupedItemsPageType,
  isPageTypeForGroupedItems,
  type PageType,
  type PageTypeForGroupedItems,
} from './query-keys'
import {
  type MemexGroupsPageQueryData,
  type MemexItemsPageQueryData,
  type MemexItemsTotalCountsQueryData,
  pageParamForInitialPage,
  type PaginatedMemexItemsQueryVariables,
} from './types'

type PartialTotalCounts = Pick<MemexItemsTotalCountsQueryData, 'groups'> & {
  totalCount?: PaginatedTotalCount
}

type QueryDataResponse =
  | {queryData: MemexItemsPageQueryData}
  | {
      queryData: MemexGroupsPageQueryData
      secondaryGroups?: MemexGroupsPageQueryData
      groupedItems: Array<PageTypeForGroupedItems>
    }

export function isQueryDataResponseGrouped(queryDataResponse: QueryDataResponse): queryDataResponse is {
  queryData: MemexGroupsPageQueryData
  secondaryGroups?: MemexGroupsPageQueryData
  groupedItems: Array<PageTypeForGroupedItems>
} {
  return 'groupedItems' in queryDataResponse
}

/**
 * Transforms a paginated items data response (or JSON island) into query data representing
 * memex items. If the response is grouped, then we'll return query data for the groups
 * and update the query client with pages of data for the grouped items. If the response is ungrouped,
 * we'll just return a single page of item data. In addition to building the query data,
 * this function will also handle setting slice by data in the query client (if it's available),
 * and updating the total count state.
 * @param queryClient QueryClient to store the data
 * @param variables Used in the query key
 * @param response A response from the /paginated_items endpoint, or JSON island data
 * @param pageType Whether or not we had a pageType in the request. If this is undefined,
 * then the data either represents a page of ungrouped items OR a page of groups, along
 * with their grouped items. If there is a pageType defined here, then the data represents
 * a page of items for an individual group. We use this value to determine whether or not
 * to update a top level totalCount state (if pageType is undefined) or a group-specific
 * totalCount value
 * @returns
 */
export function handlePaginatedItemsResponse(
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
  response: PaginatedMemexItemsData,
  pageType?: PageType,
): QueryDataResponse {
  setSlicesDataFromResponse(queryClient, variables, response)
  updateTotalCountsQueryDataFromResponse(queryClient, variables, response, pageType)
  return buildNewQueryData(queryClient, variables, response)
}

export function setSlicesDataFromResponse(
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
  response: PaginatedMemexItemsData,
) {
  if ('slices' in response && response.slices != null) {
    setSliceByQueryData(queryClient, variables, {slices: response.slices})
  }
}

export function updateTotalCountsQueryDataFromResponse(
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
  response: PaginatedMemexItemsData,
  pageType?: PageType,
) {
  const memexItemsTotalCountsQueryData: PartialTotalCounts = {groups: {}}
  const {totalCount, ...responseWithoutTotalCount} = response
  if (!pageType || !isPageTypeForGroupedItems(pageType)) {
    // If this is a page of ungrouped items, a page of groups, or initial JSON island data
    // then totalCount represents the total items matching the current filter.
    memexItemsTotalCountsQueryData.totalCount = totalCount
  } else {
    // If this is a subsequent page of items for a specific group,
    // then totalCount represents the total items in that group.
    const groupedItemsId = createGroupedItemsId(pageType)
    memexItemsTotalCountsQueryData.groups[groupedItemsId] = totalCount
  }

  // If we have groups in the data, we want to update the total counts query data for
  // each group in ther response.
  if ('groups' in responseWithoutTotalCount) {
    for (const group of responseWithoutTotalCount.groups.nodes) {
      memexItemsTotalCountsQueryData.groups[group.groupId] = group.totalCount
    }
  }

  mergeQueryDataForMemexItemsTotalCounts(queryClient, variables, memexItemsTotalCountsQueryData)
}

function buildNewQueryData(
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
  response: PaginatedMemexItemsData,
): QueryDataResponse {
  if ('groups' in response) {
    // If there are `groups` in the response, we will need to return query data
    // for the page of groups themselves, secondary groups, as well as a query data object
    // for each group's grouped items.

    const groupPageQueryData = buildGroupsQueryData(response)
    // In addition to returning the secondary groups query data, this method will also set
    // the correct data in the query client
    const secondaryGroupPageQueryData = buildSecondaryGroupsQueryData(queryClient, variables, response)
    // In addition to returning the grouped items page types, this method will also set
    // the correct data in the query client
    const groupedItemsPageTypes = buildGroupedItemsQueryData(queryClient, variables, response)

    return {
      queryData: groupPageQueryData,
      secondaryGroups: secondaryGroupPageQueryData,
      groupedItems: groupedItemsPageTypes,
    }
  } else {
    // If we're here, there were no groups in the response, so we're either
    // looking at a page of ungrouped items, or the next page of items in a group.
    // We can handle these cases in the same way.

    // We don't want to include the total count in the query data though.
    const {totalCount, ...responseWithoutTotalCount} = response
    return {
      queryData: {
        ...responseWithoutTotalCount,
        nodes: responseWithoutTotalCount.nodes.map(item => createMemexItemModel(item)),
      },
    }
  }
}

export function buildGroupsQueryData(response: PaginatedGroupsData | PaginatedGroupsAndSecondaryGroupsData) {
  const groupPageQueryData: MemexGroupsPageQueryData = {
    groups: [],
    pageInfo: response.groups.pageInfo,
  }

  for (const group of response.groups.nodes) {
    groupPageQueryData.groups.push(group)
  }
  return groupPageQueryData
}

export function buildGroupedItemsQueryData(
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
  response: PaginatedGroupsData | PaginatedGroupsAndSecondaryGroupsData,
) {
  const groupedItemsPageTypes: Array<PageTypeForGroupedItems> = []

  for (const groupedItems of response.groupedItems) {
    const queryDataForGroupedItems = {
      nodes: groupedItems.nodes.map(item => createMemexItemModel(item)),
      pageInfo: groupedItems.pageInfo,
    }

    const pageTypeForGroupedItems = createGroupedItemsPageType(groupedItems)

    setQueryDataForGroupedItemsPage(
      queryClient,
      variables,
      pageTypeForGroupedItems,
      pageParamForInitialPage,
      queryDataForGroupedItems,
    )

    groupedItemsPageTypes.push(pageTypeForGroupedItems)
  }

  return groupedItemsPageTypes
}

export function buildSecondaryGroupsQueryData(
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
  response: PaginatedGroupsData | PaginatedGroupsAndSecondaryGroupsData,
) {
  if (!response.secondaryGroups) {
    return undefined
  }

  // If we have secondaryGroups in the response, go ahead and convert
  // the groups in the response to query data
  const secondaryGroupPageQueryData: MemexGroupsPageQueryData = {
    groups: [],
    pageInfo: response.secondaryGroups.pageInfo,
  }

  for (const group of response.secondaryGroups.nodes) {
    secondaryGroupPageQueryData.groups.push(group)
  }

  // We only expect to receive primary and secondary groups together in the
  // same response if this is the either the initial request for a view
  // or we're reading from the JSON island
  setQueryDataForMemexSecondaryGroupsPage(queryClient, variables, pageParamForInitialPage, secondaryGroupPageQueryData)
  return secondaryGroupPageQueryData
}
