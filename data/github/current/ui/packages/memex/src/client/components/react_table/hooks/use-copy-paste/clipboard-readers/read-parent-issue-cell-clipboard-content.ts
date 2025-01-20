import {MemexColumnDataType} from '../../../../../api/columns/contracts/memex-column'
import {ItemType} from '../../../../../api/memex-items/item-type'
import {sanitizeTextInputHtmlString} from '../../../../../helpers/sanitize'
import type {TableDataType} from '../../../table-data-type'
import type {ClipboardEntry} from '../types'

export const readParentIssueCellClipboardContent = (row: TableDataType): ClipboardEntry | undefined => {
  if (row.contentType !== ItemType.Issue) return

  const parentIssue = row.columns['Parent issue']

  return {
    text: parentIssue?.url || '',
    dataType: MemexColumnDataType.ParentIssue,
    value: parentIssue,
    // Validation for bulk-updates is currently predicated on the presence of the source repository id. This is here,
    // to ensure we validate client-side that a PR or Draft issue cannot be added as a sub-issue. The actual validation
    // occurs in ui/packages/memex/src/client/hooks/use-update-item.ts
    repositoryId: row.contentRepositoryId,
    // Disabling the lint rule "github/unescaped-html-literal" as we are explicitly sanitizing the output here
    // and the issue URL is an internal URL that we control
    html: parentIssue
      ? // eslint-disable-next-line github/unescaped-html-literal
        `<a href="${parentIssue.url}">${sanitizeTextInputHtmlString(`${parentIssue.nwoReference}`)}</a>`
      : '',
  }
}
