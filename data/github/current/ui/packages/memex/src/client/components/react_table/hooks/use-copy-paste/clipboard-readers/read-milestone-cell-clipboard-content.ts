import {MemexColumnDataType} from '../../../../../api/columns/contracts/memex-column'
import {ItemType} from '../../../../../api/memex-items/item-type'
import {sanitizeTextInputHtmlString} from '../../../../../helpers/sanitize'
import type {TableDataType} from '../../../table-data-type'

export const readMilestoneCellClipboardContent = (row: TableDataType) => {
  if (row.contentType === ItemType.DraftIssue || row.contentType === ItemType.RedactedItem) return

  const milestone = row.columns.Milestone

  return {
    text: milestone ? milestone.title : '',
    dataType: MemexColumnDataType.Milestone,
    value: milestone,
    repositoryId: row.contentRepositoryId,
    // Disabling the lint rule "github/unescaped-html-literal" as we are explicitly sanitizing the output here
    // and the milestone URL is an internal URL that we control
    // eslint-disable-next-line github/unescaped-html-literal
    html: milestone ? `<a href="${milestone.url}">${sanitizeTextInputHtmlString(milestone.title)}</a>` : '',
  }
}
