import type {QueryClient} from '@tanstack/react-query'

import {
  setQueryDataForMemexGroupsPage,
  setQueryDataForMemexSecondaryGroupsPage,
} from '../../query-client-api/memex-groups'
import {setQueryDataForGroupedItemsPage, setQueryDataForMemexItemsPage} from '../../query-client-api/memex-items'
import {isQueryDataGrouped} from '../query-data-helpers'
import {isPageTypeForGroupedItems, type PageType, pageTypeForGroups} from '../query-keys'
import {type MemexPageQueryData, pageParamForNextPlaceholder, type PaginatedMemexItemsQueryVariables} from '../types'

/*
 * Set next placeholder query data in the cache based on page type.
 *
 * @returns {void}
 */
export function setQueryDataForNextPlaceholder(
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
  pageType: PageType,
  nextPlaceholderData: MemexPageQueryData,
) {
  if (isQueryDataGrouped(nextPlaceholderData)) {
    if (pageType === pageTypeForGroups) {
      setQueryDataForMemexGroupsPage(queryClient, variables, pageParamForNextPlaceholder, nextPlaceholderData)
    } else {
      setQueryDataForMemexSecondaryGroupsPage(queryClient, variables, pageParamForNextPlaceholder, nextPlaceholderData)
    }
  } else if (isPageTypeForGroupedItems(pageType)) {
    setQueryDataForGroupedItemsPage(queryClient, variables, pageType, pageParamForNextPlaceholder, nextPlaceholderData)
  } else {
    setQueryDataForMemexItemsPage(queryClient, variables, pageParamForNextPlaceholder, nextPlaceholderData)
  }
}
