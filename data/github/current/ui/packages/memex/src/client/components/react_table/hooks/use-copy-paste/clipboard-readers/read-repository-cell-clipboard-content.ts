import {MemexColumnDataType} from '../../../../../api/columns/contracts/memex-column'
import {sanitizeTextInputHtmlString} from '../../../../../helpers/sanitize'
import type {TableDataType} from '../../../table-data-type'

export const readRepositoryCellClipboardContent = (row: TableDataType) => {
  const repository = row.columns.Repository
  if (!repository) return

  return {
    text: repository.nameWithOwner,
    dataType: MemexColumnDataType.Repository,
    value: repository,
    // Disabling the lint rule "github/unescaped-html-literal" as we are explicitly sanitizing the output here,
    // and the repository URL is something we control
    // eslint-disable-next-line github/unescaped-html-literal
    html: `<a href="${repository.url}">${sanitizeTextInputHtmlString(repository.nameWithOwner)}</a>`,
  }
}
