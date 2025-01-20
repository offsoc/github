import type {Iteration} from '../columns/contracts/iteration'
import type {MemexProjectColumnId, SystemColumnId} from '../columns/contracts/memex-column'
import type {PersistedOption} from '../columns/contracts/single-select'
import type {ExtendedRepository, IAssignee, IssueType, Label, Milestone, ParentIssue} from '../common-contracts'
import type {MemexItem, PaginatedItemsScope} from './contracts'

export type GroupMetadata =
  | ExtendedRepository
  | IAssignee
  | IssueType
  | Iteration
  | Label
  | Milestone
  | PersistedOption
  | ParentIssue

export type SliceMetadata = GroupMetadata

export type PaginatedTotalCount = {
  value: number
  isApproximate: boolean
}

export type SliceData = {
  sliceId: string
  sliceValue: string
  sliceMetadata?: SliceMetadata
  totalCount: PaginatedTotalCount
}

export type PageInfo = {
  hasNextPage: boolean
  hasPreviousPage: boolean
  endCursor?: string
  startCursor?: string
}

export type GroupedMemexItems<TMemexItemType> = {
  groupId: string
  secondaryGroupId?: string
  nodes: Array<TMemexItemType>
  pageInfo: PageInfo
}

export type Group = {
  groupId: string
  groupValue: string
  groupMetadata?: GroupMetadata
  totalCount: PaginatedTotalCount
}

export type PaginatedGroups = {
  nodes: Array<Group>
  pageInfo: PageInfo
}

type BasePaginatedData = {
  totalCount: PaginatedTotalCount
  slices?: Array<SliceData>
}

export type PaginatedItemsData = BasePaginatedData & {
  nodes: Array<MemexItem>
  pageInfo: PageInfo
}

export type PaginatedGroupsData = BasePaginatedData & {
  groups: PaginatedGroups
  groupedItems: Array<GroupedMemexItems<MemexItem>>
  secondaryGroups: null
}

export type PaginatedGroupsAndSecondaryGroupsData = Omit<PaginatedGroupsData, 'secondaryGroups'> & {
  secondaryGroups: PaginatedGroups
}

export type PaginatedMemexItemsData = PaginatedItemsData | PaginatedGroupsData | PaginatedGroupsAndSecondaryGroupsData

type BasePaginationParameters = {
  /** Server-generated cursor indicating where we want to start the items / groups returned */
  after?: string
  /** Maximum number of items / groups to return */
  first?: number
}

type SecondaryGroupPaginationParameters = {
  /** Server-generated cursor indicating where we want to start the secondary groups returned.
   * Only applies if the current view is grouped in two directions (e.g. swimlanes in a board view)
   */
  secondaryAfter?: string
}

type ItemPaginationParameters = BasePaginationParameters & {
  /** Server-generated cursor indicating where we want to start the items / groups returned, working backwards */
  before?: string
  /** Maximum number of items / groups to return */
  last?: number
}

type SliceByParameters = {
  /** Field by which the view is sliced */
  sliceByColumnId?: MemexProjectColumnId
  /** Value for which we want to filter items */
  sliceByValue?: string
}

type SharedViewRequestParameters = {
  /** Query string from the filter for a view */
  q?: string
  /** Whether to return all, archived, or unarchived items */
  scope?: PaginatedItemsScope
  /** Field and direction by which the view is sorted */
  sortedBy?: Array<{columnId: number; direction: 'asc' | 'desc'}>
  /** A subset of field ids for the view, based on the visible fields */
  fieldIds?: ReadonlyArray<SystemColumnId | number>
}

type HorizontalGroupByParameters = {
  /** Field used for horizontal grouping in the view */
  horizontalGroupedByColumnId?: MemexProjectColumnId
  /** Horizontal group value for which we want to request more items */
  groupedByGroupValue?: string
}

type VerticalGroupByParameters = {
  /** Field used for vertical grouping in the view */
  verticalGroupedByColumnId?: MemexProjectColumnId
  /** Vertical group value for which we want to request more items */
  verticalGroupedByGroupValue?: string
}

export type PaginatedItemsRequest = SharedViewRequestParameters & ItemPaginationParameters & SliceByParameters
export type PaginatedItemsResponse = PaginatedItemsData

export type PaginatedGroupedItemsRequest = SharedViewRequestParameters &
  ItemPaginationParameters &
  SliceByParameters &
  (
    | Required<HorizontalGroupByParameters>
    | Required<VerticalGroupByParameters>
    | (Required<HorizontalGroupByParameters> & Required<VerticalGroupByParameters>)
  )
export type PaginatedGroupedItemsResponse = PaginatedItemsData

export type PaginatedGroupsRequest = SharedViewRequestParameters &
  BasePaginationParameters &
  SliceByParameters &
  ({horizontalGroupedByColumnId: MemexProjectColumnId} | {verticalGroupedByColumnId: MemexProjectColumnId})
export type PaginatedGroupsResponse = PaginatedGroupsData

export type PaginatedGroupsAndSecondaryGroupsRequest = SharedViewRequestParameters &
  BasePaginationParameters &
  SecondaryGroupPaginationParameters &
  SliceByParameters & {
    horizontalGroupedByColumnId: MemexProjectColumnId
    verticalGroupedByColumnId: MemexProjectColumnId
  }
export type PaginatedGroupsAndSecondaryGroupsResponse = PaginatedGroupsAndSecondaryGroupsData

export type GroupedItemBatchRequest = SharedViewRequestParameters &
  SliceByParameters & {
    after: string
    secondaryAfter: string
    horizontalGroupedByColumnId: MemexProjectColumnId
    verticalGroupedByColumnId: MemexProjectColumnId
  }
export type GroupedItemBatchResponse = PaginatedGroupsAndSecondaryGroupsData

/**
 * Parameters that are used in the request to the `paginated_items` endpoint.
 * They will be converted to query parameters as part of `apiGetPaginatedItems`.
 */
export type GetPaginatedItemsRequest = SharedViewRequestParameters &
  SliceByParameters &
  ItemPaginationParameters &
  SecondaryGroupPaginationParameters &
  HorizontalGroupByParameters &
  VerticalGroupByParameters

/**
 * Shape of response to a request to the `paginated_items` endpoint.
 * Can contain items, groups, secondary groups, grouped items, slice
 * by data, pagination information as well as total count data, depending
 * on the parameters in the request.
 */
export type GetPaginatedItemsResponse = PaginatedMemexItemsData
