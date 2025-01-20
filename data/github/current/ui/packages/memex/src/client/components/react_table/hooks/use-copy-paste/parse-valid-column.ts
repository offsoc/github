import {MemexColumnDataType, SystemColumnId} from '../../../../api/columns/contracts/memex-column'
import {assertNever} from '../../../../helpers/assert-never'
import {getAllIterations} from '../../../../helpers/iterations'
import {isNumber} from '../../../../helpers/parsing'
import {ClipboardOnly_UrlColumnModel} from './constants'
import type {ClipboardColumnModel, ValidColumn} from './types'

/**
 * Convert the received ColumnModel instance into the values required to
 * analyze the clipboard content, so we can narrow on this value later on
 * in the flow.
 *
 * @param column received column model
 *
 * @returns a ValidColumn shape or null if not matching the expected shape
 */
export function parseValidColumn(column: ClipboardColumnModel): ValidColumn | null {
  switch (column.dataType) {
    case MemexColumnDataType.Assignees:
      return {id: SystemColumnId.Assignees, dataType: column.dataType}
    case MemexColumnDataType.Date:
      return {id: column.id, dataType: column.dataType}
    case MemexColumnDataType.Iteration: {
      const allIterations = getAllIterations(column)
      return {id: column.id, dataType: column.dataType, allIterations}
    }
    case MemexColumnDataType.Labels:
      return {id: SystemColumnId.Labels, dataType: column.dataType}
    case MemexColumnDataType.LinkedPullRequests:
      return {id: SystemColumnId.LinkedPullRequests, dataType: column.dataType}
    case MemexColumnDataType.Milestone:
      return {id: SystemColumnId.Milestone, dataType: column.dataType}
    case MemexColumnDataType.Number:
      return {id: column.id, dataType: column.dataType}
    case MemexColumnDataType.ParentIssue:
      return {id: SystemColumnId.ParentIssue, dataType: column.dataType}
    case MemexColumnDataType.Repository:
      return {id: SystemColumnId.Repository, dataType: column.dataType}
    case MemexColumnDataType.Reviewers:
      return {id: SystemColumnId.Reviewers, dataType: column.dataType}
    case MemexColumnDataType.SingleSelect: {
      if (isNumber(column.id) || column.id === SystemColumnId.Status) {
        const options = column.settings.options || []
        return {id: column.id, dataType: column.dataType, options}
      }
      return null
    }
    case MemexColumnDataType.SubIssuesProgress:
      return {id: SystemColumnId.SubIssuesProgress, dataType: column.dataType}
    case MemexColumnDataType.Text:
      return {id: column.id, dataType: column.dataType}
    case MemexColumnDataType.Title:
      return {id: SystemColumnId.Title, dataType: column.dataType}
    case MemexColumnDataType.Tracks:
      return {id: SystemColumnId.Tracks, dataType: column.dataType}
    case MemexColumnDataType.TrackedBy:
      return {id: SystemColumnId.TrackedBy, dataType: column.dataType}
    case MemexColumnDataType.IssueType:
      return {id: SystemColumnId.IssueType, dataType: column.dataType}
    case ClipboardOnly_UrlColumnModel.dataType:
      return ClipboardOnly_UrlColumnModel
    default: {
      assertNever(column)
    }
  }
}
