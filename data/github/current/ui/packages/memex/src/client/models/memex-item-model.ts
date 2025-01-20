import type {LocalUpdatePayload, TitleUpdateValue, UpdateColumnValueAction} from '../api/columns/contracts/domain'
import {SystemColumnId} from '../api/columns/contracts/memex-column'
import type {SingleSelectValue} from '../api/columns/contracts/single-select'
import type {
  ColumnData,
  CustomColumnValueType,
  MemexColumnData,
  TitleColumnType,
} from '../api/columns/contracts/storage'
import type {IssueTitleValue, PullRequestTitleValue, TitleValueBase} from '../api/columns/contracts/title'
import {
  type ExtendedRepository,
  type IssueType,
  type Label,
  type LinkedPullRequest,
  type Milestone,
  type ParentIssue,
  type Review,
  State,
  type StateReason,
  type User as Assignee,
} from '../api/common-contracts'
import type {TrackedByItem} from '../api/issues-graph/contracts'
import type {
  ArchivedInfo,
  DraftIssue,
  DraftIssueContent,
  Issue,
  IssueContent,
  ItemContent,
  MemexItem,
  MemexItemBase,
  PullRequest,
  PullRequestContent,
  RedactedItem,
  RedactedItemContent,
  UpdateMemexItemResponseData,
} from '../api/memex-items/contracts'
import {ItemType} from '../api/memex-items/item-type'
import type {HierarchyEntry, ItemCompletion} from '../api/memex-items/side-panel-item'
import {getIssueItemIdentifier} from '../helpers/issue-url'
import {parseTitleDefaultHtml, parseTitleDefaultRaw} from '../helpers/parsing'
import type {RequireAtLeastOne} from '../helpers/type-utilities'

export type UpdateMemexItemActions = RequireAtLeastOne<
  {columnValues?: Array<UpdateColumnValueAction>} & {
    previousMemexProjectItemId?: number | ''
  }
>

abstract class MemexItemModelBase<TContent extends ItemContent> implements MemexItemBase {
  protected columnData: ColumnData = {}
  public skippingLiveUpdates = false
  public id: number
  public priority: number | null
  public updatedAt?: string
  public createdAt?: string
  public abstract contentType: ItemType
  public abstract content: TContent
  public abstract contentRepositoryId: number | null
  public archived?: ArchivedInfo
  public issueCreatedAt?: string
  public issueClosedAt?: string
  public state?: 'closed' | 'open'
  public stateReason?: StateReason

  /**
   * This value represents the index of the item in the prioritized list.
   * It is calculated just-in-time when we determine the filtered set of items
   * for the table view.
   * Else, it is set to the item id by default in the constructor.
   *
   * It is used to break ties when two items have the same value in a sorted table.
   *
   * This value closely corresponds to the `priority` value that is determined by the server.
   * However, because we cannot optimistically calculate an updated priority on the client when
   * reprioritizing an item, we use this value to break ties, allowing us to immediately render
   * a row in its correct location in a sorted table, instead of waiting for a response from the server
   * with a new priority.
   */
  public prioritizedIndex: number

  constructor(item: MemexItem) {
    this.setItemData(item)
    this.archived = item.archived

    this.memexProjectColumnValues = item.memexProjectColumnValues
    this.prioritizedIndex = item.id
  }
  memexProjectColumnValues: Array<MemexColumnData>

  // sidePanelItem interfaces
  // i would like to make these all properties and set them in the constructor
  // but i don't know if state changes over time. do changes in source data
  // create a new memex item or update the existing? if its an update i think we need methods as below
  public readonly isHierarchy = false
  getState(): State {
    throw new Error('Method not implemented.')
  }

  getSuggestionsCacheKey(): string {
    return `${this.contentType}:${this.itemId()}`
  }

  getItemIdentifier(): {number: number; repo: string; owner: string} | undefined {
    return undefined
  }

  isDraft(): boolean {
    return false
  }

  hierarchyEntry(): HierarchyEntry {
    return {
      ownerId: this.contentRepositoryId || 0,
      itemId: this.content?.id || 0,
    }
  }
  memexItemId(): number {
    return this.id
  }
  itemId(): number {
    return this.content.id
  }

  ownerId(): number {
    return this.contentRepositoryId || 0
  }

  getLabels(): Array<Label> {
    return this.columns.Labels || []
  }
  getUrl(): string {
    return ''
  }
  getHtmlTitle() {
    return parseTitleDefaultHtml(this.columns.Title)
  }
  getRawTitle() {
    return parseTitleDefaultRaw(this.columns.Title)
  }
  getAssignees(): Array<Assignee> {
    return this.columns.Assignees || []
  }

  getReviewers(): Array<Review> {
    return this.columns.Reviewers || []
  }

  getRepositoryName(): string {
    return this.columns.Repository?.name || ''
  }

  /**
   * Returns the repository name, repository owner login, and issue number in a format like `github/repo#123`
   */
  getNameWithOwnerReference(): string {
    const nwo = this.getExtendedRepository()?.nameWithOwner
    if (!nwo) return ''
    const number = this.getItemNumber()
    return `${nwo}#${number}`
  }

  getItemNumber(): number {
    return 0
  }

  getMilestone(): Milestone | undefined {
    return this.columns.Milestone
  }
  getLinkedPullRequests(): Array<LinkedPullRequest> {
    return this.columns['Linked pull requests'] || []
  }
  getExtendedRepository(): ExtendedRepository | undefined {
    return this.columns.Repository
  }
  getCompletion(): ItemCompletion | undefined {
    return this.columns.Tracks
  }
  getTrackedBy(): Array<TrackedByItem> | undefined {
    return this.columns['Tracked by']
  }

  getIssueType(): IssueType | undefined {
    return this.columns[SystemColumnId.IssueType]
  }

  getParentIssue(): ParentIssue | undefined {
    return this.columns[SystemColumnId.ParentIssue]
  }

  login(): string | undefined {
    return undefined
  }

  getStatus(): SingleSelectValue | undefined {
    return this.columnData[SystemColumnId.Status]
  }

  getCustomField<T extends CustomColumnValueType>(fieldId: number): T | undefined {
    return this.columnData[fieldId] as T
  }

  public get columns(): Readonly<ColumnData> {
    return this.columnData
  }

  private setItemData(item: UpdateMemexItemResponseData) {
    this.id = item.id
    this.priority = item.priority

    if (item.updatedAt) {
      this.updatedAt = item.updatedAt
    }

    if (item.createdAt) {
      this.createdAt = item.createdAt
    }

    if (item.issueCreatedAt) {
      this.issueCreatedAt = item.issueCreatedAt
    }

    if (item.issueClosedAt) {
      this.issueClosedAt = item.issueClosedAt
    }

    if (item.state) {
      this.state = item.state
    }

    if (item.stateReason) {
      this.stateReason = item.stateReason
    }

    if (item.content) {
      // the item's content won't be in the response data for a change
      // that was only re-prioritizing the item.
      this.content = {...this.content, ...item.content}
    }

    if (this.contentType !== item.contentType) {
      this.contentType = item.contentType
    }

    if (item.memexProjectColumnValues) {
      this.columnData = {} as ColumnData

      for (const column of item.memexProjectColumnValues) {
        this.setColumnValueForItemColumnType(column)
      }
    }
  }

  protected isTitleForIssue(newValue?: TitleColumnType) {
    if (!newValue) {
      return false
    }

    if (typeof newValue.title === 'string') {
      return false
    }

    return 'raw' in newValue.title && 'html' in newValue.title
  }

  // To run a set of updates where we ignore live updates for this item while they
  // are running wrap them in a call to this function
  public async whileSkippingLiveUpdates(cb: () => Promise<void>): Promise<void> {
    try {
      this.skippingLiveUpdates = true
      await cb()
      this.skippingLiveUpdates = false
    } catch (err) {
      this.skippingLiveUpdates = false
      throw err
    }
  }

  /**
   * Convert the received title value shape into a format that can be stored
   * in column data, and include the content type to assist with retrieving
   * the value later without access to the `MemexItemModel`.
   *
   * @param newValue the new value to apply to the column data for this item
   */
  private setTitleValue(newValue: TitleValueBase | TitleUpdateValue) {
    switch (this.contentType) {
      case ItemType.DraftIssue: {
        const {title} = newValue
        if (typeof title === 'string') {
          // this is a redacted item, ignore
          break
        }

        // If the title is a string, the item is a redacted issue and we should ignore it.
        // Otherwise, we should set the title to the new value only if it contains `raw` and `html` properties
        // Please note a DraftIssue can transition to an Issue or a PullRequest at any time, therefore
        // we validate the value in order to satisfy the `DenormalizedTitleValue` type.
        if (this.isTitleForIssue(newValue)) {
          this.columnData[SystemColumnId.Title] = {contentType: ItemType.DraftIssue, value: {...newValue, title}}
        }

        break
      }
      case ItemType.RedactedItem: {
        const {title} = newValue

        // we only set the title for a redacted item when the title is a string
        if (typeof title === 'string') {
          this.columnData.Title = {contentType: ItemType.RedactedItem, value: {title}}
        }
        break
      }
      case ItemType.Issue: {
        if ('isDraft' in newValue) {
          // this is a PR, ignore
          return
        }

        // We only set the title for an issue when the new value contains a number
        if ('number' in newValue && this.isTitleForIssue(newValue)) {
          this.columnData.Title = {contentType: ItemType.Issue, value: newValue}
        }
        break
      }

      case ItemType.PullRequest: {
        // We only set the title for a PR when the new value has the `isDraft` property
        if ('isDraft' in newValue && this.isTitleForIssue(newValue)) {
          this.columnData[SystemColumnId.Title] = {contentType: ItemType.PullRequest, value: newValue}
        }
        break
      }
    }
  }

  /**
   * This method ensures that a value is correctly assign to an item's column
   * base on the column's data type. By not making assumptions about the data type we can later let
   * the type to be inferred from the value correctly.
   *
   * @param columnData - The value to set for an item's column
   */
  public setColumnValueForItemColumnType(columnData: MemexColumnData | LocalUpdatePayload): void {
    switch (columnData.memexProjectColumnId) {
      case SystemColumnId.Title:
        this.setTitleValue(columnData.value)
        break
      case SystemColumnId.Assignees:
        this.columnData[SystemColumnId.Assignees] =
          columnData.value?.sort((a, b) => a.login.localeCompare(b.login)) ?? undefined
        break
      case SystemColumnId.Labels:
        this.columnData[SystemColumnId.Labels] =
          columnData.value?.sort((a, b) => a.name.localeCompare(b.name)) ?? undefined
        break
      case SystemColumnId.LinkedPullRequests:
        this.columnData[SystemColumnId.LinkedPullRequests] =
          columnData.value?.sort((a, b) => a.number - b.number) ?? undefined
        break
      case SystemColumnId.Milestone:
        this.columnData[SystemColumnId.Milestone] = columnData.value ?? undefined
        break
      case SystemColumnId.ParentIssue:
        this.columnData[SystemColumnId.ParentIssue] = columnData.value ?? undefined
        break
      case SystemColumnId.Repository:
        this.columnData[SystemColumnId.Repository] = columnData.value ?? undefined
        break
      case SystemColumnId.Reviewers:
        this.columnData[SystemColumnId.Reviewers] =
          columnData.value?.sort((a, b) => a.reviewer.name.localeCompare(b.reviewer.name)) ?? undefined
        break
      case SystemColumnId.Status:
        this.columnData[SystemColumnId.Status] = columnData.value ?? undefined
        break
      case SystemColumnId.Tracks:
        this.columnData[SystemColumnId.Tracks] = columnData.value ?? undefined
        break
      case SystemColumnId.TrackedBy:
        this.columnData[SystemColumnId.TrackedBy] = columnData.value ?? undefined
        break
      case SystemColumnId.IssueType:
        this.columnData[SystemColumnId.IssueType] = columnData.value ?? undefined
        break
      case SystemColumnId.SubIssuesProgress:
        this.columnData[SystemColumnId.SubIssuesProgress] = columnData.value ?? undefined
        break
      default:
        this.columnData[columnData.memexProjectColumnId] = columnData.value ?? undefined
        break
    }
  }
}

export class DraftIssueModel extends MemexItemModelBase<DraftIssueContent> {
  public readonly contentType = ItemType.DraftIssue
  public readonly contentRepositoryId: null
  public content: DraftIssueContent

  constructor(item: DraftIssue) {
    super(item)
    this.content = item.content
  }

  override isDraft(): boolean {
    return true
  }

  override getState(): State {
    // TODO hierarchy: maybe we should return State | undefined instead?
    return State.Draft
  }
}

export class RedactedItemModel extends MemexItemModelBase<RedactedItemContent> {
  public readonly contentType = ItemType.RedactedItem
  public readonly content: RedactedItemContent
  public readonly contentRepositoryId: null

  constructor(item: RedactedItem) {
    super(item)
    this.content = item.content
  }

  override getState(): State {
    // TODO hierarchy: maybe we should return State | undefined instead?
    return State.Open
  }
}

export class IssueModel extends MemexItemModelBase<IssueContent> {
  public readonly contentType = ItemType.Issue
  public readonly content: IssueContent
  public readonly contentRepositoryId: number

  constructor(item: Issue) {
    super(item)

    this.content = item.content
    this.contentRepositoryId = item.contentRepositoryId
  }

  override getState(): State {
    return (this.columnData[SystemColumnId.Title]?.value as IssueTitleValue).state as unknown as State
  }
  override getUrl(): string {
    return this.content.url
  }
  override getItemNumber(): number {
    return (this.columnData[SystemColumnId.Title]?.value as IssueTitleValue).number
  }

  override getItemIdentifier(): {number: number; repo: string; owner: string} | undefined {
    return getIssueItemIdentifier(this.getUrl())
  }
}

export class PullRequestModel extends MemexItemModelBase<PullRequestContent> {
  public readonly contentType = ItemType.PullRequest
  public readonly content: PullRequestContent
  public readonly contentRepositoryId: number

  constructor(item: PullRequest) {
    super(item)

    this.content = item.content
    this.contentRepositoryId = item.contentRepositoryId
  }

  override getState(): State {
    return (this.columnData[SystemColumnId.Title]?.value as PullRequestTitleValue).state as unknown as State
  }
  override isDraft() {
    return (this.columnData[SystemColumnId.Title]?.value as PullRequestTitleValue).isDraft
  }
  override getUrl(): string {
    return this.content.url
  }
  override getItemNumber(): number {
    return (this.columnData[SystemColumnId.Title]?.value as IssueTitleValue).number
  }
}

export type MemexItemModel = DraftIssueModel | RedactedItemModel | IssueModel | PullRequestModel

export function createMemexItemModel(item: MemexItem): MemexItemModel {
  switch (item.contentType) {
    case ItemType.DraftIssue:
      return new DraftIssueModel(item)
    case ItemType.RedactedItem:
      return new RedactedItemModel(item)
    case ItemType.Issue:
      return new IssueModel(item)
    case ItemType.PullRequest:
      return new PullRequestModel(item)
  }
}

export function isInstanceOfMemexItemModel(item: unknown): item is MemexItemModel {
  return item instanceof MemexItemModelBase
}

export function buildUpdateMemexItemActions(
  columnValues: Array<UpdateColumnValueAction> | undefined,
  previousMemexProjectItemId: number | '' | undefined,
): UpdateMemexItemActions | undefined {
  if (!columnValues?.length && previousMemexProjectItemId == null) {
    return undefined
  }
  return {columnValues, previousMemexProjectItemId} as UpdateMemexItemActions
}

export function getHovercardSubjectTag(item: MemexItemModel) {
  if (item.contentType === ItemType.PullRequest) {
    return `pull_request:${item.content.id}`
  } else if (item.contentType === ItemType.Issue) {
    return `issue:${item.content.id}`
  }
  return undefined
}
