import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import type {ColumnModel} from '../../models/column-model'
import type {VerticalGroup} from '../../models/vertical-group'

export function normalizeGroupName(group: VerticalGroup) {
  return group.name.toLocaleLowerCase().trim()
}

export function isValidHorizontalGroupByColumn(column: ColumnModel): boolean {
  switch (column.dataType) {
    case MemexColumnDataType.Date:
    case MemexColumnDataType.Iteration:
    case MemexColumnDataType.Milestone:
    case MemexColumnDataType.IssueType:
    case MemexColumnDataType.Number:
    case MemexColumnDataType.SingleSelect:
    case MemexColumnDataType.Repository:
    case MemexColumnDataType.Text:
    case MemexColumnDataType.Assignees:
    case MemexColumnDataType.TrackedBy:
    case MemexColumnDataType.ParentIssue:
      return true
    default:
      return false
  }
}
