import {testIdProps} from '@github-ui/test-id-props'
import {ArchiveIcon, IssueOpenedIcon, TrashIcon, TriangleDownIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, IconButton} from '@primer/react'
import {memo, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react'
import {flushSync} from 'react-dom'
import type {EditorCellProps, RendererCellProps, Row} from 'react-table'

import {ItemType} from '../../api/memex-items/item-type'
import {DraftConvert, RowDraggerMenuUI, TableRowActionMenuUI} from '../../api/stats/contracts'
import {isMemexItemTypeArchivable} from '../../helpers/archive-util'
import {ViewerPrivileges} from '../../helpers/viewer-privileges'
import {usePostStats} from '../../hooks/common/use-post-stats'
import {useArchiveMemexItemsWithConfirmation} from '../../hooks/use-archive-memex-items-with-confirmation'
import {useRemoveMemexItemWithConfirmation} from '../../hooks/use-remove-memex-items-with-id'
import {createSetFocusStateAction} from '../../navigation/context'
import {delKey as DelKey, eKey as EKey} from '../common/keyboard-shortcuts'
import {RepoPicker} from '../repo-picker'
import {BaseCell} from './cells/base-cell'
import {isDragDropColumn} from './column-ids'
import {clearFocus, useStableTableNavigation} from './navigation'
import type {TableDataType} from './table-data-type'
import {useTableDispatch, useTableInstance, useTableRowMenuShortcutOrigin} from './table-provider'
import {RowContext} from './table-row'
import {deselectAllRows} from './use-deselect-all-rows'
import {setRowMenuOpen} from './use-row-menu-shortcut'
import {isRowSelectedAndActionable, useRowSelection} from './use-row-selection'

// disable dragging for RedactedItems
const DefaultCellStyle: React.CSSProperties = {
  position: 'relative',
  overflow: 'visible',
  userSelect: 'none',
  WebkitUserSelect: 'none',
}

// helpers for row selection/deselection
const selectRows = (rows: Array<Row<TableDataType>>) => {
  for (const row of rows) {
    if (!row.isSelected) {
      row.toggleRowSelected()
    }
  }
}

const deselectRows = (rows: Array<Row<TableDataType>>) => {
  for (const row of rows) {
    if (row.isSelected) {
      row.toggleRowSelected()
    }
  }
}

const iconButtonStyles = {
  position: 'absolute',
  right: '30px',
  left: '5px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  width: '18px',
  height: '18px',

  '&:focus': {
    opacity: 1,
  },
}

const numberCellStyles = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'fg.muted',
  paddingLeft: 3,
}

/**
 * A handle that can be used to drag its containing row up and down in the
 * table view.
 */
function RowDragger({
  column,
  row,
}: Pick<RendererCellProps<TableDataType> | EditorCellProps<TableDataType>, 'column' | 'row'>) {
  const dispatch = useTableDispatch()
  const table = useTableInstance()
  const {selectedFlatRows} = table
  const {navigationDispatch} = useStableTableNavigation()
  const rowMenuShortcutOrigin = useTableRowMenuShortcutOrigin()
  const {postStats} = usePostStats()
  const {contentType} = row.original
  const {rowNumber, setSortActivatorNodeRef, sortListeners} = useContext(RowContext)
  const [menuOpen, setMenuOpen] = useState(false)
  const [repoPickerOpen, setRepoPickerOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const postponeFocusReset = useRef(false)
  const {hasWritePermissions} = ViewerPrivileges()
  const baseRef = useRef<HTMLDivElement | null>(null)
  const numberRef = useRef<HTMLDivElement>(null)
  // ignore clicks on the ActionMenu (action menu doesn't currently support ref)
  const clickTargets = useMemo(() => [baseRef, numberRef], [baseRef, numberRef])
  const {onRowClick: onClick, onRowPointerDown, focusLastRowIndex} = useRowSelection(row, clickTargets)

  // look at row select plugin source for why selecting a subrow selects the parent too
  const selectedRows = useMemo(() => selectedFlatRows.filter(r => isRowSelectedAndActionable(r)), [selectedFlatRows])

  const resetMenuFocus = useCallback(() => {
    if (rowMenuShortcutOrigin) {
      navigationDispatch(createSetFocusStateAction(rowMenuShortcutOrigin))
    }

    dispatch(setRowMenuOpen())
  }, [rowMenuShortcutOrigin, dispatch, navigationDispatch])

  const openMenu = useCallback(() => {
    flushSync(() => {
      navigationDispatch(clearFocus())
      setMenuOpen(true)
    })
  }, [navigationDispatch])

  const closeMenu = useCallback(() => {
    if (!postponeFocusReset.current) {
      resetMenuFocus()
    }

    setMenuOpen(false)
  }, [postponeFocusReset, resetMenuFocus, setMenuOpen])

  const setMenuState = useCallback((state: boolean): void => (state ? openMenu() : closeMenu()), [openMenu, closeMenu])

  const onOpen = useCallback(() => {
    postponeFocusReset.current = true
    const rowIsSelected = selectedRows.findIndex(r => r.id === row.id) !== -1

    // if the current row is already in the selection, just ensure the visual selection stays in sync
    // otherwise select only the current row
    if (rowIsSelected) {
      selectRows(selectedRows)
    } else {
      deselectRows(selectedRows)
      selectRows([row])
    }
  }, [row, selectedRows])

  const onDismiss = useCallback(() => {
    postponeFocusReset.current = false
    closeMenu()
    buttonRef.current?.focus()
  }, [closeMenu])

  const onConfirm = useCallback(
    (removedItemIds: Array<number>) => {
      postponeFocusReset.current = false
      resetMenuFocus()
      dispatch(deselectAllRows())
      focusLastRowIndex(removedItemIds)
    },
    [resetMenuFocus, dispatch, focusLastRowIndex],
  )

  useEffect(() => {
    if (rowMenuShortcutOrigin?.details.y === row.id && contentType !== ItemType.RedactedItem) {
      setMenuState(true)
    }
  }, [row.id, setMenuState, rowMenuShortcutOrigin?.details.y, contentType])

  const {openRemoveConfirmationDialog} = useRemoveMemexItemWithConfirmation(onOpen, onConfirm, onDismiss)
  const {openArchiveConfirmationDialog} = useArchiveMemexItemsWithConfirmation(onOpen, onConfirm, onDismiss)

  const deleteOnClick = useCallback(() => {
    openRemoveConfirmationDialog([row.original.id], TableRowActionMenuUI)
  }, [openRemoveConfirmationDialog, row.original.id])

  const archiveOnClick = useCallback(() => {
    openArchiveConfirmationDialog([row.original.id], TableRowActionMenuUI)
  }, [openArchiveConfirmationDialog, row.original.id])

  const archiveMultipleOnClick = useCallback(() => {
    const selectedRowsAsNumbers = selectedRows.map(r => r.original.id)
    openArchiveConfirmationDialog(selectedRowsAsNumbers, TableRowActionMenuUI)
  }, [openArchiveConfirmationDialog, selectedRows])

  const deleteMultipleOnClick = useCallback(() => {
    const selectedRowsAsNumbers = selectedRows.map(r => r.original.id)
    openRemoveConfirmationDialog(selectedRowsAsNumbers, TableRowActionMenuUI)
  }, [openRemoveConfirmationDialog, selectedRows])

  const isSelected = isRowSelectedAndActionable(row)
  const multipleSelected = isSelected && selectedRows.length > 1
  const isArchivable =
    selectedRows.every(selectedRow => isMemexItemTypeArchivable(selectedRow.original.contentType)) &&
    isMemexItemTypeArchivable(contentType) &&
    hasWritePermissions

  const onRowConvertSuccess = useCallback(() => {
    const itemId = row.original.id
    postStats({
      name: DraftConvert,
      ui: RowDraggerMenuUI,
      memexProjectItemId: itemId,
    })
  }, [postStats, row])

  const cellProps = useMemo<React.HTMLAttributes<HTMLDivElement>>(() => {
    if (contentType === ItemType.RedactedItem || !hasWritePermissions) {
      return {
        style: {...DefaultCellStyle, cursor: 'default'},
        title: 'Reordering this item is disabled',
        onClick,
        // enabling the mousedown event handler for this path to ensure that
        // multiple rows can be selected when the table is sorted
        onPointerDown: undefined,
        ref: baseRef,
      }
    }

    return {
      draggable: true,
      style: DefaultCellStyle,
      onClick,
      ref: (ref: HTMLDivElement | null) => {
        setSortActivatorNodeRef?.(ref)
        baseRef.current = ref
      },
      onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
        onRowPointerDown()

        // invoke dnd-kit pointer down handler
        sortListeners?.onPointerDown?.(event)
      },
    }
  }, [contentType, hasWritePermissions, onClick, setSortActivatorNodeRef, onRowPointerDown, sortListeners])

  if (!isDragDropColumn(column)) {
    return null
  }

  return (
    <BaseCell {...cellProps} sx={{pr: 1}} {...testIdProps('row-dragger')}>
      <Box ref={numberRef} sx={numberCellStyles}>
        {rowNumber}
      </Box>
      {hasWritePermissions && contentType !== ItemType.RedactedItem && (
        <>
          <ActionMenu open={menuOpen} onOpenChange={setMenuState} anchorRef={buttonRef}>
            <ActionMenu.Anchor>
              <IconButton
                ref={buttonRef}
                icon={TriangleDownIcon}
                aria-label="Row actions"
                className="menu-trigger"
                tabIndex={-1}
                block
                sx={iconButtonStyles}
                {...testIdProps('row-menu-trigger')}
              />
            </ActionMenu.Anchor>
            <ActionMenu.Overlay {...testIdProps('row-menu')}>
              <ActionList>
                {!multipleSelected && contentType === ItemType.DraftIssue ? (
                  <ActionList.Item
                    onSelect={() => setRepoPickerOpen(true)}
                    {...testIdProps('row-menu-convert-to-issue')}
                  >
                    <ActionList.LeadingVisual>
                      <IssueOpenedIcon />
                    </ActionList.LeadingVisual>
                    Convert to issue
                  </ActionList.Item>
                ) : null}

                {isArchivable ? (
                  <>
                    {multipleSelected ? (
                      <ActionList.Item onSelect={archiveMultipleOnClick} {...testIdProps('row-menu-archive-multiple')}>
                        <ActionList.LeadingVisual>
                          <ArchiveIcon />
                        </ActionList.LeadingVisual>
                        Archive {selectedRows.length} items
                        <ActionList.TrailingVisual>
                          <EKey />
                        </ActionList.TrailingVisual>
                      </ActionList.Item>
                    ) : (
                      <ActionList.Item onSelect={archiveOnClick} {...testIdProps('row-menu-archive')}>
                        <ActionList.LeadingVisual>
                          <ArchiveIcon />
                        </ActionList.LeadingVisual>
                        Archive
                        <ActionList.TrailingVisual>
                          <EKey />
                        </ActionList.TrailingVisual>
                      </ActionList.Item>
                    )}
                  </>
                ) : null}

                {multipleSelected ? (
                  <ActionList.Item
                    variant="danger"
                    onSelect={deleteMultipleOnClick}
                    {...testIdProps('row-menu-delete-multiple')}
                  >
                    <ActionList.LeadingVisual>
                      <TrashIcon />
                    </ActionList.LeadingVisual>
                    Delete {selectedRows.length} selected items from project
                    <ActionList.TrailingVisual>
                      <DelKey />
                    </ActionList.TrailingVisual>
                  </ActionList.Item>
                ) : (
                  <ActionList.Item variant="danger" onSelect={deleteOnClick} {...testIdProps('row-menu-delete')}>
                    <ActionList.LeadingVisual>
                      <TrashIcon />
                    </ActionList.LeadingVisual>
                    Delete from project
                    <ActionList.TrailingVisual>
                      <DelKey />
                    </ActionList.TrailingVisual>
                  </ActionList.Item>
                )}
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
          <RepoPicker
            anchorRef={baseRef}
            isOpen={repoPickerOpen}
            item={row.original}
            onOpenChange={(isOpen: boolean) => setRepoPickerOpen(isOpen)}
            onSuccess={onRowConvertSuccess}
            {...testIdProps('row-menu-repo-picker')}
          />
        </>
      )}
    </BaseCell>
  )
}

export default memo(RowDragger)
