import type {SubIssueSidePanelItem as SubIssueItem} from '@github-ui/sub-issues/sub-issue-types'

import {getIssueItemIdentifier} from '../../helpers/issue-url'
import type {SingleSelectValue} from '../columns/contracts/single-select'
import type {CustomColumnValueType} from '../columns/contracts/storage'
import {
  type ExtendedRepository,
  type IssueType,
  type Label,
  type LinkedPullRequest,
  type Milestone,
  State,
  type StateReason,
  type User,
} from '../common-contracts'
import type {TrackedByItem} from '../issues-graph/contracts'
import {ItemType} from './item-type'
import type {HierarchyEntry, ItemCompletion, SidePanelItem} from './side-panel-item'

interface HierarchyKey {
  repoId: number
  issueId: number
}

interface ItemHierarchy {
  key: HierarchyKey
  title: string
  url: string
  state: State
  stateReason?: StateReason
  repoName: string
  repository?: ExtendedRepository
  number: number
  assignees: Array<User>
  labels: Array<Label>
  completion?: ItemCompletion
}

const REDACTED_ISSUE_ID = -1
export class HierarchySidePanelItem implements ItemHierarchy, SidePanelItem {
  constructor(item: ItemHierarchy, completion: ItemCompletion) {
    Object.assign(this, item)
    this.completion = completion

    this.contentType = ItemType.Issue
    if (this.state === State.Draft) {
      this.contentType = ItemType.DraftIssue
    }
    if (this.itemId() === REDACTED_ISSUE_ID) {
      this.contentType = ItemType.RedactedItem
    }
  }

  key: HierarchyKey
  title: string
  url: string
  state: State
  stateReason?: StateReason
  repoName: string
  repository?: ExtendedRepository
  number: number
  assignees: Array<User>
  labels: Array<Label>
  completion?: ItemCompletion
  trackedBy?: Array<TrackedByItem>

  public readonly isHierarchy = true
  public readonly contentType: ItemType

  getState(): State {
    return this.state
  }
  isDraft(): boolean {
    return false
  }

  getItemIdentifier(): {number: number; repo: string; owner: string} | undefined {
    return getIssueItemIdentifier(this.getUrl())
  }

  hierarchyEntry(): HierarchyEntry {
    return {
      ownerId: this.key.repoId,
      itemId: this.key.issueId,
    }
  }
  id: number
  itemId(): number {
    return this.key.issueId
  }
  ownerId(): number {
    return this.key.repoId
  }
  getHtmlTitle(): string {
    return this.title
  }
  getRawTitle(): string {
    return this.title
  }
  getLabels(): Array<Label> {
    return this.labels
  }
  getUrl(): string {
    return this.url
  }
  getAssignees(): Array<User> {
    return this.assignees
  }
  getSuggestionsCacheKey(): string {
    return `${this.contentType}:${this.itemId()}`
  }
  getRepositoryName(): string {
    return this.repoName
  }
  getItemNumber(): number {
    return this.number
  }
  getMilestone(): Milestone | undefined {
    return undefined
  }
  getCompletion(): ItemCompletion | undefined {
    return this.completion
  }
  getLinkedPullRequests(): Array<LinkedPullRequest> {
    return []
  }
  getExtendedRepository(): ExtendedRepository | undefined {
    return (
      this.repository || {
        name: this.repoName,
        nameWithOwner: '',
        id: this.key.repoId,
        url: '',
        isForked: false,
        isPublic: false,
        isArchived: false,
        hasIssues: false,
      }
    )
  }
  getTrackedBy(): Array<TrackedByItem> | undefined {
    return this.trackedBy
  }

  getIssueType(): IssueType | undefined {
    return undefined
  }

  getStatus(): SingleSelectValue | undefined {
    return undefined
  }

  getCustomField<T extends CustomColumnValueType>(_fieldId: number): T | undefined {
    return undefined
  }
}

export class SubIssueSidePanelItem implements SidePanelItem {
  constructor(item: SubIssueItem) {
    this.id = item.id
    this.title = item.title
    this.number = item.number
    this.url = item.url
    this.state = item.state.toLocaleLowerCase() as State
    this.stateReason = item.stateReason?.toLocaleLowerCase() as StateReason
  }

  id: number
  title: string
  url: string
  state: State
  stateReason?: StateReason
  number: number

  public readonly isHierarchy = true
  public readonly contentType: ItemType = ItemType.Issue

  getState(): State {
    return this.state
  }
  isDraft(): boolean {
    return false
  }

  getItemIdentifier(): {number: number; repo: string; owner: string} | undefined {
    return getIssueItemIdentifier(this.getUrl())
  }

  itemId(): number {
    return this.id
  }
  ownerId(): number {
    return 0
  }
  hierarchyEntry(): HierarchyEntry {
    return {
      itemId: this.itemId(),
      ownerId: this.ownerId(),
    }
  }
  getHtmlTitle(): string {
    return this.title
  }
  getRawTitle(): string {
    return this.title
  }
  getLabels(): Array<Label> {
    return []
  }
  getUrl(): string {
    return this.url
  }
  getAssignees(): Array<User> {
    return []
  }
  getSuggestionsCacheKey(): string {
    return `${this.contentType}:${this.itemId()}`
  }
  getRepositoryName(): string {
    return ''
  }
  getItemNumber(): number {
    return this.number
  }
  getMilestone(): Milestone | undefined {
    return undefined
  }
  getCompletion(): ItemCompletion | undefined {
    return undefined
  }
  getLinkedPullRequests(): Array<LinkedPullRequest> {
    return []
  }
  getExtendedRepository(): ExtendedRepository | undefined {
    return undefined
  }

  getIssueType(): IssueType | undefined {
    return undefined
  }

  getStatus(): SingleSelectValue | undefined {
    return undefined
  }

  getTrackedBy(): Array<TrackedByItem> | undefined {
    return undefined
  }

  getCustomField<T extends CustomColumnValueType>(_fieldId: number): T | undefined {
    return undefined
  }
}
