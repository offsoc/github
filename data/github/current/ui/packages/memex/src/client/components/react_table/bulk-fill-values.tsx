import {useSafeAsyncCallback} from '@github-ui/use-safe-async-callback'
import {createContext, memo, type ReactNode, useCallback, useContext, useEffect, useMemo, useState} from 'react'
import type {Cell, Row} from 'react-table'

import {ItemType} from '../../api/memex-items/item-type'
import {useBulkUpdateItems} from '../../hooks/use-bulk-update-items'
import type {ColumnModel} from '../../models/column-model'
import type {MemexItemModel} from '../../models/memex-item-model'
import {buildUpdateCopyingCell} from '../../state-providers/column-values/column-value'
import {HistoryResources} from '../../strings'
import {
  useAreCellsBulkSelected,
  useGetBulkSelectedRows,
  useTableCellBulkSelectionActions,
  useTableCellBulkSelectionData,
} from './table-cell-bulk-selection'
import type {TableDataType} from './table-data-type'
import {useTableInstance} from './table-provider'

/**
 * Returns a callback to replace the contents of all selected cells with the contents of the first selected cell.
 */
export const useFillSelection = () => {
  const selectionState = useTableCellBulkSelectionData()
  const hasBulkSelection = useAreCellsBulkSelected()
  const getSelectedRows = useGetBulkSelectedRows()
  const {bulkUpdateSingleColumnValue: bulkUpdateItems} = useBulkUpdateItems()

  /**
   * @param direction Controls which cell is the copy source. `down` will always use the top cell. `as-selected` will use
   * the first selected cell.
   */
  return useCallback(
    async (direction: 'down' | 'as-selected') => {
      if (!hasBulkSelection || !selectionState.columnId) return

      const selectedRows = getSelectedRows()
      const [sourceRow, ...targetRows] =
        direction === 'as-selected' ? selectedRows : selectedRows.sort((a, b) => a.index - b.index)

      const sourceCell = sourceRow?.cells.find(cell => cell.column.id === selectionState.columnId)
      if (!sourceCell) return

      const update = buildUpdateCopyingCell(sourceCell)
      if (!update) return

      bulkUpdateItems(
        targetRows.map(row => row.original),
        update,
        HistoryResources.fillCells,
        sourceCell.row.original.contentRepositoryId,
      )
      return
    },
    [bulkUpdateItems, getSelectedRows, hasBulkSelection, selectionState.columnId],
  )
}

interface DragToFillContext {
  isDragging: boolean
  onFillStart?: (columnId: string, rowIndex: number) => void
}

const DragToFillContext = createContext<DragToFillContext>({isDragging: false})

export const TableDragToFillProvider = memo(function TableDragToFillProvider({children}: {children: ReactNode}) {
  const [isDragging, setIsDragging] = useState<boolean>(false)

  const fillSelection = useFillSelection()

  const onFillEnd = useSafeAsyncCallback(() => {
    fillSelection('as-selected')
    setIsDragging(false)
  })

  useEffect(() => {
    if (isDragging) document.addEventListener('mouseup', onFillEnd)
    return () => document.removeEventListener('mouseup', onFillEnd)
  }, [isDragging, onFillEnd])

  const onFillStart = useCallback(() => setIsDragging(true), [])

  const bulkSelectActions = useTableCellBulkSelectionActions()
  if (!bulkSelectActions)
    throw new Error('`TableDragToFillProvider` requires `TableCellBulkSelectionProvider` as an ancestor')

  return (
    <DragToFillContext.Provider value={useMemo(() => ({isDragging, onFillStart}), [isDragging, onFillStart])}>
      {children}
    </DragToFillContext.Provider>
  )
})

export const useDragToFill = (cell: Pick<Cell<TableDataType>, 'column' | 'row'>) => {
  const {isDragging, onFillStart} = useContext(DragToFillContext)

  const selectionState = useTableCellBulkSelectionData()
  const orderedSelectedIds = Array.from(selectionState.rowIds)

  const isFillSourceCell =
    isDragging && selectionState.columnId === cell.column.id && orderedSelectedIds[0] === cell.row.original.id

  const isFillLastCell =
    isDragging && selectionState.columnId === cell.column.id && orderedSelectedIds.at(-1) === cell.row.original.id

  const onFillHandleMousedown = useCallback(
    (event: React.MouseEvent) => {
      // The row used for fill source is the first row put into the selectionState.rowIndexes Set.
      // If the user has a modifier key pressed, they could be keeping previously selected rows in the selection instead
      // of clearing it, which would cause the first row to be unexpectedly not the row where the selection started.
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (!(event.metaKey || event.ctrlKey || event.shiftKey)) {
        onFillStart?.(cell.column.id, cell.row.index)
      }
    },
    [cell, onFillStart],
  )

  const fillEmptyDown = useFillEmptyCellsDown(cell)
  const onFillHandleDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      fillEmptyDown()
    },
    [fillEmptyDown],
  )

  return onFillStart
    ? {
        isFillSourceCell,
        isFillLastCell,
        onFillHandleMousedown,
        onFillHandleDoubleClick,
      }
    : null
}

// By using row & columnModel here instead of cell, we can avoid having to iterate through each row's cells to find the cell in the column we need
const isEmptyCell = (row: Row<MemexItemModel>, columnModel: ColumnModel) => {
  const columnId = columnModel.id
  // Numeric columns use {value: number} so no need to check for zero
  return !row.original.columns[columnId]
}

export const useFillEmptyCellsDown = (cell: Pick<Cell<TableDataType>, 'column' | 'row'>) => {
  const table = useTableInstance()
  const bulkSelectActions = useTableCellBulkSelectionActions()
  const fillSelection = useFillSelection()

  const safeFillSelection = useSafeAsyncCallback(fillSelection)

  return useCallback(() => {
    const sourceRow = cell.row
    const column = cell.column.columnModel
    if (!bulkSelectActions || !column || isEmptyCell(sourceRow, column)) return

    const allRows = table.flatRows
    const followingRows = allRows.slice(sourceRow.index + 1)

    // We will fill all the empty cells up to the next filled one, the next redacted row, the end of the group, or the end of the table
    const indexAfterTargetInSlice = followingRows.findIndex(
      row =>
        row.original.contentType === ItemType.RedactedItem ||
        !isEmptyCell(row, column) ||
        sourceRow.groupedValue !== row.groupedValue,
    )

    const targetIndex = indexAfterTargetInSlice === -1 ? allRows.length - 1 : indexAfterTargetInSlice + sourceRow.index
    if (targetIndex === sourceRow.index) return

    const targetCell = allRows[targetIndex]?.cells.find(c => c.column.id === cell.column.id)
    if (!targetCell) return

    bulkSelectActions.select(cell, 'replace') // ensure this is the only cell selected and is the source for the range
    bulkSelectActions.selectRange(targetCell, 'replace')

    // Hack: fillSelection depends on selectionState, so we need it to be updated before we call it
    setTimeout(() => safeFillSelection('down'))
  }, [bulkSelectActions, cell, safeFillSelection, table.flatRows])
}
