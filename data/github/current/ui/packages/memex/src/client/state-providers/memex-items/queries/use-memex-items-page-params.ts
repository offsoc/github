import type {QueryClient} from '@tanstack/react-query'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import {useCallback} from 'react'

import {buildInitialItemsAndColumns} from '../memex-items-data'
import {setQueryDataForMemexGroupsPage} from '../query-client-api/memex-groups'
import {hasMemexItemsQueryData, setQueryDataForMemexItemsPage} from '../query-client-api/memex-items'
import {getPageParamsQueryDataForVariables, setPageParamsQueryDataForVariables} from '../query-client-api/page-params'
import {handlePaginatedItemsResponse, isQueryDataResponseGrouped} from './handle-paginated-items-response'
import {buildPageParamsQueryKey, createGroupedItemsId} from './query-keys'
import {isGroupByApplied, isGroupByAppliedInBothDirections} from './query-variables'
import {
  type GroupedPageParamsQueryData,
  type GroupedWithSecondaryGroupsPageParamsQueryData,
  pageParamForInitialPage,
  type PageParamsByGroupedItemsId,
  type PageParamsQueryData,
  type PaginatedMemexItemsQueryVariables,
  type UngroupedPageParamsQueryData,
} from './types'

type UseMemexItemsPageParamsReturnType = {
  pageParamsQueryData: PageParamsQueryData
  getPageParamsQueryData: () => PageParamsQueryData
  setPageParamsQueryData: (newPageParamsQueryData: PageParamsQueryData) => void
}

/**
 * A thin API around the react-query `useQuery` that represents which query keys should be considered
 * active based on pagination data we've loaded.
 * @param variables Used in the query key for our active query data. Ensures that
 * the data is reset when we change the request parameters for the active sort, filter, etc.
 * @returns callbacks for interacting with the active query query data.
 */
export function useMemexItemsPageParams(
  variables: PaginatedMemexItemsQueryVariables,
): UseMemexItemsPageParamsReturnType {
  const queryClient = useQueryClient()

  const initialData = buildInitialPageParamsQueryData(queryClient, variables)

  const {data: pageParamsQueryData} = useQuery({
    queryKey: buildPageParamsQueryKey(variables),
    initialData,
    enabled: false,
    structuralSharing: false,
  })

  const setPageParamsQueryData = useCallback(
    (newQueryData: PageParamsQueryData) => {
      setPageParamsQueryDataForVariables(queryClient, variables, newQueryData)
    },
    [queryClient, variables],
  )

  const getPageParamsQueryData = useCallback(() => {
    return getPageParamsQueryDataForVariables(queryClient, variables)
  }, [queryClient, variables])

  return {
    pageParamsQueryData,
    setPageParamsQueryData,
    getPageParamsQueryData,
  }
}

/**
 * Produce the `initialData` property for our page params query.
 * If we don't yet have query data, then we'll need to
 * read paginated items data from the JSON island, and then
 * populate the initial query cache for the items data, and
 * finally build and return an initial PageParamsQueryData.
 * Otherwise, we can just produce a default, empty page params object
 * and rely on the handling of the request to update it as necessary.
 */
function buildInitialPageParamsQueryData(
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
): PageParamsQueryData {
  if (!hasMemexItemsQueryData(queryClient)) {
    // If we have not yet read any data into the queryClient, then go ahead and
    // read data from the JSON island. We'll use this data to populate our
    // page params query data, as well as setting up the initial queries for each
    // group (or a single query representing all items in the JSON island if we're ungrouped)
    // This data is then provided as `initialData` for our `useQuery` below.
    const {memexItems} = buildInitialItemsAndColumns('memex-paginated-items-data')
    const queryDataFromResponse = handlePaginatedItemsResponse(queryClient, variables, memexItems)

    if (isQueryDataResponseGrouped(queryDataFromResponse)) {
      setQueryDataForMemexGroupsPage(queryClient, variables, pageParamForInitialPage, queryDataFromResponse.queryData)

      const pageParamsByGroupedItemsId: PageParamsByGroupedItemsId = queryDataFromResponse.groupedItems.reduce(
        (map, pageType) => {
          const groupedItemsId = createGroupedItemsId(pageType)
          map[groupedItemsId] = [pageParamForInitialPage]
          return map
        },
        {} as PageParamsByGroupedItemsId,
      )

      if (queryDataFromResponse.secondaryGroups) {
        const secondaryGroups = [pageParamForInitialPage]
        const pageParamsQueryData: GroupedWithSecondaryGroupsPageParamsQueryData = {
          groupedItems: pageParamsByGroupedItemsId,
          pageParams: [pageParamForInitialPage],
          secondaryGroups,
          groupedItemBatches: [],
        }
        return pageParamsQueryData
      }

      const pageParamsQueryData: GroupedPageParamsQueryData = {
        groupedItems: pageParamsByGroupedItemsId,
        pageParams: [pageParamForInitialPage],
      }
      return pageParamsQueryData
    } else {
      setQueryDataForMemexItemsPage(queryClient, variables, pageParamForInitialPage, queryDataFromResponse.queryData)

      return {pageParams: [pageParamForInitialPage]}
    }
  } else {
    // All views start with a single page param which triggers a single request
    // for the initial page of data.
    const intitialPageParamsForView: UngroupedPageParamsQueryData = {pageParams: [pageParamForInitialPage]}
    if (isGroupByAppliedInBothDirections(variables)) {
      // When the view is grouped in both directions, initialize empty
      // groupedItems, secondaryGroups, and groupedItemBatches objects.
      // These will be populated using the initial server response.
      const pageParams: GroupedWithSecondaryGroupsPageParamsQueryData = {
        ...intitialPageParamsForView,
        groupedItems: {},
        secondaryGroups: [],
        groupedItemBatches: [],
      }
      return pageParams
    } else if (isGroupByApplied(variables)) {
      // When the view is grouped, we should initialize the groupedItems object.
      // This will be populated using the initial server response.
      const pageParams: GroupedPageParamsQueryData = {...intitialPageParamsForView, groupedItems: {}}
      return pageParams
    } else {
      // When view is ungrouped, no additional initialization is needed
      return intitialPageParamsForView
    }
  }
}
