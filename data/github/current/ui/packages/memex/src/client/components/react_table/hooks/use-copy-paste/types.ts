import type {Iteration, IterationValue} from '../../../../api/columns/contracts/iteration'
import type {MemexColumnDataType, SystemColumnId} from '../../../../api/columns/contracts/memex-column'
import type {NumericValue} from '../../../../api/columns/contracts/number'
import type {PersistedOption, SingleSelectValue} from '../../../../api/columns/contracts/single-select'
import type {DateValue} from '../../../../api/columns/contracts/storage'
import type {EnrichedText} from '../../../../api/columns/contracts/text'
import type {DraftIssueTitleValue} from '../../../../api/columns/contracts/title'
import type {Progress} from '../../../../api/columns/contracts/tracks'
import type {
  IssueType,
  Label,
  LinkedPullRequest,
  Milestone,
  ParentIssue,
  Repository,
  Review,
  SubIssuesProgress,
  User,
} from '../../../../api/common-contracts'
import type {TrackedByItem} from '../../../../api/issues-graph/contracts'
import type {ColumnModel} from '../../../../models/column-model'
import type {TableDataType} from '../../table-data-type'
import type {ClipboardActionTypes, ClipboardOnly_UrlColumnModel} from './constants'

type UpdateClipboardAction = {
  type: typeof ClipboardActionTypes.UPDATE_CLIPBOARD
  state: ClipboardTable
}

type ClearClipboardAction = {
  type: typeof ClipboardActionTypes.CLEAR_CLIPBOARD
}

export type ClipboardAction = UpdateClipboardAction | ClearClipboardAction

/**
 * The ClipboardContentValue context value can either be "empty" (the initial
 * state) or "populated" (the user has chosen a value to duplicate).
 */
export type ClipboardState = {type: 'empty'} | {type: 'populated'; value: ClipboardTable}

export type ClipboardColumnModel = ColumnModel | typeof ClipboardOnly_UrlColumnModel

export type ClipboardCellData = {
  repositoryId?: number
  column: ValidColumn
  row: TableDataType
}

/**
 * This type represents the supported set of values which can be moved
 * from one location to another. These are very similar to the values supported
 * in ColumnData with some additional details from the relevant project item.
 */
export type ClipboardMetadata =
  | {dataType: typeof MemexColumnDataType.Text; value?: EnrichedText}
  | {dataType: typeof MemexColumnDataType.Number; value?: NumericValue}
  | {dataType: typeof MemexColumnDataType.Date; value?: DateValue}
  | {dataType: typeof MemexColumnDataType.SingleSelect; value?: SingleSelectValue}
  | {dataType: typeof MemexColumnDataType.Iteration; value?: IterationValue}
  | {dataType: typeof MemexColumnDataType.Title; value: DraftIssueTitleValue}
  // assignees may be present on draft issues, which do not have a repository id
  | {dataType: typeof MemexColumnDataType.Assignees; value: Array<User>; repositoryId: number | null}
  | {dataType: typeof MemexColumnDataType.Labels; value: Array<Label>; repositoryId: number}
  | {dataType: typeof MemexColumnDataType.Milestone; value?: Milestone; repositoryId: number}
  | {dataType: typeof MemexColumnDataType.IssueType; value?: IssueType; repositoryId: number}
  | {dataType: typeof MemexColumnDataType.Repository; value: Repository}
  | {dataType: typeof MemexColumnDataType.LinkedPullRequests; value: Array<LinkedPullRequest>}
  | {dataType: typeof MemexColumnDataType.Reviewers; value: Array<Review>}
  | {dataType: typeof MemexColumnDataType.Tracks; value: Progress}
  | {dataType: typeof MemexColumnDataType.TrackedBy; value: Array<TrackedByItem>}
  | {dataType: typeof MemexColumnDataType.ParentIssue; value?: ParentIssue; repositoryId: number}
  | {dataType: typeof MemexColumnDataType.SubIssuesProgress; value: SubIssuesProgress}
  | {dataType: typeof ClipboardOnly_UrlColumnModel.dataType; value: string}

export type ClipboardContentValue = {
  state: ClipboardState
  clipboardDispatch: React.Dispatch<ClipboardAction>
}

export type ClipboardEntry = {
  /**
   * Used when pasting outside of a project, or as a fallback value for places where the clipboard value is not
   * directly compatible (e.g. text value -> single select).
   */
  text: string
  /** Rich content for pasting into supported external software. If not provided, `text` is used. */
  html?: string
} & ClipboardMetadata

export type ClipboardContent = ClipboardEntry & {
  columnId?: number | SystemColumnId | typeof ClipboardOnly_UrlColumnModel.id
  itemId?: number
}

export type ClipboardTable = Array<Array<ClipboardContent | undefined>>

export type ValidIterationColumn = {
  id: number
  dataType: typeof MemexColumnDataType.Iteration
  allIterations: Array<Iteration>
}

export type ValidSingleSelectColumn = {
  id: typeof SystemColumnId.Status | number
  dataType: typeof MemexColumnDataType.SingleSelect
  options: Array<PersistedOption>
}

/**
 * This represents the set of known good column values that we can parse
 * within this hook.
 *
 * Additional fields will need to be listed here, but the parseValidColumn
 * function below will report a typechecker error when the field is added, to
 * ensure this is at least handled and skipped if the content for a field cannot
 * be copied.
 */
export type ValidColumn =
  | {
      id: typeof SystemColumnId.Assignees
      dataType: typeof MemexColumnDataType.Assignees
    }
  | {id: typeof SystemColumnId.Labels; dataType: typeof MemexColumnDataType.Labels}
  | {id: typeof SystemColumnId.LinkedPullRequests; dataType: typeof MemexColumnDataType.LinkedPullRequests}
  | {id: typeof SystemColumnId.Milestone; dataType: typeof MemexColumnDataType.Milestone}
  | {
      id: typeof SystemColumnId.ParentIssue
      dataType: typeof MemexColumnDataType.ParentIssue
    }
  | {
      id: typeof SystemColumnId.Repository
      dataType: typeof MemexColumnDataType.Repository
    }
  | {
      id: typeof SystemColumnId.Reviewers
      dataType: typeof MemexColumnDataType.Reviewers
    }
  | ValidSingleSelectColumn
  | {
      id: typeof SystemColumnId.SubIssuesProgress
      dataType: typeof MemexColumnDataType.SubIssuesProgress
    }
  | {
      id: typeof SystemColumnId.Title
      dataType: typeof MemexColumnDataType.Title
    }
  | {
      id: typeof SystemColumnId.Tracks
      dataType: typeof MemexColumnDataType.Tracks
    }
  | {
      id: typeof SystemColumnId.TrackedBy
      dataType: typeof MemexColumnDataType.TrackedBy
    }
  | {
      id: typeof SystemColumnId.IssueType
      dataType: typeof MemexColumnDataType.IssueType
    }
  | ValidIterationColumn
  | {
      id: number
      dataType: typeof MemexColumnDataType.Date | typeof MemexColumnDataType.Number | typeof MemexColumnDataType.Text
    }
  | typeof ClipboardOnly_UrlColumnModel
