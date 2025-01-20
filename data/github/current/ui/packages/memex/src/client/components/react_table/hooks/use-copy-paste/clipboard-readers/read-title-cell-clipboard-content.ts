import {MemexColumnDataType, SystemColumnId} from '../../../../../api/columns/contracts/memex-column'
import {ItemType} from '../../../../../api/memex-items/item-type'
import {sanitizeTextInputHtmlString} from '../../../../../helpers/sanitize'
import type {TableDataType} from '../../../table-data-type'

export const readTitleCellClipboardContent = (row: TableDataType) => {
  const titleValue = row.columns[SystemColumnId.Title]
  if (!titleValue) return

  if (titleValue.contentType === ItemType.RedactedItem) return

  const htmlTitle = sanitizeTextInputHtmlString(titleValue.value.title.html)
  const url = row.getUrl()
  // Disabling the lint rule "github/unescaped-html-literal" as we are explicitly sanitizing the output here
  // and the URL is an internal URL that we control
  // eslint-disable-next-line github/unescaped-html-literal
  const html = url ? `<a href="${url}">${htmlTitle}</a>` : htmlTitle

  return {
    text: titleValue.value.title.raw,
    dataType: MemexColumnDataType.Title,
    value: {
      title: titleValue.value.title,
    },
    html,
  }
}
