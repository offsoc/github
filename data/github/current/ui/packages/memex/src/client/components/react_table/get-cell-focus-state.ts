import type {Cell} from 'react-table'

import {isCellFocus, type TableFocus} from './navigation'
import type {TableDataType} from './table-data-type'

export function getCellFocusState(cell: Pick<Cell<TableDataType>, 'column' | 'row'>, focus: TableFocus | null) {
  if (focus && isCellFocus(focus) && focus.details.y === cell.row.id && focus.details.x === cell.column.id) {
    return {
      isFocused: true,
      isEditing: Boolean(focus.details.meta.editing),
      isSuspended: Boolean(focus.details.meta.suspended),
      replaceContents: Boolean(focus.details.meta.replaceContents),
    }
  } else {
    return {
      isFocused: false,
      isEditing: false,
      isSuspended: false,
      replaceContents: false,
    }
  }
}
