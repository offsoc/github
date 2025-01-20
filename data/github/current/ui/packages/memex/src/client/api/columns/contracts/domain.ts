import type {ExtendedRepository, IAssignee, IssueType, Label, Milestone, ParentIssue} from '../../common-contracts'
import type {TrackedByItem} from '../../issues-graph/contracts'
import type {ServerDateValue} from './date'
import type {IterationValue} from './iteration'
import type {MemexColumnDataType, SystemColumnId} from './memex-column'
import type {NumericValue} from './number'
import type {SingleSelectValue} from './single-select'
import type {
  AssigneesColumnData,
  DateValue,
  IssueTypeColumnData,
  LabelsColumnData,
  MilestoneColumnData,
  ParentIssueColumnData,
  RepositoryColumnData,
  StatusColumnData,
  TrackedByColumnData,
  UpdateAssigneesColumnData,
  UpdateDateColumnData,
  UpdateIssueTypeColumnData,
  UpdateLabelsColumnData,
  UpdateMilestoneColumnData,
  UpdateNumberColumnData,
  UpdateParentIssueColumnData,
  UpdateSingleSelectColumnData,
  UpdateTextColumnData,
  UpdateTitleColumnData,
  UpdateTrackedByColumnData,
} from './storage'
import type {EnrichedText} from './text'
import type {DraftIssueTitleValue, IssueTitleValue, PullRequestTitleValue} from './title'

/**
 * The payload required to update the value stored in a column of a MemexItemModel
 */
export type UpdateColumnValueAction =
  | {
      dataType: typeof MemexColumnDataType.Assignees
      value: Array<IAssignee>
    }
  | {
      dataType: typeof MemexColumnDataType.Labels
      value: Array<Label>
    }
  | {
      dataType: typeof MemexColumnDataType.Milestone
      value: Milestone | undefined
    }
  | {
      dataType: typeof MemexColumnDataType.Repository
      value: ExtendedRepository | undefined
    }
  | {
      dataType: typeof MemexColumnDataType.Title
      value: TitleUpdateValue
    }
  | {
      dataType: typeof MemexColumnDataType.TrackedBy
      value: Array<TrackedByItem>
      appendOnly: boolean
    }
  | {
      dataType: typeof MemexColumnDataType.IssueType
      value: IssueType | undefined
    }
  | {
      dataType: typeof MemexColumnDataType.Number
      memexProjectColumnId: number
      value: NumericValue | undefined
    }
  | {
      dataType: typeof MemexColumnDataType.Date
      memexProjectColumnId: number
      value: DateValue | undefined
    }
  | {
      dataType: typeof MemexColumnDataType.Text
      memexProjectColumnId: number
      value: string | undefined
    }
  | {
      dataType: typeof MemexColumnDataType.SingleSelect
      memexProjectColumnId: number
      value: SingleSelectValue | undefined
    }
  | {
      dataType: typeof MemexColumnDataType.SingleSelect
      memexProjectColumnId: typeof SystemColumnId.Status
      value: SingleSelectValue | undefined
    }
  | {
      dataType: typeof MemexColumnDataType.Iteration
      memexProjectColumnId: number
      value: IterationValue | undefined
    }
  | {
      dataType: typeof MemexColumnDataType.ParentIssue
      value: ParentIssue | undefined
    }

export type ItemUpdates = {
  itemId: number
  updates: Array<UpdateColumnValueAction>
}

export type TitleUpdateValue = DraftIssueTitleValue | IssueTitleValue | PullRequestTitleValue

export type LocalUpdatePayload =
  | AssigneesColumnData
  | MilestoneColumnData
  | LabelsColumnData
  | RepositoryColumnData
  | StatusColumnData
  | TrackedByColumnData
  | IssueTypeColumnData
  | ParentIssueColumnData
  // fallback value to indicate when the milestone is cleared
  | {memexProjectColumnId: typeof SystemColumnId.Milestone; value: undefined}
  | {memexProjectColumnId: typeof SystemColumnId.Title; value: TitleUpdateValue}
  | {memexProjectColumnId: typeof SystemColumnId.Status; value: SingleSelectValue | undefined}
  | {memexProjectColumnId: typeof SystemColumnId.TrackedBy; value: Array<TrackedByItem> | undefined}
  | {memexProjectColumnId: typeof SystemColumnId.IssueType; value: undefined}
  | {memexProjectColumnId: typeof SystemColumnId.ParentIssue; value: undefined}
  | {memexProjectColumnId: number; value: EnrichedText | undefined}
  | {memexProjectColumnId: number; value: NumericValue | undefined}
  | {memexProjectColumnId: number; value: ServerDateValue | undefined}
  | {memexProjectColumnId: number; value: SingleSelectValue | undefined}

export type RemoteUpdatePayload =
  | UpdateTextColumnData
  | UpdateTitleColumnData
  | UpdateAssigneesColumnData
  | UpdateLabelsColumnData
  | UpdateMilestoneColumnData
  | UpdateTrackedByColumnData
  | UpdateIssueTypeColumnData
  | UpdateParentIssueColumnData
  | UpdateNumberColumnData
  | UpdateDateColumnData
  | UpdateSingleSelectColumnData

/** Set of supported custom column types */
export type CustomColumnKind =
  | typeof MemexColumnDataType.Text
  | typeof MemexColumnDataType.Number
  | typeof MemexColumnDataType.Date
  | typeof MemexColumnDataType.SingleSelect
  | typeof MemexColumnDataType.Iteration
