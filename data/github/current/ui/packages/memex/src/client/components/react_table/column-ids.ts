import type {ColumnInstance} from 'react-table'

export const RowDragHandleColumnId = 'row-drag-handle'
export const AddColumnId = 'add-column'

/** Check whether a column is the leading "row handle" field on the table */
export function isDragDropColumn<D extends object>(column: ColumnInstance<D>): boolean {
  return column.id === RowDragHandleColumnId
}

/** Check whether this column is the trailing "add column" field on the table */
export function isAddColumn<D extends object>(column: ColumnInstance<D>): boolean {
  return column.id === AddColumnId
}
