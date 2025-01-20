import {createContext, useContext} from 'react'
import type {TableDispatch, TableInstance, TableState} from 'react-table'

import {CellValidationContextProvider} from './cell-validation'
import type {TableDataType} from './table-data-type'

type TableStateContextValue = TableState<TableDataType>
type TableDispatchContextValue = TableDispatch
type TableStateOverColumnContextValue = TableState<TableDataType>['overColumn']
type TableStateSelectedRowIdsContextValue = TableState<TableDataType>['selectedRowIds']
type TableStateRowMenuShortcutOriginContextValue = TableState<TableDataType>['rowMenuShortcutOrigin']
type TableStateColumnResizingContextValue = TableState<TableDataType>['columnResizing']
type TableInstanceContextValue = TableInstance<TableDataType>

const TableStateContext = createContext<TableStateContextValue | null>(null)
const TableDispatchContext = createContext<TableDispatchContextValue | null>(null)
const TableStateOverColumnContext = createContext<TableStateOverColumnContextValue | null>(null)
const TableStateSelectedRowIdsContext = createContext<TableStateSelectedRowIdsContextValue | undefined>(undefined)
const TableStateSortByContext = createContext<TableState<TableDataType>['sortBy'] | null>(null)
const TableStateRowMenuShortcutOriginContext = createContext<TableStateRowMenuShortcutOriginContextValue | null>(null)
const TableStateColumnResizingContext = createContext<TableStateColumnResizingContextValue | null>(null)
export const TableInstanceContext = createContext<TableInstanceContextValue | null>(null)

const TableCellHeightContext = createContext<number>(0)
/**
 * Sets up a context in which consumers can access table state or the table
 * dispatch function via `useTableState` and `useTableDispatch`, respectively.
 *
 * If both state and dispatch are desired, `useTableStateAndDispatch` can be
 * used.
 *
 * @param props Props with a `table` attribute
 */
export const TableProvider: React.FC<{
  table: TableInstance<TableDataType>
  cellHeight: number
  children: React.ReactNode
}> = props => {
  return (
    <TableStateContext.Provider value={props.table.state}>
      <TableStateOverColumnContext.Provider value={props.table.state.overColumn}>
        <TableStateSelectedRowIdsContext.Provider value={props.table.state.selectedRowIds}>
          <TableStateSortByContext.Provider value={props.table.state.sortBy}>
            <TableStateRowMenuShortcutOriginContext.Provider value={props.table.state.rowMenuShortcutOrigin}>
              <TableStateColumnResizingContext.Provider value={props.table.state.columnResizing}>
                <TableInstanceContext.Provider value={props.table}>
                  <TableDispatchContext.Provider value={props.table.dispatch}>
                    <CellValidationContextProvider>
                      <TableCellHeightContext.Provider value={props.cellHeight}>
                        {props.children}
                      </TableCellHeightContext.Provider>
                    </CellValidationContextProvider>
                  </TableDispatchContext.Provider>
                </TableInstanceContext.Provider>
              </TableStateColumnResizingContext.Provider>
            </TableStateRowMenuShortcutOriginContext.Provider>
          </TableStateSortByContext.Provider>
        </TableStateSelectedRowIdsContext.Provider>
      </TableStateOverColumnContext.Provider>
    </TableStateContext.Provider>
  )
}

/**
 * Gets the current table state.
 */
export function useTableState(): TableStateContextValue {
  const state = useContext(TableStateContext)

  if (!state) {
    throw new Error('Must use `useTableState` in child of `<TableStateProvider>')
  }

  return state
}

/**
 * Gets the current table over column.
 */
export function useTableOverColumn(): TableStateOverColumnContextValue {
  const overColumn = useContext(TableStateOverColumnContext)
  return overColumn
}

/**
 * Gets the table dispatch function.
 */
export function useTableDispatch(): TableDispatchContextValue {
  const dispatch = useContext(TableDispatchContext)

  if (!dispatch) {
    throw new Error('Must use `useTableDispatch` in child of `<TableDispatchProvider>')
  }

  return dispatch
}

/**
 * Get the table's current selected row IDs.
 */
export function useTableSelectedRowIds(): TableStateSelectedRowIdsContextValue {
  const selectedRowIds = useContext(TableStateSelectedRowIdsContext)
  return selectedRowIds
}

/**
 * Get the height of table cells
 */
export function useTableCellHeight(): number {
  const cellHeight = useContext(TableCellHeightContext)
  return cellHeight
}

/**
 * Get a reference to the table instance itself.
 *
 * NOTE: Be careful with this hook—our table instance never changes, so table
 * state updates will not cause consumers of this hook to re-render, for
 * example.
 */
export function useTableInstance(): TableInstanceContextValue {
  const instance = useContext(TableInstanceContext)

  if (!instance) {
    throw new Error('Must use `useTableInstance` in child of `<TableProvider>')
  }

  return instance
}

/**
 * Get the table's row menu shortcut origin.
 */
export function useTableRowMenuShortcutOrigin(): TableStateRowMenuShortcutOriginContextValue {
  const rowMenuShortcutOrigin = useContext(TableStateRowMenuShortcutOriginContext)
  return rowMenuShortcutOrigin ?? undefined
}

/**
 * Get the table's internal column resizing state.
 */
export function useTableColumnResizing(): TableStateColumnResizingContextValue {
  const columnResizing = useContext(TableStateColumnResizingContext)

  if (!columnResizing) {
    throw new Error('Must use `useTableColumnResizing` in child of `<TableProvider>')
  }

  return columnResizing
}
