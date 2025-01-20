import {useCallback, useMemo, useRef} from 'react'
import type {Cell} from 'react-table'

import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import {ItemType} from '../../api/memex-items/item-type'
import {TableRowKeyboardUI} from '../../api/stats/contracts'
import {useOpenParentIssue} from '../../features/sub-issues/use-open-parent-issue'
import {isMemexItemTypeArchivable} from '../../helpers/archive-util'
import {bulkColumnImmutable} from '../../helpers/column-editable'
import {shortcutFromEvent, SHORTCUTS} from '../../helpers/keyboard-shortcuts'
import {isPlatformMeta} from '../../helpers/util'
import {ViewerPrivileges} from '../../helpers/viewer-privileges'
import {useArchiveMemexItemsWithConfirmation} from '../../hooks/use-archive-memex-items-with-confirmation'
import {useRemoveMemexItemWithConfirmation} from '../../hooks/use-remove-memex-items-with-id'
import {useTableSidePanel} from '../../hooks/use-side-panel'
import {handleKeyboardNavigation, suppressEvents} from '../../navigation/keyboard'
import {FocusType, NavigationDirection} from '../../navigation/types'
import {Direction} from '../../selection/types'
import {useClearColumnValue} from '../../state-providers/column-values/use-clear-column-value'
import {useSearch} from '../filter-bar/search-context'
import {useFillSelection} from './bulk-fill-values'
import {isDragDropColumn} from './column-ids'
import {useCopyPaste} from './hooks/use-copy-paste'
import {
  cellHasFocus,
  focusCell,
  focusOmnibar,
  isCellFocus,
  isSuspended,
  moveTableFocus,
  useStableTableNavigation,
} from './navigation'
import {
  useAreCellsBulkSelected,
  useBulkSelectedColumn,
  useGetBulkSelectedRows,
  useTableCellBulkSelectionActions,
} from './table-cell-bulk-selection'
import type {TableDataType} from './table-data-type'
import {useTableDispatch, useTableInstance} from './table-provider'
import {useDeselectAll} from './use-deselect-all'
import {deselectAllRows} from './use-deselect-all-rows'
import {isRowSelectedAndActionable, useRowSelection} from './use-row-selection'

/*
 *  NOTE: this shortcut is registered globally to access the search bar on GitHub
 *        and should be ignored within the application if the user tries to
 *        use it to edit a cell.
 */
const SHORTCUT_LEADER = '/'

/**
 * Hook for configuring table focus state and behaviour for a given cell
 *
 * @param cell react-table cell associated with state and behaviour
 * @param editable flag to determine whether the cell can be editable (defaults to false if not provided)
 */
export const useTableFocusCell = (
  cell: Pick<Cell<TableDataType>, 'column' | 'row'>,
  isFocused: boolean,
  isEditing: boolean,
  editable = false,
  disabled = false,
  replaceContents = false,
) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLElement>(null)
  const {stateRef, navigationDispatch} = useStableTableNavigation()
  const readyToEdit = useRef(false)
  const {toggleAllRowsSelected, selectedFlatRows, flatRows} = useTableInstance()
  const {hasWritePermissions} = ViewerPrivileges()
  const {copyItems, paste} = useCopyPaste()
  const {expandRowSelectionInDirection} = useRowSelection(cell.row)
  const dispatch = useTableDispatch()
  const {openPane: openSidePanel} = useTableSidePanel()
  const {openParentIssue} = useOpenParentIssue()
  const {toggleFilter} = useSearch()

  const bulkSelectActions = useTableCellBulkSelectionActions()
  // Why am I forcing PullRequest type?
  // Because we don't want to allow bulk editing of the repository column
  // Even in the case of Draft issues
  const canBulkSelect = bulkSelectActions !== null
  const canBulkEdit = canBulkSelect && cell.column.columnModel && !bulkColumnImmutable(cell.column.columnModel.dataType)
  const hasBulkSelection = useAreCellsBulkSelected()
  const bulkSelectedColumn = useBulkSelectedColumn()

  const fillSelection = useFillSelection()

  const {clearColumnValue} = useClearColumnValue()
  const deselectAll = useDeselectAll()

  const focusIndex = useMemo(() => {
    return flatRows.findIndex(r => r.id === cell.row.id)
  }, [cell.row.id, flatRows])

  const refocusCell = useCallback(
    (removedItemIds: Array<number> = []) => {
      if (focusIndex === -1) return
      // Exclude rows that have been deleted or archived from the table
      const removedItemIdsSet = new Set(removedItemIds)
      const remainingRows = flatRows.filter(r => !removedItemIdsSet.has(r.original.id))
      const lastIndex = remainingRows.length - 1
      const nextFocusIndex = focusIndex > lastIndex ? lastIndex : focusIndex
      // Get the new row at the previously focused index
      const focusRow = remainingRows[nextFocusIndex]
      if (focusRow) {
        const nextCellFocus = focusRow.cells[1]
        if (!nextCellFocus) return
        navigationDispatch(focusCell(focusRow.id, nextCellFocus.column.id, false))
      } else {
        navigationDispatch(focusOmnibar())
      }
    },
    [flatRows, focusIndex, navigationDispatch],
  )

  const focusNextCell = useCallback(
    (removedItemIds: Array<number> = []) => {
      refocusCell(removedItemIds)
    },
    [refocusCell],
  )

  const getBulkSelectedRows = useGetBulkSelectedRows()

  const onConfirmRemoval = useCallback(
    (removedItemIds: Array<number>) => {
      deselectAll()
      focusNextCell(removedItemIds)
    },
    [focusNextCell, deselectAll],
  )

  const {openRemoveConfirmationDialog} = useRemoveMemexItemWithConfirmation(undefined, onConfirmRemoval, refocusCell)
  const {openArchiveConfirmationDialog} = useArchiveMemexItemsWithConfirmation(undefined, onConfirmRemoval, refocusCell)

  const onFocus = useCallback(() => {
    if (cellHasFocus(stateRef.current, cell.row.id, cell.column.id)) {
      // We don't want to dispatch the action if the cell is already focused in the navigation context.
      return
    }
    navigationDispatch(focusCell(cell.row.id, cell.column.id, false))
  }, [stateRef, cell.row.id, cell.column.id, navigationDispatch])

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (cell.column.nonNavigable || e.isPropagationStopped() || e.shiftKey) {
        return
      }

      // Enter edit mode when the user clicks on the caret or when the user clicks on a focused cell
      const didClickDropdownCaret = e.target instanceof Node && dropdownRef.current?.contains(e.target)
      const shouldEnterEditMode = readyToEdit.current || didClickDropdownCaret

      if (editable && shouldEnterEditMode) {
        readyToEdit.current = false
        navigationDispatch(focusCell(cell.row.id, cell.column.id, editable))
        bulkSelectActions?.clearSelection()
      }
    },
    [cell, editable, navigationDispatch, bulkSelectActions],
  )

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (cell.column.nonNavigable) return

      if (canBulkSelect) {
        if (e.shiftKey) {
          bulkSelectActions.selectRange(cell, isPlatformMeta(e) ? 'add' : 'replace')
          e.preventDefault()
          return
        } else if (isPlatformMeta(e)) {
          bulkSelectActions.select(cell, 'toggle')
        } else {
          bulkSelectActions.clearSelection()
        }
      }

      if (!isFocused) {
        readyToEdit.current = false
      } else if (isFocused && editable) {
        readyToEdit.current = true
      }

      dispatch(deselectAllRows())
    },
    [canBulkSelect, cell, isFocused, editable, dispatch, bulkSelectActions],
  )

  const selectedRows = selectedFlatRows.filter(r => isRowSelectedAndActionable(r))

  const onKeyDown: React.KeyboardEventHandler = useCallback(
    e => {
      if (isDragDropColumn(cell.column) || isEditing) {
        return
      }

      const shortcut = shortcutFromEvent(e)

      if (canBulkSelect && (shortcut === SHORTCUTS.ARROW_LEFT || shortcut === SHORTCUTS.ARROW_RIGHT)) {
        bulkSelectActions.clearSelection()
      }

      const result = handleKeyboardNavigation(navigationDispatch, e)
      if (result.action) {
        dispatch(deselectAllRows()) // keep cell selection to allow for selecting multiple separate ranges
        suppressEvents(e)
      } else {
        switch (shortcut) {
          case SHORTCUTS.ENTER: {
            if (editable) {
              navigationDispatch(moveTableFocus({focusType: FocusType.Edit}))
              suppressEvents(e)
            }
            return
          }
          case SHORTCUTS.HOME: {
            navigationDispatch(moveTableFocus({x: NavigationDirection.First, focusType: FocusType.Focus}))
            dispatch(deselectAllRows())
            suppressEvents(e)
            return
          }
          // WCAG standards say this should select the column, but it conflicts (on Windows) with our command+space shortcut to focus the omnibar
          // case SHORTCUTS.META_SPACE: {
          //   if (canUseBulkActions) {
          //     bulkSelectActions.selectColumn(cell.column.id, cell.row.index)
          //     suppressEvents(e)
          //   }
          //   return
          // }
          case SHORTCUTS.SHIFT_SPACE: {
            if (hasWritePermissions) {
              suppressEvents(e)
              cell.row.toggleRowSelected(true)
            }
            return
          }
          case SHORTCUTS.SPACE: {
            if (cell.column.id === 'Title') {
              openSidePanel(cell.row.original)
              suppressEvents(e)
            }
            if (cell.column.columnModel?.dataType === MemexColumnDataType.ParentIssue) {
              openParentIssue(cell.row.original.getParentIssue())
              suppressEvents(e)
            }
            if (cell.column.columnModel?.dataType === MemexColumnDataType.SubIssuesProgress) {
              toggleFilter('parent-issue', cell.row.original.getNameWithOwnerReference())
              suppressEvents(e)
            }
            return
          }
          case SHORTCUTS.META_ENTER: {
            if (canBulkSelect) {
              bulkSelectActions.select(cell, 'toggle')
              suppressEvents(e)
            }
            return
          }
          case SHORTCUTS.SHIFT_ENTER: {
            if (canBulkSelect) {
              bulkSelectActions.selectRange(cell, 'replace')
              suppressEvents(e)
            }
            return
          }
          case SHORTCUTS.META_SHIFT_ENTER: {
            if (canBulkSelect) {
              bulkSelectActions.selectRange(cell, 'add')
              suppressEvents(e)
            }
            return
          }
          case SHORTCUTS.SHIFT_ARROW_UP: {
            if (selectedFlatRows.length > 0) {
              expandRowSelectionInDirection(Direction.Up, cell.row)
              suppressEvents(e)
            } else if (canBulkSelect) {
              bulkSelectActions.expandSelectionUp(cell)
              navigationDispatch(moveTableFocus({y: NavigationDirection.Previous, focusType: FocusType.Focus}))
              suppressEvents(e)
            }
            return
          }
          case SHORTCUTS.SHIFT_ARROW_DOWN: {
            if (selectedFlatRows.length > 0) {
              expandRowSelectionInDirection(Direction.Down, cell.row)
              suppressEvents(e)
            } else if (canBulkSelect) {
              bulkSelectActions.expandSelectionDown(cell)
              navigationDispatch(moveTableFocus({y: NavigationDirection.Next, focusType: FocusType.Focus}))
              suppressEvents(e)
            }
            return
          }
          case SHORTCUTS.END: {
            navigationDispatch(moveTableFocus({x: NavigationDirection.Last, focusType: FocusType.Focus}))
            dispatch(deselectAllRows())
            suppressEvents(e)
            return
          }
          case SHORTCUTS.META_C: {
            if (cell.row.original.contentType !== ItemType.RedactedItem) {
              if (selectedRows.length > 0) {
                copyItems(
                  selectedRows.map(row => row.original),
                  // only include headers when copying whole table; this makes the result closer to what the user sees
                  // important that we use selectedFlatRows and not the filtered selectedRows here to include redacted
                  // items in the count
                  {withHeaders: selectedFlatRows.length === flatRows.length},
                )
              } else {
                const bulkSelectedRows = getBulkSelectedRows().map(row => row.original)

                if (bulkSelectedRows.length && bulkSelectedColumn?.columnModel) {
                  copyItems(bulkSelectedRows, {selectedFields: [bulkSelectedColumn.columnModel]})
                } else if (cell.column.columnModel) {
                  copyItems([cell.row.original], {selectedFields: [cell.column.columnModel]})
                }
              }
              e.preventDefault()
            }
            return
          }
          case SHORTCUTS.META_V: {
            if (hasWritePermissions && cell.row.original.contentType !== ItemType.RedactedItem) {
              paste(
                cell,
                getBulkSelectedRows()
                  .sort((a, b) => a.index - b.index)
                  .map(row => row.original),
              )
              e.preventDefault()
            }

            return
          }
          case SHORTCUTS.META_A: {
            if (selectedFlatRows.length === flatRows.length) {
              dispatch(deselectAllRows())
            } else if (selectedFlatRows.length > 0) {
              toggleAllRowsSelected(true)
            } else if (selectedFlatRows.length === 0) {
              cell.row.toggleRowSelected(true)
            }
            suppressEvents(e)
            return
          }
          case SHORTCUTS.DELETE:
          case SHORTCUTS.BACKSPACE: {
            if (hasWritePermissions && selectedRows.length > 0) {
              suppressEvents(e)
              const selectedRowsAsNumbers = selectedRows.map(r => r.original.id)
              openRemoveConfirmationDialog(selectedRowsAsNumbers, TableRowKeyboardUI)
            } else if (editable) {
              const rows = getBulkSelectedRows()
              if (rows.length === 0) rows.push(cell.row)

              clearColumnValue(cell.column, rows)
              suppressEvents(e)
            }
            return
          }
          case SHORTCUTS.META_D: {
            if (canBulkEdit && hasWritePermissions && hasBulkSelection) {
              suppressEvents(e)
              fillSelection('down')
            }
            return
          }
          case SHORTCUTS.ARCHIVE: {
            if (
              selectedRows.length &&
              hasWritePermissions &&
              selectedRows.every(row => isMemexItemTypeArchivable(row.original.contentType))
            ) {
              suppressEvents(e)
              const selectedRowsAsNumbers = selectedRows.map(r => r.original.id)
              openArchiveConfirmationDialog(selectedRowsAsNumbers, TableRowKeyboardUI)
              return
            }
          }
        }

        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        if (e.key.match(/^\S$/) && !anyModifierPressed(e) && e.key !== SHORTCUT_LEADER) {
          // for any single non-white space character, switch to edit mode
          // ignore if any of ALT, CTRL and Command/Windows key pressed

          const shouldTransitionToEditModeOnKeydown = cell.column.typeToEditEnabled !== false
          if (editable && shouldTransitionToEditModeOnKeydown) {
            // signal to the cell editor that it needs to replace the
            // default text of the input with the text that was just
            // entered by the user when it is first rendered
            // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
            navigationDispatch(focusCell(cell.row.id, cell.column.id, true, false, true, e.key))
          }

          suppressEvents(e)
          return
        }
      }
    },
    [
      cell,
      isEditing,
      canBulkSelect,
      navigationDispatch,
      bulkSelectActions,
      dispatch,
      editable,
      hasWritePermissions,
      openSidePanel,
      selectedFlatRows,
      expandRowSelectionInDirection,
      bulkSelectedColumn,
      copyItems,
      flatRows.length,
      getBulkSelectedRows,
      paste,
      toggleAllRowsSelected,
      selectedRows,
      openRemoveConfirmationDialog,
      clearColumnValue,
      canBulkEdit,
      hasBulkSelection,
      fillSelection,
      openArchiveConfirmationDialog,
      openParentIssue,
      toggleFilter,
    ],
  )

  /** Drag to select multiple cells. */
  const onMouseEnter: React.MouseEventHandler = useCallback(
    event => {
      if (event.buttons !== 1 || !bulkSelectActions || cell.column.nonNavigable) return

      const focus = stateRef.current?.focus

      // Rather than tracking a global 'dragging' state, we just check the current state of the table to see whether
      // the drag started in a valid spot. Dragging is only valid within a column and cells are selected on mousedown,
      // so we only need to make sure the selection is in this column. Otherwise we ignore it to avoid clearing the
      // user's selection if they accidentally left the column while dragging.
      const focusedColumnId = focus && isCellFocus(focus) && !isSuspended(focus) ? focus.details.x : null
      if (cell.column.id !== focusedColumnId) return

      bulkSelectActions.selectRange(cell, isPlatformMeta(event) ? 'add' : 'replace')
    },
    [bulkSelectActions, cell, stateRef],
  )

  const wrapperProps = useMemo(
    () => ({
      ref: wrapperRef,
      onKeyDown,
      onClick,
      onMouseDown,
      onFocus,
      onMouseEnter,
      tabIndex: cell.column.nonNavigable ? undefined : 0,
    }),
    [onKeyDown, onClick, onMouseDown, onFocus, onMouseEnter, cell.column.nonNavigable],
  )

  const contentsProps = useMemo(() => {
    if (isEditing) {
      return {replaceContents, isDisabled: disabled}
    } else {
      return {dropdownRef, isDisabled: disabled}
    }
  }, [isEditing, dropdownRef, replaceContents, disabled])

  return {
    wrapperProps,
    contentsProps,
  }
}

/**
 * Check if any keyboard modifier (ALT, CTRL or Command/Windows key) was pressed
 * when this keyboard event was raised.
 */
function anyModifierPressed(e: React.KeyboardEvent) {
  // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
  return e.altKey || e.ctrlKey || e.metaKey
}
