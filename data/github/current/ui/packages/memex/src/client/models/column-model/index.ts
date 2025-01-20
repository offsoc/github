import {type MemexColumn, MemexColumnDataType, SystemColumnId} from '../../api/columns/contracts/memex-column'
import {assertNever} from '../../helpers/assert-never'
import {DateColumnModel} from './custom/date'
import {IterationColumnModel} from './custom/iteration'
import {NumberColumnModel} from './custom/number'
import {SingleSelectColumnModel} from './custom/single-select'
import {TextColumnModel} from './custom/text'
import {AssigneesColumnModel} from './system/assignees'
import {IssueTypeColumnModel} from './system/issue-type'
import {LabelsColumnModel} from './system/labels'
import {LinkedPullRequestsColumnModel} from './system/linked-pull-requests'
import {MilestoneColumnModel} from './system/milestone'
import {ParentIssueColumnModel} from './system/parent-issue'
import {RepositoryColumnModel} from './system/repository'
import {ReviewersColumnModel} from './system/reviewers'
import {StatusColumnModel} from './system/status'
import {SubIssuesProgressColumnModel} from './system/sub-issues-progress'
import {TitleColumnModel} from './system/title'
import {TrackedByColumnModel} from './system/tracked-by'
import {TracksColumnModel} from './system/tracks'

/**
 * A union of all column model types.
 *
 * Defined using `ReturnType` to ensure that the union is kept up to date
 */
export type ColumnModel = ReturnType<typeof createColumnModel>

/**
 * Given a MemexColumnDataType, returns a union of
 * the  corresponding valid column model types.
 */
export type ColumnModelForDataType<DataType extends MemexColumnDataType> = Extract<ColumnModel, {dataType: DataType}>

export function createColumnModel(column: MemexColumn) {
  switch (column.dataType) {
    case MemexColumnDataType.Assignees:
      return new AssigneesColumnModel(column)
    case MemexColumnDataType.Labels:
      return new LabelsColumnModel(column)
    case MemexColumnDataType.LinkedPullRequests:
      return new LinkedPullRequestsColumnModel(column)
    case MemexColumnDataType.Milestone:
      return new MilestoneColumnModel(column)
    case MemexColumnDataType.ParentIssue:
      return new ParentIssueColumnModel(column)
    case MemexColumnDataType.Repository:
      return new RepositoryColumnModel(column)
    case MemexColumnDataType.Reviewers:
      return new ReviewersColumnModel(column)
    case MemexColumnDataType.SubIssuesProgress:
      return new SubIssuesProgressColumnModel(column)
    case MemexColumnDataType.Title:
      return new TitleColumnModel(column)
    case MemexColumnDataType.Tracks:
      return new TracksColumnModel(column)
    case MemexColumnDataType.TrackedBy:
      return new TrackedByColumnModel(column)
    case MemexColumnDataType.Text:
      return new TextColumnModel(column)
    case MemexColumnDataType.SingleSelect: {
      if (column.id === SystemColumnId.Status) {
        return new StatusColumnModel(column)
      }
      return new SingleSelectColumnModel(column)
    }
    case MemexColumnDataType.Number:
      return new NumberColumnModel(column)
    case MemexColumnDataType.Date:
      return new DateColumnModel(column)
    case MemexColumnDataType.Iteration:
      return new IterationColumnModel(column)
    case MemexColumnDataType.IssueType:
      return new IssueTypeColumnModel(column)
    default:
      assertNever(column.dataType)
  }
}
