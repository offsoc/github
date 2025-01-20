import type {Cell} from 'react-table'

import type {TableDataType} from '../../table-data-type'
import {getOnlyCell} from './get-only-cell'
import type {ClipboardState} from './types'

type Props = {
  cell: Pick<Cell<TableDataType>, 'column' | 'row'>
  clipboard: ClipboardState
}

export const isCellCopySourceForClipboard = ({cell, clipboard}: Props) => {
  if (clipboard.type === 'empty') return

  const value = getOnlyCell(clipboard.value)
  return value?.columnId?.toString() === cell.column.id && value.itemId === cell.row.original.id
}
