import {testIdProps} from '@github-ui/test-id-props'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {ValidationErrorPopover} from '@github-ui/validation-error-popover'
import {Box, sx, type SxProp, themeGet} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {clsx} from 'clsx'
import {memo, useMemo} from 'react'
import type {Cell} from 'react-table'
import styled from 'styled-components'

import {SystemColumnId} from '../../api/columns/contracts/memex-column'
import {ItemType} from '../../api/memex-items/item-type'
import {bulkColumnImmutable, columnEditable} from '../../helpers/column-editable'
import {ViewerPrivileges} from '../../helpers/viewer-privileges'
import {useDragToFill} from './bulk-fill-values'
import {useCellValidationMessage} from './cell-validation'
import {isAddColumn, isDragDropColumn} from './column-ids'
import {getCellFocusState} from './get-cell-focus-state'
import {useCopyPaste} from './hooks/use-copy-paste'
import {useTableNavigation} from './navigation'
import {
  useAreCellsBulkSelected,
  useIsCellBulkSelected,
  useTableCellBulkSelectionActions,
  useTableCellBulkSelectionData,
} from './table-cell-bulk-selection'
import type {TableDataType} from './table-data-type'
import {cellTestId} from './test-identifiers'
import type {FocusCellElementType} from './use-item-data'
import {useTableFocusCell} from './use-table-focus-cell'

type Props = Pick<Cell<TableDataType>, 'row' | 'column' | 'getCellProps' | 'render'> & {
  focusCellElement: FocusCellElementType
  isDragging: boolean
  styles?: React.CSSProperties
  sx?: BetterSystemStyleObject
  className?: string
  children?: React.ReactNode
}

export function TableCell({row, column, ...props}: Props) {
  const cell = useMemo(() => ({column, row}), [column, row])
  const {
    state: {focus},
  } = useTableNavigation()
  const {isFocused, isEditing, isSuspended, replaceContents} = getCellFocusState(cell, focus)

  return (
    <InnerTableCell
      {...props}
      cell={cell}
      isFocused={isFocused}
      isEditing={isEditing}
      isSuspended={isSuspended}
      replaceContents={replaceContents}
    />
  )
}

const InnerTableCell = memo(function InnerTableCell({
  focusCellElement,
  isDragging,
  styles,
  children,
  getCellProps,
  render,
  cell,
  className: classNameProp,
  sx: sxProp,
  isFocused,
  isEditing,
  isSuspended,
  replaceContents,
}: Omit<Props, 'row' | 'column'> & {cell: Pick<Props, 'row' | 'column'>} & ReturnType<typeof getCellFocusState>) {
  const {isReadonly, hasWritePermissions} = ViewerPrivileges()
  const tableHasBulkSelection = useAreCellsBulkSelected()
  const bulkSelection = useTableCellBulkSelectionData()
  const bulkActions = useTableCellBulkSelectionActions()

  const {columnModel} = cell.column
  const columnId = columnModel ? columnModel.id : cell.column.id
  const {validationMessage, validationMessageId} = useCellValidationMessage(cell.row.id, columnId)

  const dragToFill = useDragToFill(cell)

  // Only allow dropping into edit mode if the column is editable for the current row
  const editable = useMemo(() => {
    return (
      cell.column.columnModel &&
      columnEditable(cell.row.original.contentType, cell.column.columnModel.dataType) &&
      hasWritePermissions
    )
  }, [cell.column.columnModel, cell.row.original.contentType, hasWritePermissions])

  const isDisabled = useMemo(() => {
    // For logged-out or read-only users,
    // the title of non-redacted items should not be disabled.
    if (isReadonly && cell.column.id === SystemColumnId.Title) {
      return cell.row.original.contentType === ItemType.RedactedItem
    }

    return !editable
  }, [cell.column.id, cell.row.original.contentType, editable, isReadonly])

  const isBulkColumnImmutable = useMemo(
    () => cell.column.columnModel && bulkColumnImmutable(cell.column.columnModel.dataType),
    [cell.column.columnModel],
  )

  const shouldShowBulkFillHandle = () =>
    isFocused && bulkActions !== null && !isBulkColumnImmutable && !isDisabled && !tableHasBulkSelection

  const {wrapperProps, contentsProps} = useTableFocusCell(
    cell,
    isFocused,
    isEditing,
    editable,
    isDisabled,
    replaceContents,
  )
  const isBulkSelected = useIsCellBulkSelected(cell)
  const isInvalid = isFocused && isEditing && !!validationMessage
  const {isCellCopySource} = useCopyPaste()

  useLayoutEffect(() => {
    const cellElement = wrapperProps.ref.current // Only focus on the cell ref if we're not editing (since we focus the

    if (!cellElement || !isFocused || isEditing) return

    // cell value input elsewhere), we're not already active, or we don't
    // contain the active element (which would be the cell value input).
    if (!isEditing) {
      focusCellElement(cellElement, cell.column.id, {isSuspended})
    }
  }, [isEditing, wrapperProps.ref, focusCellElement, isSuspended, cell.column.id, isFocused])

  const isDragDrop = isDragDropColumn(cell.column)

  const className = clsx(
    {
      hoverable: !isDragging,
      'is-focused': isFocused && !isDragDrop,
      'is-selected': isBulkSelected,
      'is-disabled-selected':
        isBulkSelected && (isDisabled || isBulkColumnImmutable || bulkSelection.isMaximumExceeded),
      'is-copy-source': dragToFill?.isFillSourceCell || isCellCopySource(cell),
      'is-editing': isEditing,
      'is-invalid': isInvalid,
      draggable: isDragDrop,
      'is-dragging': isDragging,
      'cursor-not-allowed': isReadonly ? false : !editable,
      'is-first-row': cell.row.index === 0,
    },
    classNameProp,
  )

  const flexGrow = isAddColumn(cell.column) ? 1 : 'unset'
  const cellProps = getCellProps({
    style: useMemo(
      () => ({
        flexGrow,
        overflowX: isDragDrop ? 'visible' : 'unset',
        whiteSpace: 'nowrap',
        minWidth: cell.column.width,
        ...styles,
      }),
      [cell.column.width, flexGrow, isDragDrop, styles],
    ),
    className,
    role: 'gridcell',
  })

  return (
    <StyledTableCell
      aria-selected={isBulkSelected && !isDisabled}
      {...wrapperProps}
      {...cellProps}
      key={cellProps.key}
      {...testIdProps(cellTestId(cell.row.index, cell.column.columnModel?.name || cell.column.id))}
      sx={sxProp}
      data-test-cell-is-focused={isFocused || undefined}
      data-test-cell-is-editing={isEditing || undefined}
      data-test-cell-is-suspended={isSuspended || undefined}
    >
      {render(isEditing ? 'CellEditor' : 'Cell', contentsProps)}
      {validationMessageId && <ValidationErrorPopover id={validationMessageId} message={validationMessage} />}
      {children}
      {dragToFill && (shouldShowBulkFillHandle() || dragToFill.isFillLastCell) && (
        <FillerHandle
          onMouseDown={dragToFill.onFillHandleMousedown}
          onDoubleClick={dragToFill.onFillHandleDoubleClick}
        />
      )}
    </StyledTableCell>
  )
})

TableCell.displayName = 'TableCell'

export const StyledTableCell = styled.div<SxProp>`
  scroll-margin-top: 35px; /* Account for sticky header */
  scroll-margin-bottom: 64px; /* Account for sticky footer */
  cursor: default;
  border-left: 1px solid ${themeGet('colors.border.muted')};
  border-bottom: 1px solid ${themeGet('colors.border.muted')};
  outline: none;

  &:first-of-type {
    border-left: 0;
  }

  &:nth-of-type(2) {
    border-left: 0;
  }

  &:last-child {
    border-right: 0;
  }

  .row-highlight &.hoverable:hover {
    background-color: unset;
  }

  &.is-selected {
    position: relative;
    overflow-x: visible !important;
    overflow-y: visible;
    background-color: ${themeGet('colors.accent.subtle')};

    ::before {
      content: '';
      position: absolute;
      width: calc(100%);
      height: calc(100%);
      border: 1px solid ${themeGet('colors.accent.emphasis')};
      /* stylelint-disable-next-line primer/spacing */
      left: -1px;
      /* stylelint-disable-next-line primer/spacing */
      top: -1px;
      z-index: 0;
      pointer-events: none;
    }
  }

  &.is-focused,
  &.is-copy-source {
    position: relative;
    overflow-x: visible !important;
    overflow-y: visible;

    ::before {
      content: '';
      position: absolute;
      width: calc(100% - 2px);
      height: calc(100% - 2px);
      /* stylelint-disable-next-line primer/borders */
      border-radius: 2px;
      /* stylelint-disable-next-line primer/spacing */
      left: -1px;
      /* stylelint-disable-next-line primer/spacing */
      top: -1px;
      z-index: 0;
      pointer-events: none;
      border-width: var(--borderWidth-thick);
      border-color: ${themeGet('colors.accent.emphasis')};
    }
  }

  &.is-focused::before {
    border-style: solid;
    box-shadow:
      inset -3px 0 0 0 ${themeGet('colors.canvas.default')},
      inset 0 -3px 0 0 ${themeGet('colors.canvas.default')},
      inset 3px 0 0 0 ${themeGet('colors.canvas.default')},
      inset 0 3px 0 0 ${themeGet('colors.canvas.default')},
      ${themeGet('shadows.shadow.medium')};
  }

  &.is-copy-source::before {
    border-style: dotted;
  }

  &.is-copy-source.is-focused::before {
    border-style: dashed;
  }

  &.is-focused.is-first-row {
    ::before {
      /* stylelint-disable-next-line primer/spacing */
      top: 0px;
      height: calc(100% - 3px);
    }
  }

  &.is-focused.is-editing {
    background-color: ${themeGet('colors.canvas.default')};
    ::before {
      box-shadow:
        inset -3px 0 0 0 ${themeGet('colors.canvas.default')},
        inset 0 -3px 0 0 ${themeGet('colors.canvas.default')},
        inset 3px 0 0 0 ${themeGet('colors.canvas.default')},
        inset 0 3px 0 0 ${themeGet('colors.canvas.default')},
        ${themeGet('shadows.shadow.medium')};
    }

    ::after {
      display: none;
    }
  }

  &.is-focused.is-invalid {
    ::before {
      border-color: ${themeGet('colors.danger.fg')};
    }
  }

  &.is-focused.cursor-not-allowed::before {
    border-color: ${themeGet('colors.fg.subtle')};
    box-shadow: none;
  }

  &.cursor-not-allowed {
    cursor: not-allowed;
  }

  &.is-disabled-selected {
    ::before {
      border-color: ${themeGet('colors.fg.subtle')};
    }
  }

  &.draggable {
    cursor: grab;
    user-select: none;
  }

  &.draggable:active,
  &.is-dragging {
    cursor: grabbing;
    user-select: none;
  }

  .reveal-link-icon {
    visibility: hidden;
  }

  &:hover .reveal-link-icon {
    visibility: visible;
  }

  ${sx}
`

const FillerHandle = memo(
  ({onMouseDown, onDoubleClick}: {onMouseDown: React.MouseEventHandler; onDoubleClick: React.MouseEventHandler}) => {
    const size = 12
    return (
      // We hide this from screen readers because there's just no good way to interact with this via the keyboard.
      // Instead we offer the Meta + D shortcut which does the same thing but requires selecting cells first.
      <Box
        aria-hidden
        onMouseDown={onMouseDown}
        onDoubleClick={onDoubleClick}
        onClick={e => e.stopPropagation()}
        sx={{
          position: 'absolute',
          bg: 'accent.emphasis',
          cursor: 'crosshair',
          border: '1px solid',
          borderColor: 'fg.onEmphasis',
          borderRadius: '2px',
          boxSizing: 'border-box',
          height: `${size}px`,
          width: `${size}px`,
          bottom: `-${size / 2}px`,
          right: `-${size / 2}px`,
          boxShadow: 'shadow.medium',
          // without z-index, the handle will appear over other cells but not be interactable outside of the boundary of the parent cell
          zIndex: 2,
        }}
        {...testIdProps('table-cell-fill-handle')}
      />
    )
  },
)
FillerHandle.displayName = 'FillerHandle'
