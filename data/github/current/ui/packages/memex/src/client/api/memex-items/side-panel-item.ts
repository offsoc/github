import type {SingleSelectValue} from '../columns/contracts/single-select'
import type {CustomColumnValueType} from '../columns/contracts/storage'
import type {
  ExtendedRepository,
  IssueType,
  Label,
  LinkedPullRequest,
  Milestone,
  State,
  StateReason,
  User,
} from '../common-contracts'
import type {TrackedByItem} from '../issues-graph/contracts'
import type {ItemType} from './item-type'

// sidePanelItem interfaces
// i would like to make these all properties and set them in the constructor
// but i don't know if state changes over time. do changes in source data
// create a new memex item or update the existing? if its an update i think we need methods as below
export interface SidePanelItem {
  isHierarchy: boolean
  contentType: ItemType
  id: number

  ownerId(): number
  itemId(): number
  memexItemId?(): number
  getState(): State
  stateReason?: StateReason
  isDraft(): boolean

  hierarchyEntry(): HierarchyEntry

  getItemIdentifier(): {number: number; repo: string; owner: string} | undefined

  getUrl(): string
  getHtmlTitle(): string
  getRawTitle(): string
  getSuggestionsCacheKey(): string

  completion?: ItemCompletion

  getLabels(): Array<Label>
  getAssignees(): Array<User>
  getRepositoryName(): string
  getItemNumber(): number
  getMilestone(): Milestone | undefined
  getLinkedPullRequests(): Array<LinkedPullRequest>
  getExtendedRepository(): ExtendedRepository | undefined
  getCompletion(): ItemCompletion | undefined
  getTrackedBy(): Array<TrackedByItem> | undefined
  getIssueType(): IssueType | undefined
  getStatus(): SingleSelectValue | undefined
  getCustomField<T extends CustomColumnValueType>(fieldId: number): T | undefined
}

export interface ItemCompletion {
  completed: number
  total: number
  percent: number
}

export interface HierarchyEntry {
  ownerId: number
  itemId: number
}

export const SidePanelTypeParam = {
  INFO: 'info',
  BULK_ADD: 'bulk-add',
  ISSUE: 'issue',
} as const
export type SidePanelTypeParam =
  | typeof SidePanelTypeParam.INFO
  | typeof SidePanelTypeParam.BULK_ADD
  | typeof SidePanelTypeParam.ISSUE
