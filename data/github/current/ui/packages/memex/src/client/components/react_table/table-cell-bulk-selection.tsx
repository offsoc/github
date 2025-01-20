import {useTrackingRef} from '@github-ui/use-tracking-ref'
import {createContext, memo, useCallback, useContext, useEffect, useMemo, useReducer} from 'react'
import type {Cell, Row} from 'react-table'

import {ItemType} from '../../api/memex-items/item-type'
import {defined, isEqualSets, xor} from '../../helpers/util'
import type {MemexItemModel} from '../../models/memex-item-model'
import {MAX_BULK_ITEMS} from '../../state-providers/column-values/use-bulk-update-item-column-value'
import {Resources} from '../../strings'
import {useGetVisibleRows} from './hooks/use-visible-rows'
import {isCellFocus, useTableNavigation} from './navigation'
import type {TableDataType} from './table-data-type'
import {useTableDispatch, useTableInstance} from './table-provider'
import {deselectAllRows} from './use-deselect-all-rows'

type SelectionState = {
  readonly columnId: string | null
  /** Memex IDs of the selected rows (ie, `row.original.id`). */
  readonly rowIds: ReadonlySet<number>
  /** Reference row ID for range selection. */
  readonly rangeReferenceId: number | null
  /** `true` if more cells are selected than can be acted on. */
  readonly isMaximumExceeded: boolean
}

const SelectionState = {
  EMPTY: {columnId: null, rowIds: new Set(), rangeReferenceId: null, isMaximumExceeded: false} as SelectionState,
  isEqual: (a: SelectionState, b: SelectionState) =>
    a === b ||
    (a.columnId === b.columnId && a.rangeReferenceId === b.rangeReferenceId && isEqualSets(a.rowIds, b.rowIds)),
}

/**
 * - toggle: Unselected affected items will be selected, and selected affected items will be unselected. Other items
 *   will not change.
 * - replace: Existing selection will be discarded and replaced.
 * - add: Unselected affected items will be selected, and other items will not change.
 */
type SelectMode = 'toggle' | 'replace' | 'add'

type SelectionMethods = {
  select: (cell: Pick<Cell<TableDataType>, 'column' | 'row'>, mode: SelectMode) => void
  selectRange: (cell: Pick<Cell<TableDataType>, 'column' | 'row'>, mode: SelectMode) => void
  expandSelectionUp: (cell: Pick<Cell<TableDataType>, 'column' | 'row'>) => void
  expandSelectionDown: (cell: Pick<Cell<TableDataType>, 'column' | 'row'>) => void
  clearSelection: () => void
  selectColumn: (columnId: string) => void
}

const generateRange = (start: number, end: number) => {
  const min = Math.min(start, end)
  const range = Array.from({length: Math.abs(start - end) + 1}, (_, i) => min + i)
  // We always want the last element in the set to be the one the user clicked (to use as the lastAffectedIndex)
  return start <= end ? range : range.reverse()
}

type SelectionUpdate = {
  affectedRowIds?: Array<number> | ((state: SelectionState) => Array<number>)
  mode: SelectMode
  columnId: string | null
  keepRangeReference?: boolean
}

const defaultAffectedRowIds: Array<number> | ((state: SelectionState) => Array<number>) = []
const reduceSelectionUpdate = (
  state: SelectionState,
  {columnId, affectedRowIds = defaultAffectedRowIds, mode, keepRangeReference = false}: SelectionUpdate,
): SelectionState => {
  if (columnId === null) return SelectionState.EMPTY // short circuit for tiny perf gain

  // Start from empty if not in current column
  const initialState = state.columnId !== columnId ? SelectionState.EMPTY : state

  const resolvedAffectedRowIds = Array.isArray(affectedRowIds) ? affectedRowIds : affectedRowIds?.(initialState)

  // For range selection, don't update the reference index
  const rangeReferenceId = keepRangeReference
    ? state.rangeReferenceId
    : resolvedAffectedRowIds.at(-1) ?? state.rangeReferenceId

  let rowIds: Set<number>
  switch (mode) {
    case 'toggle':
      rowIds = xor(initialState.rowIds, new Set(resolvedAffectedRowIds))
      break
    case 'replace':
      rowIds = new Set(resolvedAffectedRowIds)
      break
    case 'add':
      rowIds = new Set([...initialState.rowIds, ...resolvedAffectedRowIds])
  }

  const result: SelectionState = {
    columnId,
    rowIds,
    rangeReferenceId,
    isMaximumExceeded: rowIds.size > MAX_BULK_ITEMS,
  }

  return SelectionState.isEqual(result, state) ? state : result
}

const SelectionStateContext = createContext<SelectionState>(SelectionState.EMPTY)

const SelectionMethodsContext = createContext<SelectionMethods | null>(null)

const SelectionAreCellsBulkSelectedContext = createContext<boolean | null>(null)

export const TableCellBulkSelectionProvider = memo<{children: React.ReactNode}>(
  function TableCellBulkSelectionProvider(props) {
    const [state, dispatch] = useReducer(reduceSelectionUpdate, SelectionState.EMPTY)

    // never changes, so it's fine to use as a dependency of the memo
    const table = useTableInstance()

    const focusRef = useTrackingRef(useTableNavigation().state.focus)

    const getRowIndex = useCallback(
      (rowId: number) => table.flatRows.findIndex(row => row.original.id === rowId),
      [table],
    )

    const getRowId = useCallback((rowIndex: number) => table.flatRows[rowIndex]?.original.id, [table])

    const getFocusedCell = useCallback(() => {
      const focus = focusRef.current
      return focus && isCellFocus(focus)
        ? table.rowsById[focus.details.y]?.cells.find(
            cell =>
              // Optional chaining should be unecessary here - cell.column is not typed as optional - but we have run into
              // production errors because there are edge cases(race conditions ?) where it can be undefined
              cell.column?.id === focus.details.x,
          )
        : undefined
      // we use a tracking ref to avoid updating this every time focus changes
    }, [focusRef, table])

    const getRowRange = useCallback(
      (columnId: string, referenceRowId: number | null, targetRowId: number) => {
        const focusedCell = getFocusedCell()

        const targetIndex = getRowIndex(targetRowId)

        // reference row, fall back to focused row, then fall back to target row (just selecting one cell)
        const referenceIndex =
          referenceRowId !== null
            ? getRowIndex(referenceRowId)
            : focusedCell?.column.id === columnId
              ? getRowIndex(focusedCell.row.original.id) // row.index is incorrect in filtered views
              : targetIndex

        return generateRange(referenceIndex, targetIndex)
          .map(index => getRowId(index))
          .filter(defined)
      },
      [getRowIndex, getRowId, getFocusedCell],
    )

    const getVisibleRows = useGetVisibleRows()

    const getVisibleRowIds = useCallback(() => getVisibleRows().map(row => row.original.id), [getVisibleRows])

    /** Falls back to passed row ID if none found. */
    const getPreviousRow = useCallback(
      (rowId: number) => getRowId(getRowIndex(rowId) - 1) ?? rowId,
      [getRowIndex, getRowId],
    )

    /** Falls back to passed row ID if none found. */
    const getNextRow = useCallback(
      (rowId: number) => getRowId(getRowIndex(rowId) + 1) ?? rowId,
      [getRowIndex, getRowId],
    )

    const actions = useMemo<SelectionMethods>(
      () => ({
        select: (cell, mode) =>
          dispatch({
            columnId: cell.column.id,
            mode,
            affectedRowIds: ({columnId}) => {
              // When the user focuses a cell, it is not selected by default. But then when they meta+click, they expect
              // that focused cell to be included in the selection. We only do this when the selection is empty or we'd
              // end up toggling the focused cell, unselecting behind the user as they select things.
              const focusedCell = getFocusedCell()
              return (mode === 'toggle' || mode === 'add') && columnId === null && focusedCell
                ? [focusedCell.row.original.id, cell.row.original.id]
                : [cell.row.original.id]
            },
          }),
        selectRange: (cell, mode) =>
          dispatch({
            columnId: cell.column.id,
            mode,
            affectedRowIds: ({rangeReferenceId}) => getRowRange(cell.column.id, rangeReferenceId, cell.row.original.id),
            keepRangeReference: true,
          }),
        clearSelection: () => dispatch({columnId: null, mode: 'replace'}),
        expandSelectionUp: cell =>
          dispatch({
            columnId: cell.column.id,
            mode: 'add',
            affectedRowIds: [cell.row.original.id, getPreviousRow(cell.row.original.id)],
          }),
        expandSelectionDown: cell =>
          dispatch({
            columnId: cell.column.id,
            mode: 'add',
            affectedRowIds: [cell.row.original.id, getNextRow(cell.row.original.id)],
          }),
        selectColumn: columnId => dispatch({affectedRowIds: getVisibleRowIds(), columnId, mode: 'replace'}),
      }),
      [getRowRange, getPreviousRow, getNextRow, getVisibleRowIds, getFocusedCell],
    )

    const tableDispatch = useTableDispatch()
    useEffect(() => {
      // Clear row selections when any cells get selected
      if (state.rowIds.size > 0) tableDispatch(deselectAllRows())
    }, [tableDispatch, state])

    return (
      <SelectionMethodsContext.Provider value={actions}>
        <SelectionStateContext.Provider value={state}>
          <SelectionAreCellsBulkSelectedContext.Provider value={state.rowIds.size > 0}>
            {props.children}
            <span className="sr-only" aria-live="polite" aria-relevant="additions removals">
              {state.isMaximumExceeded && Resources.selectionMaximumExceeded(MAX_BULK_ITEMS)}
            </span>
          </SelectionAreCellsBulkSelectedContext.Provider>
        </SelectionStateContext.Provider>
      </SelectionMethodsContext.Provider>
    )
  },
)

export const useTableCellBulkSelectionData = () => useContext(SelectionStateContext)

/** If `null`, bulk selection is disabled. */
export const useTableCellBulkSelectionActions = () => useContext(SelectionMethodsContext)

export const useIsCellBulkSelected = (cell?: Pick<Cell<TableDataType>, 'column' | 'row'>) => {
  const state = useTableCellBulkSelectionData()

  if (!cell) return false

  return state.columnId === cell.column.id && state.rowIds.has(cell.row.original.id)
}

export const useAreCellsBulkSelected = () => {
  return useContext(SelectionAreCellsBulkSelectedContext)
}

/** Get the selected row instances (in order of when they were first selected). */
export const useGetBulkSelectedRows = () => {
  const {rowIds} = useTableCellBulkSelectionData()
  const table = useTableInstance()

  return useCallback(
    () =>
      Array.from(rowIds)
        .map(id => table.flatRows.find(row => row.original.id === id))
        .filter(
          (row): row is Row<MemexItemModel> => row !== undefined && row.original.contentType !== ItemType.RedactedItem,
        ),
    [rowIds, table],
  )
}

export const useBulkSelectedColumn = () => {
  const state = useTableCellBulkSelectionData()
  const table = useTableInstance()
  return state.columnId !== null ? table.visibleColumns.find(col => col.id === state.columnId) : null
}
