import type {QueryClient} from '@tanstack/react-query'

import type {PaginatedItemsData} from '../../../../api/memex-items/paginated-views'
import {
  getQueryDataForGroupedItemsPage,
  getQueryDataForMemexItemsPage,
  setQueryDataForGroupedItemsPage,
  setQueryDataForMemexItemsPage,
} from '../../query-client-api/memex-items'
import {nextPlaceholderPageInfo} from '../../query-client-api/page-params'
import {
  buildMemexItemsOrGroupsQueryKey,
  isPageTypeForGroupedItems,
  type PageTypeForGroupedItems,
  type PageTypeForUngroupedItems,
} from '../query-keys'
import {
  type MemexItemsPageQueryData,
  type PageParam,
  pageParamForInitialPage,
  pageParamForNextPlaceholder,
  type PaginatedMemexItemsQueryVariables,
  type WithoutTotal,
} from '../types'

/**
 * As fresh items are returned from the server, this function updates the corresponding
 * placeholder query:
 * - It removes an equal number of stale items from the placeholder query as were returned from the server.
 * - If there are still items in the placeholder query, it updates the page params to fetch the next page.
 *
 * Once there are no more items in the placeholder query or there are no more items on the server,
 * it removes the placeholder query.
 *
 * @param {QueryClient} queryClient - the react-query client
 * @param {PaginatedMemexItemsQueryVariables} variables - the query variables for the relevant view
 * @param {Array<PageParam>} pageParams - the current page params metadata
 * @param {PageTypeForGroupedItems | PageTypeForUngroupedItems} pageType - the pageType for the fresh items data
 * @param {WithoutTotal<PaginatedItemsData>} newItemsData - a page of fresh items data
 *
 * @returns {Array<PageParam>} - the updated page params metadata.
 */
export const getUpdatedItemsPageParams = (
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
  pageParams: Array<PageParam> = [],
  pageType: PageTypeForGroupedItems | PageTypeForUngroupedItems,
  newItemsData: WithoutTotal<PaginatedItemsData> | undefined,
): Array<PageParam> => {
  if (pageParams.length === 0 || pageParams[0] !== pageParamForInitialPage) {
    // A grouped response will include multiple groups with one initial page of items for each.
    // If the pageParams arg doesn't contain a "pageParamForInitialPage", then we can
    // infer that we're dealing with a grouped response, and we should seed the initial page param.
    pageParams.unshift(pageParamForInitialPage)
  }
  if (pageParams[pageParams.length - 1] !== pageParamForNextPlaceholder) {
    // Nothing else to handle, we can return early
    return pageParams
  }
  // We have some data in the `next_placeholder` query, so let's update the data, and potentially
  // add a new query for the next page.
  const currentNextPlaceholderData = isPageTypeForGroupedItems(pageType)
    ? getQueryDataForGroupedItemsPage(queryClient, variables, pageType, pageParamForNextPlaceholder)
    : getQueryDataForMemexItemsPage(queryClient, variables, pageParamForNextPlaceholder)
  const pageParamsWithoutNextPlaceholder = pageParams.slice(0, pageParams.length - 1)
  const newNextPlaceholderDataNodes = currentNextPlaceholderData?.nodes.slice(newItemsData?.nodes.length)
  if (newNextPlaceholderDataNodes?.length && newItemsData?.pageInfo.hasNextPage && newItemsData?.pageInfo.endCursor) {
    const newNextPlaceholderData: MemexItemsPageQueryData = {
      nodes: newNextPlaceholderDataNodes,
      pageInfo: nextPlaceholderPageInfo,
    }
    const newPageParams: Array<PageParam> = [
      ...pageParamsWithoutNextPlaceholder,
      {after: newItemsData?.pageInfo.endCursor},
      pageParamForNextPlaceholder,
    ]

    // Set query data for the next placeholder page
    if (isPageTypeForGroupedItems(pageType)) {
      setQueryDataForGroupedItemsPage(
        queryClient,
        variables,
        pageType,
        pageParamForNextPlaceholder,
        newNextPlaceholderData,
      )
    } else {
      setQueryDataForMemexItemsPage(queryClient, variables, pageParamForNextPlaceholder, newNextPlaceholderData)
    }
    return newPageParams
  } else {
    // We have no more data in the next placeholder query, so let's remove it.
    queryClient.removeQueries({
      queryKey: buildMemexItemsOrGroupsQueryKey(variables, pageType, pageParamForNextPlaceholder),
    })
    return pageParamsWithoutNextPlaceholder
  }
}
