import {MemexColumnDataType} from '../../../../../api/columns/contracts/memex-column'
import {sanitizeTextInputHtmlString} from '../../../../../helpers/sanitize'
import {fullDisplayName} from '../../../../../helpers/tracked-by-formatter'
import type {TableDataType} from '../../../table-data-type'

export const readTrackedByCellClipboardContent = (row: TableDataType) => {
  const trackedBy = row.columns['Tracked by']
  if (!trackedBy || trackedBy.length === 0) return

  return {
    text: trackedBy.map(issue => issue.url).join(', '),
    dataType: MemexColumnDataType.TrackedBy,
    value: trackedBy || [],
    html:
      // Disabling the lint rule "github/unescaped-html-literal" as we are explicitly sanitizing the output here
      // and the issue URL is an internal URL that we control
      trackedBy
        // eslint-disable-next-line github/unescaped-html-literal
        .map(issue => `<a href="${issue.url}">${sanitizeTextInputHtmlString(fullDisplayName(issue))}</a>`)
        .join(', '),
  }
}
