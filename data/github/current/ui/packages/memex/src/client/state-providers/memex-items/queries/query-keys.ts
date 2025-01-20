import type {Query, QueryKey} from '@tanstack/react-query'

import type {MemexItem} from '../../../api/memex-items/contracts'
import type {GroupedMemexItems} from '../../../api/memex-items/paginated-views'
import {getEnabledFeatures} from '../../../helpers/feature-flags'
import {
  type GroupedItemBatchPageParam,
  type PageParam,
  pageParamForInitialPage,
  type PaginatedMemexItemsQueryVariables,
  type SliceByQueryVariables,
} from './types'

export const paginatedMemexItemsQueryKey = 'paginatedMemexItems'
export const pageParamsQueryKey = 'pageParamsData'
export const sliceByDataQueryKey = 'sliceByData'
export const totalCountsQueryKey = 'paginatedTotalCounts'

export const pageTypeForUngroupedItems = 'ungrouped'
export const pageTypeForGroups = 'groups'
export const pageTypeForSecondaryGroups = 'secondaryGroups'
export const pageTypeForGroupedItemBatches = 'groupedItemBatches'
export type PageTypeForUngroupedItems = typeof pageTypeForUngroupedItems
export type PageTypeForGroups = typeof pageTypeForGroups
export type PageTypeForSecondaryGroups = typeof pageTypeForSecondaryGroups
export type PageTypeForGroupedItemBatches = typeof pageTypeForGroupedItemBatches
export type GroupId = string
export type PageTypeForGroupedItems = {groupId: GroupId; secondaryGroupId?: GroupId}

// We explicitly do not include the PageTypeForGroupedItemBatches here, as there are only
// a few places where we want to consider that page type, so we instead prefer to explicitly
// use PageType | PageTypeForGroupedItemBatches in those scenarios.
export type PageType =
  | PageTypeForGroupedItems
  | PageTypeForUngroupedItems
  | PageTypeForGroups
  | PageTypeForSecondaryGroups

// This needs to be a value that cannot exist in the server-generated group ids
const groupedItemsIdSeparator = ':'

export type GroupedMemexItemsQueryKey = [
  typeof paginatedMemexItemsQueryKey,
  PaginatedMemexItemsQueryVariables,
  PageTypeForGroupedItems,
  PageParam,
]

export type UngroupedMemexItemsQueryKey = [
  typeof paginatedMemexItemsQueryKey,
  PaginatedMemexItemsQueryVariables,
  PageTypeForUngroupedItems,
  PageParam,
]

export type MemexGroupsQueryKey = [
  typeof paginatedMemexItemsQueryKey,
  PaginatedMemexItemsQueryVariables,
  PageTypeForGroups,
  PageParam,
]

export type MemexSecondaryGroupsQueryKey = [
  typeof paginatedMemexItemsQueryKey,
  PaginatedMemexItemsQueryVariables,
  PageTypeForSecondaryGroups,
  PageParam,
]

export type GroupedItemBatchQueryKey = [
  typeof paginatedMemexItemsQueryKey,
  PaginatedMemexItemsQueryVariables,
  PageTypeForGroupedItemBatches,
  GroupedItemBatchPageParam,
]

export type PaginatedMemexItemsQueryKey =
  | GroupedMemexItemsQueryKey
  | UngroupedMemexItemsQueryKey
  | MemexGroupsQueryKey
  | MemexSecondaryGroupsQueryKey

export const buildMemexItemsOrGroupsQueryKey = (
  variables: PaginatedMemexItemsQueryVariables,
  pageType: PageType,
  pageParam: PageParam,
): PaginatedMemexItemsQueryKey => {
  return [paginatedMemexItemsQueryKey, variables, pageType, pageParam]
}

export function buildUngroupedMemexItemsQueryKey(
  variables: PaginatedMemexItemsQueryVariables,
  pageParam: PageParam,
): UngroupedMemexItemsQueryKey {
  return [paginatedMemexItemsQueryKey, variables, pageTypeForUngroupedItems, pageParam]
}

export function buildMemexGroupsQueryKey(
  variables: PaginatedMemexItemsQueryVariables,
  pageParam: PageParam,
): MemexGroupsQueryKey {
  return [paginatedMemexItemsQueryKey, variables, pageTypeForGroups, pageParam]
}

export function buildMemexSecondaryGroupsQueryKey(
  variables: PaginatedMemexItemsQueryVariables,
  pageParam: PageParam,
): MemexSecondaryGroupsQueryKey {
  return [paginatedMemexItemsQueryKey, variables, pageTypeForSecondaryGroups, pageParam]
}

export function buildGroupedMemexItemsQueryKey(
  variables: PaginatedMemexItemsQueryVariables,
  pageType: PageTypeForGroupedItems,
  pageParam: PageParam,
): GroupedMemexItemsQueryKey {
  return [paginatedMemexItemsQueryKey, variables, pageType, pageParam]
}

export function buildGroupedItemBatchQueryKey(
  variables: PaginatedMemexItemsQueryVariables,
  pageParam: GroupedItemBatchPageParam,
): GroupedItemBatchQueryKey {
  return [paginatedMemexItemsQueryKey, variables, pageTypeForGroupedItemBatches, pageParam]
}

export type PageParamsQueryKey = [
  typeof paginatedMemexItemsQueryKey,
  PaginatedMemexItemsQueryVariables,
  typeof pageParamsQueryKey,
]

export type SliceByDataQueryKey = [
  typeof paginatedMemexItemsQueryKey,
  PaginatedMemexItemsQueryVariables,
  typeof sliceByDataQueryKey,
]

export type TotalCountsDataQueryKey = [
  typeof paginatedMemexItemsQueryKey,
  PaginatedMemexItemsQueryVariables,
  typeof totalCountsQueryKey,
]

export const buildPageParamsQueryKey = (variables: PaginatedMemexItemsQueryVariables): PageParamsQueryKey => {
  return [paginatedMemexItemsQueryKey, variables, pageParamsQueryKey]
}

export const buildSliceDataQueryKey = (variables: SliceByQueryVariables): SliceByDataQueryKey => {
  return [paginatedMemexItemsQueryKey, variables, sliceByDataQueryKey]
}

export const buildPaginatedTotalCountsQueryKey = (
  variables: PaginatedMemexItemsQueryVariables,
): TotalCountsDataQueryKey => {
  return [paginatedMemexItemsQueryKey, variables, totalCountsQueryKey]
}

/**
 * A utility method for looking up the pageType from a `react-query` `QueryKey`. The `QueryKey`
 * is implemented as an Array under the hood.
 * @param queryKey A query key for paginated memex items data.
 * @returns The pageType from the query key.
 */
export const getPageTypeFromQueryKey = (queryKey: PaginatedMemexItemsQueryKey): PageType => {
  return queryKey[2]
}

export const isQueryKeyForGroups = (queryKey: PaginatedMemexItemsQueryKey): boolean => {
  // A query key that looks like:
  // ['paginatedMemexItems', {q: '', sortedBy: [], horizontalGroupedByColumnId: 'Status'}, "groups", undefined]
  // Represents a page of groups
  return queryKey[2] === pageTypeForGroups
}

export const isQueryKeyForSecondaryGroups = (queryKey: PaginatedMemexItemsQueryKey): boolean => {
  // A query key that looks like:
  // ['paginatedMemexItems', {q: '', sortedBy: [], horizontalGroupedByColumnId: 'Status', verticalGroupedByColumnId: 'Assignees'}, "secondaryGroups", undefined]
  // Represents a page of secondary groups
  return queryKey[2] === pageTypeForSecondaryGroups
}

export const isQueryKeyForGroupedItems = (
  queryKey: PaginatedMemexItemsQueryKey,
): queryKey is GroupedMemexItemsQueryKey => {
  // A query key that looks like:
  // ['paginatedMemexItems', {q: '', sortedBy: [], horizontalGroupedByColumnId: 'Status'}, {groupId: 'groupId1'}, undefined]
  // Represents a page of grouped items (i.e. the intersection of a primary and secondary group)
  return isPageTypeForGroupedItems(queryKey[2])
}

/**
 * A utility method determining whether a given `queryKey` represents the query which
 * initially populates the view.
 * When a view is ungrouped, this means the initial page of items.
 * When a view is grouped, this means the initial page of groups, which seeds the initial
 * pages of groupedItems and (potentially) an initial secondary groups.
 */
export const isInitialQueryKeyForView = (queryKey: PaginatedMemexItemsQueryKey): boolean => {
  const isPageTypeForGroupsOrUngroupedItems =
    queryKey[2] === pageTypeForGroups || queryKey[2] === pageTypeForUngroupedItems
  return queryKey[3] === pageParamForInitialPage && isPageTypeForGroupsOrUngroupedItems
}

/**
 * A utility method determining whether a given `PageType` represents a page of grouped items.
 */
export const isPageTypeForGroupedItems = (pageType: PageType): pageType is PageTypeForGroupedItems => {
  return typeof pageType === 'object' && 'groupId' in pageType
}

/**
 * A utility method determining whether a given `PageType` represents a page of items.
 * The page of items may be grouped or ungrouped.
 */
export const isPageOfItems = (pageType: PageType): pageType is PageTypeForGroupedItems | PageTypeForUngroupedItems => {
  return isPageTypeForGroupedItems(pageType) || pageType === pageTypeForUngroupedItems
}

export const createGroupedItemsPageType = (group: GroupedMemexItems<MemexItem>): PageTypeForGroupedItems => {
  const {memex_mwl_swimlanes} = getEnabledFeatures()
  if (memex_mwl_swimlanes) {
    return {groupId: group.groupId, secondaryGroupId: group.secondaryGroupId}
  }
  return {groupId: group.groupId}
}

export const createGroupedItemsPageTypeFromGroupedItemsId = (groupedItemsId: string): PageTypeForGroupedItems => {
  const {memex_mwl_swimlanes} = getEnabledFeatures()
  if (memex_mwl_swimlanes) {
    const indexOfSeparator = groupedItemsId.indexOf(groupedItemsIdSeparator)
    if (indexOfSeparator !== -1) {
      return {
        groupId: groupedItemsId.substring(0, indexOfSeparator),
        secondaryGroupId: groupedItemsId.substring(indexOfSeparator + groupedItemsIdSeparator.length),
      }
    } else {
      return {groupId: groupedItemsId}
    }
  }
  return {groupId: groupedItemsId}
}

export const createGroupedItemsId = (pageType: PageTypeForGroupedItems) => {
  const {memex_mwl_swimlanes} = getEnabledFeatures()
  if (memex_mwl_swimlanes) {
    if (pageType.secondaryGroupId) {
      // Build a string that looks like `groupId1:secondaryGroupId1`
      return `${pageType.groupId}${groupedItemsIdSeparator}${pageType.secondaryGroupId}`
    } else {
      return pageType.groupId
    }
  }
  return pageType.groupId
}

/**
 * Given a single query, checks to see whether or not the query represents data
 * indirectly related to memex items or groups, e.g. Page Params, Total Counts, Slice By Data, etc.
 *
 * This helper is used as the `predicate` when filtering queries with `get`/`setQueriesData`.
 *
 * All queries in the query cache related to memex items and groups live under a top-level
 * 'paginatedMemexItems` query key, so we use that top-level query key when we want to inspect or
 * modify all of these queries broadly, like during cache invalidation.
 *
 * However, we often _do not_ want to consider the sort of ancillary data referenced in this function,
 * so by using this function as a predicate, we can filter these queries out early by inspecting
 * the last part of the query key.
 */
export const isQueryForItemsMetadata = (query: Query<unknown, Error, unknown, QueryKey>) => {
  const queryKey = query.queryKey
  const lastPartOfQueryKey = queryKey[queryKey.length - 1]
  return (
    lastPartOfQueryKey === pageParamsQueryKey ||
    lastPartOfQueryKey === totalCountsQueryKey ||
    lastPartOfQueryKey === sliceByDataQueryKey
  )
}
