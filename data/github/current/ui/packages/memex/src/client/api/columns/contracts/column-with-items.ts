import type {
  ExtendedRepository,
  IAssignee,
  IssueType,
  Label,
  LinkedPullRequest,
  Milestone as MilestoneInterface,
  ParentIssue,
  Review,
  SubIssuesProgress,
} from '../../common-contracts'
import type {TrackedByItem} from '../../issues-graph/contracts'
import type {ServerDateValue} from './date'
import type {IterationValue} from './iteration'
import type {MemexColumn, SystemColumnId} from './memex-column'
import type {NumericValue} from './number'
import type {SingleSelectValue} from './single-select'
import type {EnrichedText} from './text'
import type {DenormalizedTitleValue, TitleValueBase} from './title'
import type {Progress} from './tracks'

export interface ItemWithColumnData<TColumnValue> {
  memexProjectItemId: number
  value: TColumnValue
}

interface AssigneesColumnWithItemData extends MemexColumn {
  id: typeof SystemColumnId.Assignees
  memexProjectColumnValues?: Array<ItemWithColumnData<Array<IAssignee>>>
}

interface LabelsColumnWithItemData extends MemexColumn {
  id: typeof SystemColumnId.Labels
  memexProjectColumnValues?: Array<ItemWithColumnData<Array<Label>>>
}

interface LinkedPullRequestsColumnWithItemData extends MemexColumn {
  id: typeof SystemColumnId.LinkedPullRequests
  memexProjectColumnValues?: Array<ItemWithColumnData<Array<LinkedPullRequest>>>
}

interface MilestoneColumnWithItemData extends MemexColumn {
  id: typeof SystemColumnId.Milestone
  memexProjectColumnValues?: Array<ItemWithColumnData<MilestoneInterface>>
}

interface TracksColumnWithItemData extends MemexColumn {
  id: typeof SystemColumnId.Tracks
  memexProjectColumnValues?: Array<ItemWithColumnData<Array<Progress>>>
}

interface TrackedByColumnWithItemData extends MemexColumn {
  id: typeof SystemColumnId.TrackedBy
  memexProjectColumnValues?: Array<ItemWithColumnData<Array<TrackedByItem>>>
}

interface IssueTypeColumnWithItemData extends MemexColumn {
  id: typeof SystemColumnId.IssueType
  memexProjectColumnValues?: Array<ItemWithColumnData<Array<IssueType>>>
}

interface ParentIssueColumnWithItemData extends MemexColumn {
  id: typeof SystemColumnId.ParentIssue
  memexProjectColumnValues?: Array<ItemWithColumnData<ParentIssue>>
}

interface SubIssuesProgressColumnWithItemData extends MemexColumn {
  id: typeof SystemColumnId.SubIssuesProgress
  memexProjectColumnValues?: Array<ItemWithColumnData<SubIssuesProgress>>
}

interface IterationColumnWithItemData extends MemexColumn {
  id: number
  memexProjectColumnValues?: Array<ItemWithColumnData<IterationValue>>
}

interface RepositoryColumnWithItemData extends MemexColumn {
  id: typeof SystemColumnId.Repository
  memexProjectColumnValues?: Array<ItemWithColumnData<ExtendedRepository>>
}

interface ReviewersColumnWithItemData extends MemexColumn {
  id: typeof SystemColumnId.Reviewers
  memexProjectColumnValues?: Array<ItemWithColumnData<Array<Review>>>
}

interface StatusColumnWithItemData extends MemexColumn {
  id: typeof SystemColumnId.Status
  memexProjectColumnValues?: Array<ItemWithColumnData<SingleSelectValue>>
}

interface TitleColumnWithItemData extends MemexColumn {
  id: typeof SystemColumnId.Title
  memexProjectColumnValues?: Array<ItemWithColumnData<TitleValueBase | DenormalizedTitleValue>>
}

interface TextColumnWithItemData extends MemexColumn {
  id: number
  memexProjectColumnValues?: Array<ItemWithColumnData<EnrichedText>>
}

/** API response from the backend for a custom number type */
interface NumberColumnWithItemData extends MemexColumn {
  id: number
  memexProjectColumnValues?: Array<ItemWithColumnData<NumericValue>>
}

/** API response from the backend for a custom date type */
interface DateColumnWithItemData extends MemexColumn {
  id: number
  memexProjectColumnValues?: Array<ItemWithColumnData<ServerDateValue>>
}

export type IColumnWithItems =
  | AssigneesColumnWithItemData
  | LabelsColumnWithItemData
  | LinkedPullRequestsColumnWithItemData
  | MilestoneColumnWithItemData
  | ParentIssueColumnWithItemData
  | RepositoryColumnWithItemData
  | ReviewersColumnWithItemData
  | SubIssuesProgressColumnWithItemData
  | TracksColumnWithItemData
  | TrackedByColumnWithItemData
  | IssueTypeColumnWithItemData
  | TitleColumnWithItemData
  | StatusColumnWithItemData
  | TextColumnWithItemData
  | NumberColumnWithItemData
  | DateColumnWithItemData
  | IterationColumnWithItemData
