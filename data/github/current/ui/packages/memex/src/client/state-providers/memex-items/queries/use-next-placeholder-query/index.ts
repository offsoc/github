import type {QueryClient} from '@tanstack/react-query'
import {useQueryClient} from '@tanstack/react-query'
import {useCallback, useMemo} from 'react'

import type {SystemColumnId} from '../../../../api/columns/contracts/memex-column'
import type {
  PaginatedGroupsAndSecondaryGroupsData,
  PaginatedGroupsData,
  PaginatedItemsData,
} from '../../../../api/memex-items/paginated-views'
import {useEnabledFeatures} from '../../../../hooks/use-enabled-features'
import {getQueryDataForMemexGroupsPage} from '../../query-client-api/memex-groups'
import {getQueryDataForMemexItemsPage} from '../../query-client-api/memex-items'
import {getPageParamsQueryDataForVariables, nextPlaceholderPageInfo} from '../../query-client-api/page-params'
import {isPageParamsDataGrouped, isPageParamsDataGroupedWithSecondaryGroups} from '../query-data-helpers'
import {
  createGroupedItemsId,
  createGroupedItemsPageType,
  isPageTypeForGroupedItems,
  type PageTypeForGroupedItems,
  pageTypeForGroups,
  pageTypeForSecondaryGroups,
  type PageTypeForUngroupedItems,
  pageTypeForUngroupedItems,
} from '../query-keys'
import {isGroupByApplied} from '../query-variables'
import {
  type GroupedPageParamsQueryData,
  type GroupedWithSecondaryGroupsPageParamsQueryData,
  type MemexItemsPageQueryData,
  pageParamForInitialPage,
  pageParamForNextPlaceholder,
  type PaginatedMemexItemsQueryVariables,
  type WithoutTotal,
} from '../types'
import {useMemexItemsPageParams} from '../use-memex-items-page-params'
import {getUpdatedGroupsPageParams} from './get-updated-groups-page-params'
import {getUpdatedItemsPageParams} from './get-updated-items-page-params'
import {setPlaceholdersForGroupedView} from './set-placeholders-for-grouped-view'
import {setQueryDataForNextPlaceholder} from './set-query-data-for-next-placeholder'

/**
 * This hook provides utilities for continuing to display stale data for a view while
 * fresh data is being refetched from the server.
 *
 * The stale data is incrementally replaced by fresh data as new pages are returned from the server.
 * Additional pages are fetched until there are no more items on the server, or all stale items have
 * been replaced.
 *
 * Placeholder queries use `next_placeholder` for the pageParam component of their query keys.
 * The `next_placeholder` page param is always the last entry in the list of page params.
 *
 * A new request is triggered whenever a view's variables.fieldIds change. The optional
 * sourceFieldIds parameter allows us to seed this new query for the view with placeholder
 * data based on the previously visible fieldIds.
 *
 * @param {PaginatedMemexItemsQueryVariables} variables - the query variables for the relevant view
 * @param {ReadonlyArray<SystemColumnId | number> | undefined} sourceFieldIds - optional fieldIds to seed the placeholder query
 * @returns {useNextPlaceholderQueryReturnType}
 */
export function useNextPlaceholderQuery(
  variables: PaginatedMemexItemsQueryVariables,
  sourceFieldIds?: ReadonlyArray<SystemColumnId | number>,
): useNextPlaceholderQueryReturnType {
  const {getPageParamsQueryData, setPageParamsQueryData} = useMemexItemsPageParams(variables)
  const queryClient = useQueryClient()

  // Changing visible fieldIds will create a new query and trigger a new request.
  // We seed that query with placeholder data based on the previously visible fieldIds.
  const {memex_mwl_limited_field_ids} = useEnabledFeatures()
  const sourceVariables: PaginatedMemexItemsQueryVariables = useMemo(() => {
    if (memex_mwl_limited_field_ids) {
      return {...variables, fieldIds: sourceFieldIds ?? variables.fieldIds}
    }
    return variables
  }, [memex_mwl_limited_field_ids, sourceFieldIds, variables])
  const {getPageParamsQueryData: getSourcePageParamsQueryData} = useMemexItemsPageParams(sourceVariables)

  const setUpNextPlaceholderQueries = useCallback(() => {
    if (
      memex_mwl_limited_field_ids &&
      sourceFieldIds &&
      skipFieldIdsPlaceholder(queryClient, variables, sourceVariables)
    ) {
      return
    }
    const sourcePageParamsQueryData = getSourcePageParamsQueryData()
    if (isPageParamsDataGrouped(sourcePageParamsQueryData)) {
      setPlaceholdersForGroupedView(
        queryClient,
        variables,
        sourceVariables,
        sourcePageParamsQueryData,
        setPageParamsQueryData,
      )
    } else {
      // Build a top-level items page placeholder query using the source variables
      const placeholderSourcePages = sourcePageParamsQueryData.pageParams
        .map(pageParam => getQueryDataForMemexItemsPage(queryClient, sourceVariables, pageParam))
        .filter(page => !!page)
      // Move all data into the `afterPlaceholderData` query
      const nextPlaceholderData: MemexItemsPageQueryData = {
        nodes: placeholderSourcePages.flatMap(page => page.nodes),
        pageInfo: nextPlaceholderPageInfo,
      }
      // Set query data for the next placeholder page for the target variables
      setQueryDataForNextPlaceholder(queryClient, variables, pageTypeForUngroupedItems, nextPlaceholderData)
      // Update the page params query data to reflect the new page params: [undefined, 'next_placeholder']
      setPageParamsQueryData({pageParams: [pageParamForInitialPage, pageParamForNextPlaceholder]})
    }
  }, [
    memex_mwl_limited_field_ids,
    sourceFieldIds,
    queryClient,
    variables,
    sourceVariables,
    getSourcePageParamsQueryData,
    setPageParamsQueryData,
  ])

  const updateMemexItemsNextPlaceholderQuery = useCallback(
    (response: WithoutTotal<PaginatedItemsData>, pageType: PageTypeForGroupedItems | PageTypeForUngroupedItems) => {
      const currentPageParamsQueryData = getPageParamsQueryData()
      const isResultForGroup =
        isPageTypeForGroupedItems(pageType) && isPageParamsDataGrouped(currentPageParamsQueryData)
      const groupedItemsId = isResultForGroup ? createGroupedItemsId(pageType) : undefined
      const pageParams =
        isResultForGroup && groupedItemsId
          ? currentPageParamsQueryData.groupedItems[groupedItemsId] || []
          : currentPageParamsQueryData.pageParams
      if (pageParams[pageParams.length - 1] !== pageParamForNextPlaceholder) {
        // Nothing to handle, we can return early
        return
      }
      const newPageParams = getUpdatedItemsPageParams(queryClient, variables, pageParams, pageType, response)
      if (isResultForGroup && groupedItemsId) {
        const newGroups = {...currentPageParamsQueryData.groupedItems}
        newGroups[groupedItemsId] = newPageParams
        setPageParamsQueryData({
          ...currentPageParamsQueryData,
          groupedItems: newGroups,
        })
      } else {
        setPageParamsQueryData({
          ...currentPageParamsQueryData,
          pageParams: newPageParams,
        })
      }
    },
    [getPageParamsQueryData, queryClient, setPageParamsQueryData, variables],
  )

  const updateMemexGroupsNextPlaceholderQuery = useCallback(
    (response: WithoutTotal<PaginatedGroupsData> | WithoutTotal<PaginatedGroupsAndSecondaryGroupsData>) => {
      const currentPageParamsQueryData = getPageParamsQueryData()

      // First handle any placeholder data for each individual grouped items
      const originalGroupedItemsPageParams = isPageParamsDataGrouped(currentPageParamsQueryData)
        ? currentPageParamsQueryData.groupedItems
        : {}
      const newGroupedItemsPageParams = {...originalGroupedItemsPageParams}
      for (const groupedItems of response.groupedItems) {
        const pageType = createGroupedItemsPageType(groupedItems)
        const groupedItemsId = createGroupedItemsId(pageType)
        const pageParams = originalGroupedItemsPageParams[groupedItemsId] || []
        const updatedPageParams = getUpdatedItemsPageParams(queryClient, variables, pageParams, pageType, groupedItems)
        newGroupedItemsPageParams[groupedItemsId] = updatedPageParams
      }

      // Then handle any placeholder data for the top level groups
      const newPageParams = getUpdatedGroupsPageParams(
        queryClient,
        variables,
        currentPageParamsQueryData.pageParams,
        pageTypeForGroups,
        response.groups,
      )

      if (isPageParamsDataGroupedWithSecondaryGroups(currentPageParamsQueryData)) {
        // When paginating primary groups, we should ignore secondary groups in responses
        // as they will be duplicates of the secondary groups in the initial primary groups response.
        const isInitialPageOfPrimaryGroups = !response.groups.pageInfo.hasPreviousPage
        const originalSecondaryGroupsPageParams = currentPageParamsQueryData.secondaryGroups
        const newSecondaryGroupsPageParams =
          isInitialPageOfPrimaryGroups && response.secondaryGroups
            ? getUpdatedGroupsPageParams(
                queryClient,
                variables,
                originalSecondaryGroupsPageParams,
                pageTypeForSecondaryGroups,
                response.secondaryGroups,
              )
            : originalSecondaryGroupsPageParams

        const newPageParamsQueryData: GroupedWithSecondaryGroupsPageParamsQueryData = {
          ...currentPageParamsQueryData,
          groupedItems: newGroupedItemsPageParams,
          secondaryGroups: newSecondaryGroupsPageParams,
        }

        // When paginating secondary groups, we should ignore primary groups in responses
        // as they will be duplicates of the primary groups in the initial secondary groups response.
        const isInitialPageOfSecondaryGroups = !response.secondaryGroups?.pageInfo.hasPreviousPage
        if (isInitialPageOfSecondaryGroups) {
          newPageParamsQueryData.pageParams = newPageParams
        }
        setPageParamsQueryData(newPageParamsQueryData)
      } else {
        const newPageParamsQueryData: GroupedPageParamsQueryData = {
          pageParams: newPageParams,
          groupedItems: newGroupedItemsPageParams,
        }

        setPageParamsQueryData(newPageParamsQueryData)
      }
    },
    [getPageParamsQueryData, queryClient, setPageParamsQueryData, variables],
  )

  return {setUpNextPlaceholderQueries, updateMemexGroupsNextPlaceholderQuery, updateMemexItemsNextPlaceholderQuery}
}

type useNextPlaceholderQueryReturnType = {
  /**
   * This function sets up "placeholder" queries for the current view.
   * Placeholder queries are used to display stale data while fresh data is being fetched.
   *
   * Calling this method will not trigger any server requests.
   */
  setUpNextPlaceholderQueries: () => void
  /**
   * This function checks if a placeholder query exists for the given items PageType:
   * - If it does, it updates that query based on the fresh items data in the response.
   * - If no placeholder exists, it does nothing.
   *
   * If the placeholder query contains more items than were returned from the server,
   * this function updates the view's page params to trigger a request for the next page.
   */
  updateMemexItemsNextPlaceholderQuery: (
    response: WithoutTotal<PaginatedItemsData>,
    pageType: PageTypeForGroupedItems | PageTypeForUngroupedItems,
  ) => void
  /**
   * This function checks if placeholder queries exist for the current grouped view:
   * - If it does, it updates those queries based on the fresh data in the response.
   * - If no placeholder exists, it does nothing.
   *
   * If the placeholder query contains more groups than were returned from the server,
   * this function updates the view's page params to trigger a request for the next page
   * of groups.
   */
  updateMemexGroupsNextPlaceholderQuery: (
    response: WithoutTotal<PaginatedGroupsData> | WithoutTotal<PaginatedGroupsAndSecondaryGroupsData>,
  ) => void
}

// If we already have cached query data for the target variables,
// we don't need to setup a placeholder query using the source fieldIds.
// We can just show the cached data.
export function skipFieldIdsPlaceholder(
  queryClient: QueryClient,
  targetVariables: PaginatedMemexItemsQueryVariables,
  sourceVariables: PaginatedMemexItemsQueryVariables,
) {
  const targetPageParams = getPageParamsQueryDataForVariables(queryClient, targetVariables)
  const hasPlaceholder = targetPageParams.pageParams.includes(pageParamForNextPlaceholder)
  if (hasPlaceholder) return true
  // If the cache has data, but fewer pages loaded, we should still seed the placeholder query
  // in order to maintain scroll position.
  const sourcePageParams = getPageParamsQueryDataForVariables(queryClient, sourceVariables)
  const hasEnoughPages = targetPageParams.pageParams.length >= sourcePageParams.pageParams.length
  const targetInitialPage = isGroupByApplied(targetVariables)
    ? getQueryDataForMemexGroupsPage(queryClient, targetVariables, pageParamForInitialPage)
    : getQueryDataForMemexItemsPage(queryClient, targetVariables, pageParamForInitialPage)
  return !!targetInitialPage && hasEnoughPages
}
