import {sanitizeTextInputHtmlString} from '../../../../helpers/sanitize'
import {getOnlyCell} from './get-only-cell'
import type {ClipboardContent, ClipboardTable} from './types'

const getHtmlContent = (cell: ClipboardContent | undefined) =>
  cell?.html ?? sanitizeTextInputHtmlString(cell?.text ?? '')

export const buildHtmlTableForClipboardContent = (rows: ClipboardTable, header?: Array<string>) => {
  if (rows.length === 0) return

  const onlyCell = getOnlyCell(rows)

  // if there's only one cell, don't include the table structure
  if (onlyCell) return getHtmlContent(onlyCell)

  const headHtml = header
    ? // eslint-disable-next-line github/unescaped-html-literal
      `\n<thead><tr>${header.map(name => `<th>${sanitizeTextInputHtmlString(name)}</th>`).join('')}</tr></thead>`
    : ''

  // eslint-disable-next-line github/unescaped-html-literal
  const bodyHtml = `<tbody>
${rows
  .map(row => {
    // eslint-disable-next-line github/unescaped-html-literal
    return `<tr>${row.map(cell => `<td>${getHtmlContent(cell)}</td>`).join('')}</tr>`
  })
  .join('\n')}
</tbody>`

  // Disabling the lint rule "github/unescaped-html-literal" as we are explicitly sanitizing the output here
  // eslint-disable-next-line github/unescaped-html-literal
  return `<table>${headHtml}
${bodyHtml}
</table>`
}
