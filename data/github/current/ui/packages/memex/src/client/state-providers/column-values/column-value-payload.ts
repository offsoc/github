import type {LocalUpdatePayload, RemoteUpdatePayload, UpdateColumnValueAction} from '../../api/columns/contracts/domain'
import {MemexColumnDataType, SystemColumnId} from '../../api/columns/contracts/memex-column'
import type {EnrichedText} from '../../api/columns/contracts/text'
import {formatISODateString} from '../../helpers/parsing'
import {fullDisplayName} from '../../helpers/tracked-by-formatter'

/**
 * Maps the column id and value arguments
 * to the local payload for the column value of a date data type
 *
 * @param columnId - the column id for the local payload
 * @param value    - the date value to be formatted for the local payload
 */
function mapDateToLocalUpdate(columnId: number, value: Date | undefined): LocalUpdatePayload {
  let dateValue = undefined

  if (value) {
    const dateString = formatISODateString(value)
    dateValue = {value: dateString}
  }

  return {memexProjectColumnId: columnId, value: dateValue}
}

/**
 * Maps a column value action to a local payload
 *
 * @param update - the column value action to map to a local payload
 * @returns the local payload required to update the value stored in a column of a MemexItemModel
 */
export function mapToLocalUpdate(update: UpdateColumnValueAction): LocalUpdatePayload {
  switch (update.dataType) {
    case MemexColumnDataType.Assignees:
      return {memexProjectColumnId: SystemColumnId.Assignees, value: update.value}
    case MemexColumnDataType.Labels:
      return {memexProjectColumnId: SystemColumnId.Labels, value: update.value}
    case MemexColumnDataType.Milestone:
      return {memexProjectColumnId: SystemColumnId.Milestone, value: update.value}
    case MemexColumnDataType.TrackedBy:
      return {memexProjectColumnId: SystemColumnId.TrackedBy, value: update.value}
    case MemexColumnDataType.IssueType:
      return {memexProjectColumnId: SystemColumnId.IssueType, value: update.value}
    case MemexColumnDataType.ParentIssue:
      return {memexProjectColumnId: SystemColumnId.ParentIssue, value: update.value}
    case MemexColumnDataType.Number:
      return {memexProjectColumnId: update.memexProjectColumnId, value: update.value}
    case MemexColumnDataType.Date:
      /**
       * The `update.value` for a Date column will be a `DateValue`, which is of the
       * shape `{ value: Date }`. Local dates are stored as ServerDateValue
       * which is shaped `{ value: string }`. So we need to unwrap value twice and
       * convert to a string.
       */
      return mapDateToLocalUpdate(update.memexProjectColumnId, update.value?.value)
    case MemexColumnDataType.Repository:
      return {memexProjectColumnId: SystemColumnId.Repository, value: update.value || null}
    case MemexColumnDataType.Title:
      return {memexProjectColumnId: SystemColumnId.Title, value: update.value}
    case MemexColumnDataType.Text:
      return {
        memexProjectColumnId: update.memexProjectColumnId,
        value: update.value ? {raw: update.value, html: update.value} : undefined,
      }
    case MemexColumnDataType.SingleSelect:
    case MemexColumnDataType.Iteration:
      return {memexProjectColumnId: update.memexProjectColumnId, value: update.value}
  }
}

/**
 * Maps a date value to a remote payload
 * @param columnId - the column id for the remote payload
 * @param value    - the value to be mapped to the remote payload
 * @returns the remote payload required to update the date value stored in a column of a MemexItemModel
 */
function mapDateToRemoteUpdate(columnId: number, value: Date | undefined): RemoteUpdatePayload {
  const dateValue = value ? value.toISOString() : ''
  return {memexProjectColumnId: columnId, value: dateValue}
}

/**
 * Maps a column title to a remote payload
 *
 * @param newTitle - the new title to be mapped to a remote payload
 * @returns the remote payload required to update the title in a column of a MemexItemModel
 */
function mapTitleToRemoteUpdate(newTitle: EnrichedText | string): RemoteUpdatePayload {
  if (typeof newTitle === 'string') {
    return {memexProjectColumnId: SystemColumnId.Title, value: {title: newTitle}}
  }

  return {memexProjectColumnId: SystemColumnId.Title, value: {title: newTitle.raw}}
}

/**
 * Maps a column value action to a remote payload
 *
 * @param update - the column value action to map to a remote payload
 * @returns the remote payload required to update the value stored in a column of a MemexItemModel
 */
export function mapToRemoteUpdate(update: UpdateColumnValueAction): RemoteUpdatePayload | null {
  switch (update.dataType) {
    case MemexColumnDataType.Assignees:
      return {memexProjectColumnId: SystemColumnId.Assignees, value: update.value.map(u => u.id)}
    case MemexColumnDataType.Labels:
      return {memexProjectColumnId: SystemColumnId.Labels, value: update.value.map(u => u.id)}
    case MemexColumnDataType.Milestone:
      return {memexProjectColumnId: SystemColumnId.Milestone, value: update.value ? update.value.id : ''}
    case MemexColumnDataType.TrackedBy:
      return {
        memexProjectColumnId: SystemColumnId.TrackedBy,
        value: update.value.map(fullDisplayName),
        appendOnly: update.appendOnly,
      }
    case MemexColumnDataType.IssueType:
      return {memexProjectColumnId: SystemColumnId.IssueType, value: update.value ? update.value.id : ''}
    case MemexColumnDataType.ParentIssue:
      return {memexProjectColumnId: SystemColumnId.ParentIssue, value: update.value ? update.value.id : ''}
    case MemexColumnDataType.Number: {
      const value = update.value ? update.value.value : ''
      return {memexProjectColumnId: update.memexProjectColumnId, value}
    }
    case MemexColumnDataType.Date:
      return mapDateToRemoteUpdate(update.memexProjectColumnId, update.value?.value)
    case MemexColumnDataType.Title:
      return mapTitleToRemoteUpdate(update.value.title)
    case MemexColumnDataType.Text:
      return {memexProjectColumnId: update.memexProjectColumnId, value: update.value || ''}
    case MemexColumnDataType.SingleSelect:
    case MemexColumnDataType.Iteration:
      return {memexProjectColumnId: update.memexProjectColumnId, value: update.value?.id || ''}
    default:
      return null
  }
}
