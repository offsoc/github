import type {Column, UseTableHooks} from 'react-table'

import {AddColumnHeader} from './add-column-header'
import {AddColumnId} from './column-ids'

export const useAddColumnHeader = <D extends object>(hooks: UseTableHooks<D>) => {
  hooks.columns.push(columnHook)
}

const addColumn = {
  Header: AddColumnHeader,
  id: AddColumnId,
  width: 50,
  canSort: false,
  nonNavigable: true,
  canBeShifted: false,
  canReorder: false,
  Placeholder: '',
  Cell: '',
  CellEditor: '',
}

const columnHook = <D extends object>(columns: Array<Column<D>>) => {
  return [...columns, addColumn]
}
