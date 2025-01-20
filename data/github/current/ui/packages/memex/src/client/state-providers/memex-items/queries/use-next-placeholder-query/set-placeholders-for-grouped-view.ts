import type {QueryClient} from '@tanstack/react-query'

import {
  getQueryDataForMemexGroupsPage,
  getQueryDataForMemexSecondaryGroupsPage,
} from '../../query-client-api/memex-groups'
import {getQueryDataForGroupedItemsPage} from '../../query-client-api/memex-items'
import {nextPlaceholderPageInfo} from '../../query-client-api/page-params'
import {isPageParamsDataGroupedWithSecondaryGroups} from '../query-data-helpers'
import {
  createGroupedItemsPageTypeFromGroupedItemsId,
  pageTypeForGroups,
  pageTypeForSecondaryGroups,
} from '../query-keys'
import {
  type GroupedPageParamsQueryData,
  type GroupedWithSecondaryGroupsPageParamsQueryData,
  type MemexGroupsPageQueryData,
  type MemexItemsPageQueryData,
  pageParamForInitialPage,
  pageParamForNextPlaceholder,
  type PageParamsByGroupedItemsId,
  type PaginatedMemexItemsQueryVariables,
} from '../types'
import {setQueryDataForNextPlaceholder} from './set-query-data-for-next-placeholder'

/**
 * This function sets up placeholder queries for a grouped view.
 * It creates one placeholder query for the top-level groups
 * plus one per groupedItems collection.
 *
 * @param queryClient - the react-query client
 * @param variables - the query variables for the relevant view
 * @param sourceVariables - the query variables referenced when building placeholder data
 * @param sourcePageParamsQueryData - the page params referenced when building placeholder data
 * @param setPageParamsQueryData - a method to set the page params for the newly built placeholder
 *
 * @returns {void}
 */
export function setPlaceholdersForGroupedView(
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
  sourceVariables: PaginatedMemexItemsQueryVariables,
  sourcePageParamsQueryData: GroupedPageParamsQueryData,
  setPageParamsQueryData: (pageParams: GroupedPageParamsQueryData) => void,
) {
  const nextGroupedItemsPageParams: PageParamsByGroupedItemsId = {}
  // Copy all items for each group into a placeholder query
  for (const [groupedItemsId, pageParams] of Object.entries(sourcePageParamsQueryData.groupedItems)) {
    const pageType = createGroupedItemsPageTypeFromGroupedItemsId(groupedItemsId)
    // Build the placeholder query data using the source variables
    const nextPlaceholderPagesForGroupedItems = pageParams
      .flatMap(pageParam => getQueryDataForGroupedItemsPage(queryClient, sourceVariables, pageType, pageParam))
      .filter(page => !!page)
    const nextPlaceholderDataForGroupedItems: MemexItemsPageQueryData = {
      nodes: nextPlaceholderPagesForGroupedItems.flatMap(page => page.nodes),
      pageInfo: nextPlaceholderPageInfo,
    }
    // Set query data for the placeholder page for this group for the target variables
    setQueryDataForNextPlaceholder(queryClient, variables, pageType, nextPlaceholderDataForGroupedItems)

    // Set the updated pageParams metadata for this group: ['next_placeholder']
    nextGroupedItemsPageParams[groupedItemsId] = [pageParamForNextPlaceholder]
  }

  // Build a top-level groups placeholder query using the source variables
  const primaryGroupsSourceData = sourcePageParamsQueryData.pageParams.map(pageParam =>
    getQueryDataForMemexGroupsPage(queryClient, sourceVariables, pageParam),
  )
  const primaryGroupsNextPlaceholderData: MemexGroupsPageQueryData = {
    groups: primaryGroupsSourceData.flatMap(group => group?.groups ?? []),
    pageInfo: nextPlaceholderPageInfo,
  }
  // Set query data for the placeholder groups page for the target variables
  setQueryDataForNextPlaceholder(queryClient, variables, pageTypeForGroups, primaryGroupsNextPlaceholderData)

  if (isPageParamsDataGroupedWithSecondaryGroups(sourcePageParamsQueryData)) {
    // Build a secondary group placeholder query using the source variables
    const secondaryGroupsSourceData = sourcePageParamsQueryData.secondaryGroups?.map(pageParam =>
      getQueryDataForMemexSecondaryGroupsPage(queryClient, sourceVariables, pageParam),
    )
    const secondaryGroupsNextPlaceholderData: MemexGroupsPageQueryData = {
      groups: secondaryGroupsSourceData.flatMap(group => group?.groups ?? []),
      pageInfo: nextPlaceholderPageInfo,
    }

    // Set query data for the placeholder secondary groups page for the target variables
    setQueryDataForNextPlaceholder(
      queryClient,
      variables,
      pageTypeForSecondaryGroups,
      secondaryGroupsNextPlaceholderData,
    )

    const nextPlaceholderPageParamsData: GroupedWithSecondaryGroupsPageParamsQueryData = {
      groupedItems: nextGroupedItemsPageParams,
      pageParams: [pageParamForInitialPage, pageParamForNextPlaceholder],
      secondaryGroups: [pageParamForNextPlaceholder],
      groupedItemBatches: [],
    }

    // Update the page params query data; top-level and per groupedItems:
    // pageParams: [undefined, 'next_placeholder']
    // groupedItems: all groups, each with pageParams: ['next_placeholder']
    // secondaryGroups: ['next_placeholder'] if secondary groups exist
    setPageParamsQueryData(nextPlaceholderPageParamsData)
  } else {
    const nextPlaceholderPageParamsData: GroupedPageParamsQueryData = {
      groupedItems: nextGroupedItemsPageParams,
      pageParams: [pageParamForInitialPage, pageParamForNextPlaceholder],
    }

    // Update the page params query data; top-level and per groupedItems:
    // pageParams: [undefined, 'next_placeholder']
    // groupedItems: all groups, each with pageParams: ['next_placeholder']
    setPageParamsQueryData(nextPlaceholderPageParamsData)
  }
}
