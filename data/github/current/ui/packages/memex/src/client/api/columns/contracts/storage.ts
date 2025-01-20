// This module contains the type declarations for storing and updating data
// within the application
import type {ItemType} from '../../../api/memex-items/item-type'
import type {
  ExtendedRepository,
  IAssignee,
  IssueType,
  Label,
  LinkedPullRequest,
  Milestone,
  ParentIssue,
  Review,
  SubIssuesProgress,
} from '../../common-contracts'
import type {TrackedByItem} from '../../issues-graph/contracts'
import type {ServerDateValue} from './date'
import type {IterationValue} from './iteration'
import type {SystemColumnId} from './memex-column'
import type {NumericValue} from './number'
import type {SingleSelectValue} from './single-select'
import type {EnrichedText} from './text'
import type {DraftIssueTitleValue, IssueTitleValue, PullRequestTitleValue, RedactedItemTitleValue} from './title'
import type {Progress} from './tracks'

type CustomColumnId = number

export interface DraftIssueTitleColumnData {
  memexProjectColumnId: typeof SystemColumnId.Title
  value: DraftIssueTitleValue
}

export interface RedactedItemTitleColumnData {
  memexProjectColumnId: typeof SystemColumnId.Title
  value: RedactedItemTitleValue
}

export interface IssueTitleColumnData {
  memexProjectColumnId: typeof SystemColumnId.Title
  value: IssueTitleValue
}

export interface PullRequestTitleColumnData {
  memexProjectColumnId: typeof SystemColumnId.Title
  value: PullRequestTitleValue
}

export interface AssigneesColumnData {
  memexProjectColumnId: typeof SystemColumnId.Assignees
  value: Array<IAssignee> | null
}

export interface MilestoneColumnData {
  memexProjectColumnId: typeof SystemColumnId.Milestone
  value: Milestone | null
}

export interface IterationColumnData {
  memexProjectColumnId: CustomColumnId
  value: IterationValue | null
}

export interface LabelsColumnData {
  memexProjectColumnId: typeof SystemColumnId.Labels
  value: Array<Label> | null
}

export interface LinkedPullRequestsColumnData {
  memexProjectColumnId: typeof SystemColumnId.LinkedPullRequests
  value: Array<LinkedPullRequest> | null
}

export interface RepositoryColumnData {
  memexProjectColumnId: typeof SystemColumnId.Repository
  value: ExtendedRepository | null
}

export interface ReviewersColumnData {
  memexProjectColumnId: typeof SystemColumnId.Reviewers
  value: Array<Review> | null
}

export interface TracksColumnData {
  memexProjectColumnId: typeof SystemColumnId.Tracks
  value: Progress | null
}

export interface TrackedByColumnData {
  memexProjectColumnId: typeof SystemColumnId.TrackedBy
  value: Array<TrackedByItem> | null
}

export interface IssueTypeColumnData {
  memexProjectColumnId: typeof SystemColumnId.IssueType
  value: IssueType | null
}

export interface ParentIssueColumnData {
  memexProjectColumnId: typeof SystemColumnId.ParentIssue
  value: ParentIssue | null
}

export interface StatusColumnData {
  memexProjectColumnId: typeof SystemColumnId.Status
  value: SingleSelectValue | null
}

export interface TextColumnData {
  memexProjectColumnId: CustomColumnId
  value: EnrichedText | null
}

export interface NumberColumnData {
  memexProjectColumnId: CustomColumnId
  value: NumericValue | null
}

export interface DateColumnData {
  memexProjectColumnId: CustomColumnId
  value: ServerDateValue | null
}

export interface SingleSelectColumnData {
  memexProjectColumnId: CustomColumnId
  value: SingleSelectValue | null
}

export interface SubIssuesProgressColumnData {
  memexProjectColumnId: typeof SystemColumnId.SubIssuesProgress
  value: SubIssuesProgress | null
}

export type MemexColumnData =
  | AssigneesColumnData
  | MilestoneColumnData
  | IterationColumnData
  | LabelsColumnData
  | LinkedPullRequestsColumnData
  | ParentIssueColumnData
  | RepositoryColumnData
  | ReviewersColumnData
  | TracksColumnData
  | TrackedByColumnData
  | IssueTypeColumnData
  | StatusColumnData
  | TextColumnData
  | NumberColumnData
  | DateColumnData
  | SingleSelectColumnData
  | DraftIssueTitleColumnData
  | RedactedItemTitleColumnData
  | IssueTitleColumnData
  | PullRequestTitleColumnData
  | SubIssuesProgressColumnData

export type MemexColumnDataValue = MemexColumnData['value']

export interface DateValue {
  value: Date
}

/**
 * Custom column storage on the client will be one of these values.
 *
 * Please add additional types to this value and follow the examples in
 * `src/client/helpers/parsing.ts` to add support for parsing values from the
 * flexible column storage on the client.
 */
export type CustomColumnValueType = EnrichedText | NumericValue | ServerDateValue | SingleSelectValue | undefined
export type TitleColumnType = IssueTitleValue | PullRequestTitleValue | DraftIssueTitleValue | RedactedItemTitleValue
export type TitleColumnData =
  | IssueTitleColumnData
  | PullRequestTitleColumnData
  | DraftIssueTitleColumnData
  | RedactedItemTitleColumnData

export type ColumnData = {
  [SystemColumnId.Assignees]?: Array<IAssignee>
  [SystemColumnId.Labels]?: Array<Label>
  [SystemColumnId.LinkedPullRequests]?: Array<LinkedPullRequest>
  [SystemColumnId.Tracks]?: Progress
  [SystemColumnId.TrackedBy]?: Array<TrackedByItem>
  [SystemColumnId.Milestone]?: Milestone
  [SystemColumnId.Repository]?: ExtendedRepository
  [SystemColumnId.Reviewers]?: Array<Review>
  [SystemColumnId.Title]?: TitleValueWithContentType
  [SystemColumnId.Status]?: SingleSelectValue
  [SystemColumnId.IssueType]?: IssueType
  [SystemColumnId.ParentIssue]?: ParentIssue
  [SystemColumnId.SubIssuesProgress]?: SubIssuesProgress
  [id: CustomColumnId]: CustomColumnValueType
}

export type IssueTitleWithContentType = {
  contentType: typeof ItemType.Issue
  value: IssueTitleValue
}

export type PullRequestTitleWithContentType = {
  contentType: typeof ItemType.PullRequest
  value: PullRequestTitleValue
}

type DraftTitleWithContentType = {
  contentType: typeof ItemType.DraftIssue
  value: DraftIssueTitleValue
}

type RedactedTitleWithContentType = {
  contentType: typeof ItemType.RedactedItem
  value: RedactedItemTitleValue
}

/**
 * Special type that represents the combination of contentType (derived from
 * the `MemexItemModel`) and the title value, to decouple the places where we
 * need to know more about the title value.
 */
export type TitleValueWithContentType =
  | DraftTitleWithContentType
  | RedactedTitleWithContentType
  | IssueTitleWithContentType
  | PullRequestTitleWithContentType

export interface UpdateTitleColumnData {
  memexProjectColumnId: typeof SystemColumnId.Title
  value: {title: string} | null
}
export interface UpdateAssigneesColumnData {
  memexProjectColumnId: typeof SystemColumnId.Assignees
  value: Array<number> | null
}
export interface UpdateLabelsColumnData {
  memexProjectColumnId: typeof SystemColumnId.Labels
  value: Array<number> | null
}
export interface UpdateMilestoneColumnData {
  memexProjectColumnId: typeof SystemColumnId.Milestone
  value: number | '' | null
}
interface UpdateStatusColumnData {
  memexProjectColumnId: typeof SystemColumnId.Status
  value: string | null
}

export interface UpdateDateColumnData {
  memexProjectColumnId: CustomColumnId
  value: string | null
}

export interface UpdateTextColumnData {
  memexProjectColumnId: CustomColumnId
  value: string | null
}

export interface UpdateNumberColumnData {
  memexProjectColumnId: CustomColumnId
  value: number | '' | null
}

export interface UpdateSingleSelectColumnData {
  memexProjectColumnId: CustomColumnId | typeof SystemColumnId.Status
  value: string | null
}

export interface UpdateIterationColumnData {
  memexProjectColumnId: CustomColumnId
  value: string | null
}

export interface UpdateTrackedByColumnData {
  memexProjectColumnId: typeof SystemColumnId.TrackedBy
  value: Array<string> | null
  appendOnly: boolean
}

export interface UpdateIssueTypeColumnData {
  memexProjectColumnId: typeof SystemColumnId.IssueType
  value: number | '' | null
}

export interface UpdateParentIssueColumnData {
  memexProjectColumnId: typeof SystemColumnId.ParentIssue
  value: number | '' | null
}

export type ColumnUpdateData =
  | UpdateTextColumnData
  | UpdateTitleColumnData
  | UpdateAssigneesColumnData
  | UpdateLabelsColumnData
  | UpdateMilestoneColumnData
  | UpdateTrackedByColumnData
  | UpdateIssueTypeColumnData
  | UpdateParentIssueColumnData
  | UpdateStatusColumnData
  | UpdateNumberColumnData
  | UpdateDateColumnData
  | UpdateSingleSelectColumnData
  | UpdateIterationColumnData

export type MemexItemColumnUpdateData = {
  memexProjectColumnValues: Array<ColumnUpdateData>
}
