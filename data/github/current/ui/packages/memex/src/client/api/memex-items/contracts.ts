import type {RequireAtLeastOne} from '../../helpers/type-utilities'
import type {LocalUpdatePayload} from '../columns/contracts/domain'
import type {MemexColumn, SystemColumnId} from '../columns/contracts/memex-column'
import type {ColumnUpdateData, MemexColumnData, MemexItemColumnUpdateData} from '../columns/contracts/storage'
import type {IAssignee, IssueType, Label, Milestone, StateReason, User} from '../common-contracts'
import type {ItemTrackedByParent} from '../issues-graph/contracts'
import type {ItemType} from './item-type'
import type {ItemCompletion} from './side-panel-item'

export const NO_GROUP_VALUE = '_noValue'

type Optional<T extends object, P extends keyof T> = Omit<T, P> & {[K in P]?: T[K]}

type JobWithUrl = {
  job: {
    url: string
  }
}

export interface AddMemexItemRequest {
  memexProjectItem: MemexItemCreateData
}

export interface AddMemexItemResponse {
  memexProjectItem: MemexItem
  memexProjectColumn: null | Array<Pick<MemexColumn, 'id' | 'partialFailures'>>
}

export type BulkAddItem = {
  userName: string
  repoName: string
  number: number
}

export interface BulkAddMemexItemsRequest {
  memexProjectItem: {
    contentType: typeof ItemType.DraftIssue
    content: {
      title: string
    }
    memexProjectColumnValues?: Array<ColumnUpdateData>
  }
}

export type BulkAddMemexItemsResponse = JobWithUrl & {
  notParsedContent: string
}

export type BulkUpdateMemexItemsRequest = {
  fieldIds: ReadonlyArray<SystemColumnId | number>
  memexProjectItems: Array<{id: number} & MemexItemColumnUpdateData>
}

export type BulkUpdateError = {
  message: string
  memexProjectItemId: number | string
}

export interface BulkUpdateMemexItemsResponse {
  job?: string
  totalUpdatedItems: number
  memexProjectItems?: Array<UpdateMemexItemResponseData>
  bulkUpdateErrors?: Array<BulkUpdateError>
  errors?: Array<string>
}

export interface GetMemexItemRequest {
  memexProjectItemId: number
}

export interface GetMemexItemResponse {
  memexProjectItem: MemexItem
}

export type UpdateMemexItemResponseData = Optional<MemexItem, 'memexProjectColumnValues' | 'content'>

export type IUpdateMemexItemRequest = MemexItemUpdateData & {
  memexProjectItemId: number
  fieldIds: ReadonlyArray<SystemColumnId | number>
}

export interface UpdateMemexItemResponse {
  memexProjectItem: UpdateMemexItemResponseData
}

export type RemoveMemexItemRequest =
  | {
      memexProjectItemIds: Array<number>
    }
  | {
      q: string
      scope: PaginatedItemsScope
    }

export interface ArchiveMemexItemRequest {
  memexProjectItemIds: Array<number>
}

export type UnarchiveMemexItemRequest =
  | {
      memexProjectItemIds: Array<number>
    }
  | {q: string}

export type IRemoveMemexItemResponse = void | JobWithUrl

export type ArchiveMemexItemResponse = void

export type UnarchiveMemexItemResponse = void | JobWithUrl

export interface ConvertDraftItemToIssueRequest {
  memexProjectItemId: number
  repositoryId: number
}

export interface ConvertDraftItemToIssueResponse {
  memexProjectItem: MemexItem
  warnings?: {
    invalidAssigneeLogins?: Array<string>
  }
}

interface GetSuggestedMetadataRequest {
  memexProjectItemId: number
}
export type IGetSuggestedAssigneesRequest = GetSuggestedMetadataRequest

export interface GetSuggestedAssigneesResponse {
  suggestions: Array<SuggestedAssignee>
}

export type IGetSuggestedLabelsRequest = GetSuggestedMetadataRequest

export interface GetSuggestedLabelsResponse {
  suggestions: Array<SuggestedLabel>
}

export type IGetSuggestedMilestonesRequest = GetSuggestedMetadataRequest

export interface GetSuggestedMilestonesResponse {
  suggestions: Array<SuggestedMilestone>
}

export type IGetSuggestedIssueTypesRequest = GetSuggestedMetadataRequest

export interface GetSuggestedIssueTypesResponse {
  suggestions: Array<SuggestedIssueType>
}

interface GetItemsTrackedByParentRequest {
  issueId: number
}

export type IGetItemsTrackedByParentRequest = GetItemsTrackedByParentRequest

export interface GetItemsTrackedByParentResponse {
  count: number
  items: Array<ItemTrackedByParent>
  parentCompletion: ItemCompletion
}

export interface SuggestedAssignee extends IAssignee {
  selected: boolean
}

export interface SuggestedLabel extends Label {
  selected: boolean
}

export interface SuggestedMilestone extends Milestone {
  selected: boolean
}

export interface SuggestedIssueType extends IssueType {
  selected: boolean
}

interface MemexItemDraftIssueCreateData {
  contentType: typeof ItemType.DraftIssue
  content: {
    title: string
  }
  memexProjectColumnValues?: Array<ColumnUpdateData>
  localColumnValues?: Array<LocalUpdatePayload>
  previousMemexProjectItemId?: number | ''
}

interface MemexItemIssueCreateData {
  contentType: typeof ItemType.Issue
  content: {
    id: number
    repositoryId: number
  }
  memexProjectColumnValues?: Array<ColumnUpdateData>
  localColumnValues?: Array<LocalUpdatePayload>
  previousMemexProjectItemId?: number | ''
}

interface MemexItemPullRequestCreateData {
  contentType: typeof ItemType.PullRequest
  content: {
    id: number
    repositoryId: number
  }
  memexProjectColumnValues?: Array<ColumnUpdateData>
  localColumnValues?: Array<LocalUpdatePayload>
  previousMemexProjectItemId?: number | ''
}

export type MemexItemCreateData =
  | MemexItemDraftIssueCreateData
  | MemexItemIssueCreateData
  | MemexItemPullRequestCreateData

interface ReprioritizeMemexItemData {
  previousMemexProjectItemId: number | ''
}

/**
 * Requires that at least one of previousMemexProjectItemId or memexProjectColumnValues is defined
 * For the following declarations:
 * const data1: MemexItemUpdateData = {}
 * const data2: MemexItemUpdateData = {memexProjectColumnValues: []}
 * const data3: MemexItemUpdateData = {previousMemexProjectItemId: ''}
 * const data4: MemexItemUpdateData = {memexProjectColumnValues: [], previousMemexProjectItemId: ''}
 * data1 will generate a compiler error, while all of the others are type-safe
 */
export type MemexItemUpdateData = RequireAtLeastOne<ReprioritizeMemexItemData & MemexItemColumnUpdateData>

export interface ItemContent {
  id: number
}

export interface IssueOrPullRequestContent extends ItemContent {
  url: string
}

export type PullRequestContent = IssueOrPullRequestContent
export interface IssueContent extends IssueOrPullRequestContent {
  globalRelayId?: string
}

export type DraftIssueContent = ItemContent
export type RedactedItemContent = ItemContent

export interface ArchivedInfo {
  archivedAt: string
  archivedBy?: User
}

export interface MemexItemBase {
  id: number
  priority: number | null
  updatedAt?: string
  createdAt?: string
  memexProjectColumnValues: Array<MemexColumnData>
  archived?: ArchivedInfo
  issueCreatedAt?: string
  issueClosedAt?: string
  state?: 'closed' | 'open'
  stateReason?: StateReason
}

export interface RedactedItem extends MemexItemBase {
  contentType: typeof ItemType.RedactedItem
  content: RedactedItemContent
}

export interface DraftIssue extends MemexItemBase {
  contentType: typeof ItemType.DraftIssue
  content: DraftIssueContent
}

export interface PullRequest extends MemexItemBase {
  contentType: typeof ItemType.PullRequest
  content: PullRequestContent
  contentRepositoryId: number
}

export interface Issue extends MemexItemBase {
  contentType: typeof ItemType.Issue
  content: IssueContent
  contentRepositoryId: number
}

export type MemexItem = RedactedItem | DraftIssue | PullRequest | Issue

export type GetArchivedMemexItemsRequest = {
  perPage?: number
  visibleFields?: Array<SystemColumnId | number>
}

export type GetArchivedMemexItemsResponse = {
  totalCount: number
  memexProjectItems: Array<MemexItem>
}

export type GetArchiveStatusResponse = {
  isArchiveFull: boolean
  totalCount: number
  archiveLimit: number
}

export type PaginatedItemsScope = 'all' | 'archived' | 'unarchived'

export type ResyncElasticsearchIndexResponse = JobWithUrl
