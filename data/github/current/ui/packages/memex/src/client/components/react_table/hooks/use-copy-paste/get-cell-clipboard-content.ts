import type {Cell} from 'react-table'

import type {TableDataType} from '../../table-data-type'
import {readCellClipboardContent} from './clipboard-readers/read-cell-clipboard-content'
import {extractCellData} from './extract-cell-data'
import type {ClipboardContent} from './types'

// FIXME: Exported for tests; tests should be updated to test the hook itself but this is tricky because we can't use Playwright to assert the clipboard
export const getCellClipboardContent = (
  cell: Pick<Cell<TableDataType>, 'column' | 'row'>,
): ClipboardContent | undefined => {
  if (!cell.column.columnModel) {
    return
  }
  const cellData = extractCellData(cell.column.columnModel, cell.row.original)
  if (!cellData) return

  const clipboardContent = readCellClipboardContent(cellData)
  if (!clipboardContent) return

  return {
    ...clipboardContent,
    columnId: cellData.column.id,
    itemId: cellData.row.id,
  }
}
