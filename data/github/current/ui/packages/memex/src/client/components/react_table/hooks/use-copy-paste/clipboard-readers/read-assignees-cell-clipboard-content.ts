import {MemexColumnDataType} from '../../../../../api/columns/contracts/memex-column'
import {ItemType} from '../../../../../api/memex-items/item-type'
import type {TableDataType} from '../../../table-data-type'

export const readAssigneesCellClipboardContent = (row: TableDataType) => {
  const assignees = row.columns.Assignees || []
  if (row.contentType === ItemType.RedactedItem) return

  return {
    text: assignees.map(a => a.login).join(', '),
    dataType: MemexColumnDataType.Assignees,
    value: assignees,
    repositoryId: row.contentRepositoryId,
  }
}
