import type {TableDataType} from '../../table-data-type'
import {readCellClipboardContent} from './clipboard-readers/read-cell-clipboard-content'
import {extractCellData} from './extract-cell-data'
import type {ClipboardColumnModel, ClipboardContent} from './types'

export const getClipboardContentFromRowAndColumn = (
  columnModel: ClipboardColumnModel,
  row: TableDataType,
): ClipboardContent | undefined => {
  const cellData = extractCellData(columnModel, row)
  if (!cellData) return

  const clipboardContent = readCellClipboardContent(cellData)
  if (!clipboardContent) return

  return {
    ...clipboardContent,
    columnId: cellData.column.id,
    itemId: cellData.row.id,
  }
}
