import type {Column, EditorCellProps, RendererCellProps, UseTableHooks} from 'react-table'

import {RowDragHandleColumnId} from './column-ids'
import RowDragger from './row-dragger'
import type {TableDataType} from './table-data-type'

export const ROW_DRAG_HANDLE_WIDTH = 60

const rowDragHandle = {
  Header: '',
  id: RowDragHandleColumnId,
  width: ROW_DRAG_HANDLE_WIDTH,
  canSort: false,
  nonNavigable: true,
  canBeShifted: false,
  canReorder: false,
  Cell(props: RendererCellProps<TableDataType>) {
    return <RowDragger column={props.column} row={props.row} />
  },
  // workaround for first column and cell not having a CellEditor component defined
  // revisit when we look at keyboard navigation to better understand what is required for
  // our row reordering functionality
  CellEditor(props: EditorCellProps<TableDataType>) {
    return <RowDragger column={props.column} row={props.row} />
  },
  // we cast this because Column<TableDataTpe> has an issue with a public method on MemexItemModel
} as Column<TableDataType>

function useColumns(columns: Array<Column<TableDataType>>): Array<Column<TableDataType>> {
  const newColumns = [rowDragHandle, ...columns]
  return newColumns
}

export const useRowDragHandle = (hooks: UseTableHooks<TableDataType>) => {
  hooks.columns.unshift(useColumns)
}

useRowDragHandle.pluginName = 'useRowDragHandle'
