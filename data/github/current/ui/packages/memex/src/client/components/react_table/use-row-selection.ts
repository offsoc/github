import {useCallback, useEffect, useState} from 'react'
import type {Row} from 'react-table'

import {ItemType} from '../../api/memex-items/item-type'
import {not_typesafe_nonNullAssertion} from '../../helpers/non-null-assertion'
import {isPlatformMeta} from '../../helpers/util'
import {Direction} from '../../selection/types'
import {focusCell, focusOmnibar, type TableFocusState, useStableTableNavigation} from './navigation'
import {useTableCellBulkSelectionActions} from './table-cell-bulk-selection'
import type {TableDataType} from './table-data-type'
import {useTableDispatch, useTableInstance} from './table-provider'
import {deselectAllRows} from './use-deselect-all-rows'

export const isRowActionable = (row: Row<TableDataType>) => row.original.contentType !== ItemType.RedactedItem

export const isRowSelectedAndActionable = (row?: Row<TableDataType>) =>
  row !== undefined && row.isSelected && isRowActionable(row)

export const getSelectionInfo = (
  row: Row<TableDataType>,
  rows: Array<Row<TableDataType>>,
  groupedRows: Array<Row<TableDataType>> | undefined,
) => {
  const isSelected = isRowSelectedAndActionable(row)
  let beforeSelected = false
  let afterSelected = false
  if (isSelected) {
    const rowsWithoutGroups = rows.filter(r => !r.isGrouped)
    const rowIndex = rowsWithoutGroups.findIndex(r => r.id === row.id)
    beforeSelected = isRowSelectedAndActionable(rowsWithoutGroups[rowIndex - 1])
    afterSelected = isRowSelectedAndActionable(rowsWithoutGroups[rowIndex + 1])
  }

  let firstInGroup = false
  let lastInGroup = false
  if (groupedRows && isSelected) {
    for (const group of groupedRows) {
      const subRowIndex = group.subRows.findIndex(subrow => subrow.id === row.id)
      if (subRowIndex === 0) {
        firstInGroup = true
      }

      if (subRowIndex === group.subRows.length - 1) {
        lastInGroup = true
      }

      if (firstInGroup || lastInGroup) break
    }
  }

  return {beforeSelected, afterSelected, firstInGroup, lastInGroup}
}

const defaultClickTargets: Array<React.RefObject<HTMLElement | null>> = []
export function useRowSelection(
  row: Row<TableDataType>,
  clickTargets: Array<React.RefObject<HTMLElement | null>> = defaultClickTargets,
) {
  const {navigationDispatch, stateRef: focusStateRef} = useStableTableNavigation()
  const {flatRows, selectedFlatRows} = useTableInstance()
  const [lastFocus, setLastFocus] = useState<TableFocusState | null>(null)
  const [lastFocusIndex, setLastFocusIndex] = useState<number | null>(null)
  const bulkSelectActions = useTableCellBulkSelectionActions()
  const dispatch = useTableDispatch()

  useEffect(() => {
    // Clear cell selections when any rows get selected
    if (selectedFlatRows.length > 0) bulkSelectActions?.clearSelection()
  }, [selectedFlatRows, bulkSelectActions])

  const expandRowSelection = useCallback(
    (anchorId: string) => {
      const rows = flatRows
      const selectableRows = rows.filter(r => r.toggleRowSelected != null)
      const anchorRowIndex = selectableRows.findIndex(r => r.id === anchorId)
      const rowIndex = selectableRows.findIndex(r => r.id === row.id)
      let rowsToSelect: Array<Row<TableDataType>> = []
      if (rowIndex < anchorRowIndex) {
        rowsToSelect = selectableRows.slice(rowIndex, anchorRowIndex + 1)
      } else if (rowIndex > anchorRowIndex) {
        rowsToSelect = selectableRows.slice(anchorRowIndex, rowIndex + 1)
      }
      if (rowsToSelect.length) {
        dispatch(deselectAllRows())
        for (const r of rowsToSelect) {
          r.toggleRowSelected(true)
        }
      }
    },
    [flatRows, row.id, dispatch],
  )

  const expandRowSelectionInDirection = useCallback(
    (direction: Direction, focusedRow: Row<TableDataType>) => {
      const selectedRows = selectedFlatRows.filter(r => !r.isGrouped)
      if (selectedRows.length === 0) return

      const rowsWithoutGroups = flatRows.filter(r => !r.isGrouped)
      let rowsToSelect: Array<Row<TableDataType>> = []

      const startRow = not_typesafe_nonNullAssertion(selectedRows[0])
      const startIndex = rowsWithoutGroups.findIndex(r => r.id === startRow.id)
      const endRow = not_typesafe_nonNullAssertion(selectedRows[selectedRows.length - 1])
      const endIndex = rowsWithoutGroups.findIndex(r => r.id === endRow.id)
      const focusedRowIndex = rowsWithoutGroups.findIndex(r => r.id === focusedRow.id)

      if (selectedRows.length === 1) {
        // focused row <- start index, end index
        if (direction === Direction.Up) {
          rowsToSelect = rowsWithoutGroups.slice(startIndex - 1, startIndex + 1)
        } else if (direction === Direction.Down) {
          rowsToSelect = rowsWithoutGroups.slice(startIndex, startIndex + 2)
        }
      } else if (focusedRowIndex < endIndex) {
        // focused row <- start index
        // selected row
        // selected row <- end index
        if (direction === Direction.Up) {
          rowsToSelect = rowsWithoutGroups.slice(startIndex, endIndex)
        } else if (direction === Direction.Down) {
          rowsToSelect = rowsWithoutGroups.slice(startIndex, endIndex + 2)
        }
      } else {
        // selected row <- start index
        // selected row
        // focused row <- end index
        if (direction === Direction.Up) {
          if (startIndex === 0) return
          rowsToSelect = rowsWithoutGroups.slice(startIndex - 1, focusedRowIndex + 1)
        } else if (direction === Direction.Down) {
          rowsToSelect = rowsWithoutGroups.slice(startIndex + 1, focusedRowIndex + 1)
        }
      }

      if (rowsToSelect.length) {
        dispatch(deselectAllRows())
        for (const r of rowsToSelect) {
          r.toggleRowSelected(true)
        }
      }
    },
    [flatRows, selectedFlatRows, dispatch],
  )

  const onRowClick = useCallback(
    (e: React.MouseEvent | PointerEvent) => {
      if (!clickTargets.some(i => i.current === e.target)) return

      if (isPlatformMeta(e)) {
        row.toggleRowSelected()
        const nextFocusCell = row.cells[1]
        if (nextFocusCell) {
          navigationDispatch(focusCell(row.id, nextFocusCell.column.id, false))
        }
      } else if (selectedFlatRows.length && e.shiftKey && lastFocus?.focus?.type === 'coordinate') {
        const {x: columnId, y: rowId} = lastFocus.focus.details
        expandRowSelection(rowId)
        navigationDispatch(focusCell(rowId, columnId, false))
      } else {
        dispatch(deselectAllRows())
        row.toggleRowSelected(true)
        const nextFocusCell = row.cells[1]
        if (nextFocusCell) {
          navigationDispatch(focusCell(row.id, nextFocusCell.column.id, false))
        }
      }
    },
    [
      clickTargets,
      selectedFlatRows.length,
      lastFocus?.focus?.type,
      lastFocus?.focus?.details,
      row,
      navigationDispatch,
      expandRowSelection,
      dispatch,
    ],
  )

  const onRowPointerDown = useCallback(() => {
    if (focusStateRef.current?.focus?.type === 'coordinate') {
      setLastFocus(focusStateRef.current)
      const {y: rowId} = focusStateRef.current.focus.details
      const lastIndex = flatRows.findIndex(r => r.id === rowId)
      setLastFocusIndex(lastIndex)
    } else {
      // If clicking directly on row action menu with no coordinate selection, mark
      // last focus index as current row to refocus after menu closes
      setLastFocusIndex(flatRows.findIndex(r => r.id === row.id))
    }
  }, [flatRows, focusStateRef, row])

  const focusLastRowIndex = useCallback(
    (removedItemIds: Array<number>) => {
      if (lastFocusIndex !== null && lastFocusIndex > -1) {
        // Exclude items that have been removed/archived from the table
        const removedItemIdsSet = new Set(removedItemIds)
        const remainingRows = flatRows.filter(r => !removedItemIdsSet.has(r.original.id) && r.cells.length > 1)
        const lastIndex = remainingRows.length - 1
        const nextFocusIndex = lastFocusIndex > lastIndex ? lastIndex : lastFocusIndex
        // Get the new row at the same index as the last focused row
        const focusRow = remainingRows[nextFocusIndex]

        if (focusRow) {
          const nextFocusCell = focusRow.cells[1]
          if (nextFocusCell) {
            navigationDispatch(focusCell(focusRow.id, nextFocusCell.column.id, false))
          }
        } else {
          navigationDispatch(focusOmnibar())
        }
      }
    },
    [flatRows, lastFocusIndex, navigationDispatch],
  )

  return {onRowClick, onRowPointerDown, focusLastRowIndex, expandRowSelectionInDirection}
}
