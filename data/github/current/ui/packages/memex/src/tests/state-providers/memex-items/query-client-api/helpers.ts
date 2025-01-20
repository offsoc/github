import {QueryClient, QueryObserver} from '@tanstack/react-query'

import type {MemexItem} from '../../../../client/api/memex-items/contracts'
import type {
  Group,
  GroupedMemexItems,
  GroupMetadata,
  PageInfo,
  PaginatedMemexItemsData,
  PaginatedTotalCount,
  SliceData,
} from '../../../../client/api/memex-items/paginated-views'
import type {MemexItemModel} from '../../../../client/models/memex-item-model'
import {
  buildGroupedMemexItemsQueryKey,
  buildUngroupedMemexItemsQueryKey,
  type GroupedMemexItemsQueryKey,
  type PageTypeForGroupedItems,
  type PaginatedMemexItemsQueryKey,
  type UngroupedMemexItemsQueryKey,
} from '../../../../client/state-providers/memex-items/queries/query-keys'
import {
  type PageParam,
  pageParamForInitialPage,
  type PaginatedMemexItemsQueryVariables,
} from '../../../../client/state-providers/memex-items/queries/types'
import {
  setQueryDataForGroupedItemsPage,
  setQueryDataForMemexItemsPage,
} from '../../../../client/state-providers/memex-items/query-client-api/memex-items'
import {
  getQueryDataForMemexItemsTotalCounts,
  mergeQueryDataForMemexItemsTotalCounts,
} from '../../../../client/state-providers/memex-items/query-client-api/memex-totals'

export function initQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        structuralSharing: false,
        // this behaviour is behind a feature flag in production
        // but we are updating our tests to avoid any "offline mode" usage
        // given these are running within a jsdom environment
        networkMode: 'always',
      },
    },
  })
}

export function setMemexItemsForPage(
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
  pageParam: PageParam,
  memexItemModels: Array<MemexItemModel>,
  totalItemsOnServer?: number,
) {
  const queryData = {
    nodes: memexItemModels,
    pageInfo: {endCursor: '', startCursor: '', hasNextPage: false, hasPreviousPage: false},
  }
  setQueryDataForMemexItemsPage(queryClient, variables, pageParam, queryData)

  const totals = getQueryDataForMemexItemsTotalCounts(queryClient, variables)
  totals.totalCount = {value: totalItemsOnServer || memexItemModels.length, isApproximate: false}
  mergeQueryDataForMemexItemsTotalCounts(queryClient, variables, totals)
}

export function setGroupedItemsForPage(
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
  pageType: PageTypeForGroupedItems,
  pageParam: PageParam,
  memexItemModels: Array<MemexItemModel>,
  totalItemsOnServer?: number,
  totalItemsInGroupOnServer?: number,
) {
  const queryData = {
    nodes: memexItemModels,
    pageInfo: {endCursor: '', startCursor: '', hasNextPage: false, hasPreviousPage: false},
  }
  setQueryDataForGroupedItemsPage(queryClient, variables, pageType, pageParam, queryData)

  const totals = getQueryDataForMemexItemsTotalCounts(queryClient, variables)
  const groupTotal = {value: totalItemsInGroupOnServer || memexItemModels.length, isApproximate: false}
  totals.groups[pageType.groupId] = groupTotal
  if (pageType.secondaryGroupId) {
    totals.groups[pageType.secondaryGroupId] = groupTotal
  }
  totals.totalCount = {value: totalItemsOnServer || memexItemModels.length, isApproximate: false}
  mergeQueryDataForMemexItemsTotalCounts(queryClient, variables, totals)
}

export function setAndActivateInitialQueriesByPage(
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
  itemsByPage: Array<Array<MemexItemModel>>,
  totalItemsOnServer?: number,
) {
  const queryKeys: Array<UngroupedMemexItemsQueryKey> = []
  const totalItems = totalItemsOnServer || itemsByPage.flat().length
  for (const [index, items] of itemsByPage.entries()) {
    const pageParam = index === 0 ? pageParamForInitialPage : {after: index.toString()}
    setMemexItemsForPage(queryClient, variables, pageParam, items, totalItems)
    const queryKey = buildUngroupedMemexItemsQueryKey(variables, pageParam)
    queryKeys.push(queryKey)
    activateQueryByQueryKey(queryClient, queryKey)
  }
  return queryKeys
}

export function setAndActivateInitialQueriesByPageForGroup(
  queryClient: QueryClient,
  variables: PaginatedMemexItemsQueryVariables,
  pageType: PageTypeForGroupedItems,
  itemsByPage: Array<Array<MemexItemModel>>,
  totalItemsOnServer?: number,
) {
  const queryKeys: Array<GroupedMemexItemsQueryKey> = []
  const totalItems = totalItemsOnServer || itemsByPage.flat().length
  const totalItemsInGroup = itemsByPage.flat().length
  for (const [index, items] of itemsByPage.entries()) {
    const pageParam = index === 0 ? pageParamForInitialPage : {after: index.toString()}
    setGroupedItemsForPage(queryClient, variables, pageType, pageParam, items, totalItems, totalItemsInGroup)
    const queryKey = buildGroupedMemexItemsQueryKey(variables, pageType, pageParam)
    queryKeys.push(queryKey)
    activateQueryByQueryKey(queryClient, queryKey)
  }
  return queryKeys
}

export function activateQueryByQueryKey(queryClient: QueryClient, queryKey: PaginatedMemexItemsQueryKey) {
  queryClient.getQueryCache().find({queryKey})?.addObserver(new QueryObserver(queryClient, {queryKey}))
}

type PartialGroup = {
  groupId: string
  groupValue?: string
  groupMetadata?: GroupMetadata
  items: Array<MemexItem>
  pageInfoForItemsInGroup?: PageInfo
  totalCountOfItemsInGroup?: PaginatedTotalCount
}

type PartialResponse = {
  groups: Array<PartialGroup>
  pageInfoForGroups?: PageInfo
  totalCount?: PaginatedTotalCount
  slices?: Array<SliceData>
}

type PartialGroupWithNestedItems = {
  groupId: string
  groupValue?: string
  groupMetadata?: GroupMetadata
  nestedItems: Array<{secondaryGroupId: string; items: Array<MemexItem>; pageInfo?: PageInfo}>
  totalCountOfItemsInGroup?: PaginatedTotalCount
}

type PartialSecondaryGroup = Omit<PartialGroupWithNestedItems, 'nestedItems'>

type PartialResponseWithSecondaryGroups = {
  groups: Array<PartialGroupWithNestedItems>
  secondaryGroups: Array<PartialSecondaryGroup>
  pageInfoForGroups?: PageInfo
  pageInfoForSecondaryGroups?: PageInfo
  totalCount?: PaginatedTotalCount
  slices?: Array<SliceData>
}

export function buildGroupedItemsResponse(partialResponse: PartialResponse): PaginatedMemexItemsData {
  const groups: Array<Group> = partialResponse.groups.map(
    ({items: nodes, pageInfoForItemsInGroup, totalCountOfItemsInGroup, ...g}) => {
      const group: Group = {
        groupValue: `${g.groupId}_value`,
        totalCount: totalCountOfItemsInGroup || {isApproximate: false, value: nodes.length},
        ...g,
      }
      return group
    },
  )
  const groupedItems: Array<GroupedMemexItems<MemexItem>> = partialResponse.groups.map(g => ({
    groupId: g.groupId,
    pageInfo: g.pageInfoForItemsInGroup || {hasNextPage: false, hasPreviousPage: false},
    nodes: g.items,
  }))
  return {
    groups: {
      nodes: groups,
      pageInfo: partialResponse.pageInfoForGroups || {hasNextPage: false, hasPreviousPage: false},
    },
    secondaryGroups: null,
    groupedItems,
    totalCount: partialResponse.totalCount || {
      isApproximate: false,
      value: groups.reduce((prev, curr) => prev + curr.totalCount.value, 0),
    },
    slices: partialResponse.slices,
  }
}

export function buildGroupedItemsResponseWithSecondaryGroups(
  partialResponse: PartialResponseWithSecondaryGroups,
): PaginatedMemexItemsData {
  const groups: Array<Group> = partialResponse.groups.map(({nestedItems, totalCountOfItemsInGroup, ...g}) => {
    const totalCountValue = nestedItems.reduce((prev, curr) => prev + curr.items.length, 0)
    const group: Group = {
      groupValue: `${g.groupId}_value`,
      totalCount: totalCountOfItemsInGroup || {isApproximate: false, value: totalCountValue},
      ...g,
    }
    return group
  })

  const secondaryGroups: Array<Group> = partialResponse.secondaryGroups.map(({totalCountOfItemsInGroup, ...g}) => {
    const totalCountValue = partialResponse.groups.reduce((prev, curr) => {
      const nestedItemsForSecondary =
        curr.nestedItems.find(nested => nested.secondaryGroupId === g.groupId)?.items.length || 0
      return prev + nestedItemsForSecondary
    }, 0)

    const group: Group = {
      groupValue: `${g.groupId}_value`,
      totalCount: totalCountOfItemsInGroup || {isApproximate: false, value: totalCountValue},
      ...g,
    }
    return group
  })
  const groupedItems: Array<GroupedMemexItems<MemexItem>> = partialResponse.groups.flatMap(g => {
    return g.nestedItems.reduce(
      (prev, curr) => {
        const groupedItemsForNestedItems: GroupedMemexItems<MemexItem> = {
          groupId: g.groupId,
          secondaryGroupId: curr.secondaryGroupId,
          pageInfo: curr.pageInfo || {hasNextPage: false, hasPreviousPage: false},
          nodes: curr.items,
        }
        return [...prev, groupedItemsForNestedItems]
      },
      [] as Array<GroupedMemexItems<MemexItem>>,
    )
  })
  return {
    groups: {
      nodes: groups,
      pageInfo: partialResponse.pageInfoForGroups || {hasNextPage: false, hasPreviousPage: false},
    },
    secondaryGroups: {
      nodes: secondaryGroups,
      pageInfo: partialResponse.pageInfoForSecondaryGroups || {hasNextPage: false, hasPreviousPage: false},
    },
    groupedItems,
    totalCount: partialResponse.totalCount || {
      isApproximate: false,
      value: groups.reduce((prev, curr) => prev + curr.totalCount.value, 0),
    },
    slices: partialResponse.slices,
  }
}
