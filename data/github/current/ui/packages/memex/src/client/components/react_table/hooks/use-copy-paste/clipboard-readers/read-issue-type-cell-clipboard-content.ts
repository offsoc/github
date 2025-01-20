import {MemexColumnDataType, SystemColumnId} from '../../../../../api/columns/contracts/memex-column'
import {ItemType} from '../../../../../api/memex-items/item-type'
import {sanitizeTextInputHtmlString} from '../../../../../helpers/sanitize'
import type {TableDataType} from '../../../table-data-type'

export const readIssueTypeCellClipboardContent = (row: TableDataType) => {
  if (row.contentType !== ItemType.Issue) return

  const issueType = row.columns[SystemColumnId.IssueType]

  return {
    text: issueType ? issueType.name : '',
    dataType: MemexColumnDataType.IssueType,
    value: issueType,
    repositoryId: row.contentRepositoryId,
    html: issueType ? sanitizeTextInputHtmlString(issueType.name) : '',
  }
}
