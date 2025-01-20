import type {
  GetPaginatedItemsRequest,
  Group,
  PageInfo,
  PaginatedTotalCount,
  SliceData,
} from '../../../api/memex-items/paginated-views'
import type {MemexItemModel} from '../../../models/memex-item-model'

export type WithoutTotal<TDataType> = Omit<TDataType, 'totalCount'>

export type WithTotal<TDataType> = TDataType & {totalCount: PaginatedTotalCount}

// Represents the data for a single page / query of memex items. This is the data
// that is returned by a call to `queryClient.getQueryData` for one of the `paginated-memex-items` queries.
export type MemexItemsPageQueryData = {
  nodes: Array<MemexItemModel>
  pageInfo: PageInfo
}

export type PaginatedGroupQueryData = WithoutTotal<Group>

// Represents a page of groups. The items themselves will be stored in a different page / query, but
// we also need to store the list of groups and page info for a given page of groups.
export type MemexGroupsPageQueryData = {
  groups: Array<PaginatedGroupQueryData>
  pageInfo: PageInfo
}

export type MemexPageQueryData = MemexItemsPageQueryData | MemexGroupsPageQueryData

/**
 * If a page was not fetched using any before or after parameters,
 * then its corresponding PageParam will be undefined.
 * We give this special case a named constant to clarify its usage.
 */
export const pageParamForInitialPage = undefined

/**
 * When a query is invalidated, its current data is moved into a
 * temporary placeholder query. This 'stale' data is displayed
 * to the user until fresh data is available.
 * We use `next_placeholder` as the PageParam for this placeholder
 * query's QueryKey:
 * ['paginatedMemexItems', { q: '', sortBy: []}, undefined, 'next_placeholder']
 */
export const pageParamForNextPlaceholder = 'next_placeholder'

/**
 * Represents how a single page of memex items is requested from the server.
 * If this value is pageParamForInitialPage, it means that it was the first page that was requested
 * either via the initial JSON island, or via an API request.
 * If this value is pageParamForNextPlaceholder, it's a page of stale data to
 * temporarily display while fresh data is refetched.
 */
export type PageParam =
  | {after: string}
  | {before: string}
  | typeof pageParamForInitialPage
  | typeof pageParamForNextPlaceholder

// Each group contains a groupId which corresponds to its key in Elasticsearch.
// Each group also contains an array of page params, which are used to request
// additional pages of grouped items from the server.
// Typically for forward pagination, the first element of pageParams will be pageParamForInitialPage,
// and subsequent elements will be {after: string}, where the value is the
// endCursor from the previous page.

export type PageParamsByGroupedItemsId = Record<
  /** Corresponds to its a key in from one or more groups */
  string,
  /** Indicates how many pages of data are currently loaded for the grouped items, as well as how to request data for each page */
  Array<PageParam>
>

/**
 * Represents the metadata used when we have grouped memex items.
 */
export type GroupedPageParamsQueryData = {
  /** Represents the pageParams for each grouped items, keyed by groupId. */
  groupedItems: PageParamsByGroupedItemsId
  /** Indicates how many pages of groups are loaded, as well as how to request new groups */
  pageParams: Array<PageParam>
}

/**
 * A pair of after cursors that point to a specific page of groups and a specific
 * page of secondary groups.
 * Used to request the "batch" of grouped items (or "cells") at the intersection
 * of those two pages when a view is grouped in two directions.
 */
export type GroupedItemBatchPageParam = {
  after: string
  secondaryAfter: string
}

/**
 * Represents the metadata used when we have grouped memex items.
 */
export type GroupedWithSecondaryGroupsPageParamsQueryData = GroupedPageParamsQueryData & {
  /** Indicates how many pages of secondary groups are loaded, as well as how to request new secondary groups */
  secondaryGroups: Array<PageParam>
  /** Represents the page params for extra requests of grouped items, given an after param for primary and secondary groups */
  groupedItemBatches: Array<GroupedItemBatchPageParam>
}

/**
 * Represents the metadata used when we have ungrouped memex items.
 */
export type UngroupedPageParamsQueryData = {
  /** Indicates how many pages of items are loaded, as well as how to request new pages */
  pageParams: Array<PageParam>
}

// Note: Total counts per groupedItems "cell" aren't used in the UI and so aren't tracked.
export type MemexItemsTotalCountsQueryData = {
  /** Represents the totalCount of items in each primary or secondary group
   * that match the current query, keyed by groupId. */
  groups: Record<string, PaginatedTotalCount>
  /** Represents the totalCount for all items matching the current query */
  totalCount: PaginatedTotalCount
}

/**
 * For typical forward pagination, the first element of pageParams will be pageParamForInitialPage,
 * and subsequent elements will be {after: string}, where the value is the
 * endCursor from the previous page.
 */
export type PageParamsQueryData =
  | GroupedPageParamsQueryData
  | GroupedWithSecondaryGroupsPageParamsQueryData
  | UngroupedPageParamsQueryData

// Represents the parameters used in a request for paginated data that are included in our query key.
// When the local state for one of these variables changes, we will build a new query key and re-request data from the server.
export type PaginatedMemexItemsQueryVariables = Pick<
  GetPaginatedItemsRequest,
  | 'q'
  | 'sortedBy'
  | 'horizontalGroupedByColumnId'
  | 'verticalGroupedByColumnId'
  | 'sliceByColumnId'
  | 'sliceByValue'
  | 'fieldIds'
>

export type SliceByQueryVariables = Omit<PaginatedMemexItemsQueryVariables, 'sliceByValue' | 'fieldIds'>
export type SliceByQueryData = {slices: Array<SliceData>}

export type GroupedItemBatchPageQueryData = GroupedItemBatchPageParam
