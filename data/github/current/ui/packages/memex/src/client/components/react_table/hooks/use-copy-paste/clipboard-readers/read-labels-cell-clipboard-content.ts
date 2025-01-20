import {MemexColumnDataType} from '../../../../../api/columns/contracts/memex-column'
import {ItemType} from '../../../../../api/memex-items/item-type'
import {sanitizeTextInputHtmlString} from '../../../../../helpers/sanitize'
import type {TableDataType} from '../../../table-data-type'

export const readLabelsCellClipboardContent = (row: TableDataType) => {
  if (row.contentType === ItemType.DraftIssue || row.contentType === ItemType.RedactedItem) return

  const labels = row.columns.Labels || []

  return {
    text: labels.map(a => a.name).join(', '),
    dataType: MemexColumnDataType.Labels,
    value: labels,
    repositoryId: row.contentRepositoryId,
    html: labels.map(label => sanitizeTextInputHtmlString(label.nameHtml)).join(', '),
  }
}
