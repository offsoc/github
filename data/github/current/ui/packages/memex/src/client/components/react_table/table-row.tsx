import type {useSortable} from '@github-ui/drag-and-drop'
import {testIdProps} from '@github-ui/test-id-props'
import {sx, themeGet} from '@primer/react'
import {clsx} from 'clsx'
import {createContext, memo, useMemo} from 'react'
import type {Row} from 'react-table'
import styled from 'styled-components'

import {getHovercardSubjectTag} from '../../models/memex-item-model'
import {CELL_HEIGHT} from './constants'
import {useReorderableRow} from './row-reordering/reorderable-rows'
import {TableCell} from './table-cell'
import type {TableDataType} from './table-data-type'
import {useTableInstance, useTableSelectedRowIds} from './table-provider'
import {rowTestId} from './test-identifiers'
import type {ItemDataType} from './use-item-data'
import {getSelectionInfo, isRowActionable} from './use-row-selection'

export type TableRowProps = {
  row: Row<TableDataType>
  index: number
  data: ItemDataType
}

export const StyledTableRow = styled.div`
  display: flex;
  background-color: ${themeGet('colors.canvas.default')};

  &.row-highlight {
    position: relative;
    background-color: ${themeGet('colors.accent.subtle')};
    box-shadow: 0 0 0 1px ${themeGet('colors.accent.emphasis')};

    > * {
      border-bottom: transparent;
    }
  }

  &.row-selected {
    position: relative;
    background-color: ${themeGet('colors.accent.subtle')};

    &.selection-top-edge {
      box-shadow: 0 -1px 0 0 ${themeGet('colors.accent.emphasis')};

      &.selection-bottom-edge {
        box-shadow: 0 0 0 1px ${themeGet('colors.accent.emphasis')};
      }
    }

    &.selection-bottom-edge {
      box-shadow: 0 1px 0 0 ${themeGet('colors.accent.emphasis')};
    }
  }

  &.hoverable:not(.is-focused):hover {
    background-color: ${themeGet('colors.canvas.subtle')};

    .table-row-dropdown-caret {
      opacity: 1;
    }
  }

  &.hoverable:hover .menu-trigger,
  &.hoverable:focus .menu-trigger {
    opacity: 1;
  }

  ${sx}
`

interface RowContext {
  rowNumber: number
  setSortActivatorNodeRef?: (node: HTMLElement | null) => void
  sortListeners?: ReturnType<typeof useSortable>['listeners']
}

export const RowContext = createContext<RowContext>({rowNumber: 0})

export const tableRowStyle = {height: `${CELL_HEIGHT}px`, width: '100%', flexShrink: 0}

export const TableRow = memo((props: TableRowProps) => {
  const {flatRows, groupedRows} = useTableInstance()
  const selectedRowIds = useTableSelectedRowIds()

  props.data.prepareRow(props.row)

  const {setNodeRef, setActivatorNodeRef, listeners, isSorting, isDragging, isDropped} = useReorderableRow(props.row)

  // Because the row reference provided to TableRow does not change when a row is selected, bringing in the stateful
  // `useTableSelectedRowIds` from table state ensures that rows and their children render with the correct selection
  // state.
  const isSelected = Boolean(selectedRowIds?.[props.row.id]) && isRowActionable(props.row)
  const {beforeSelected, afterSelected, firstInGroup, lastInGroup} = getSelectionInfo(props.row, flatRows, groupedRows)
  const className = clsx({
    hoverable: !isSorting,
    'row-selected': isSelected,
    'row-highlight': isDragging || isDropped,
    'selection-top-edge': isSelected && (!beforeSelected || firstInGroup),
    'selection-bottom-edge': isSelected && (!afterSelected || lastInGroup),
  })

  const context = useMemo(
    () => ({
      rowNumber: props.index + 1,
      setSortActivatorNodeRef: setActivatorNodeRef,
      sortListeners: listeners,
    }),
    [props.index, setActivatorNodeRef, listeners],
  )

  const rowProps = props.row.getRowProps({className})
  return (
    <RowContext.Provider value={context}>
      <StyledTableRow
        {...rowProps}
        key={rowProps.key}
        {...testIdProps(rowTestId(props.row.index))}
        style={tableRowStyle}
        data-test-row-is-selected={isSelected}
        data-hovercard-subject-tag={getHovercardSubjectTag(props.row.original)}
        ref={setNodeRef}
      >
        {props.row.cells.map(cell => {
          return (
            <TableCell
              row={cell.row}
              column={cell.column}
              render={cell.render}
              getCellProps={cell.getCellProps}
              key={cell.column.id}
              focusCellElement={props.data.focusCellElement}
              isDragging={isSorting}
            />
          )
        })}
      </StyledTableRow>
    </RowContext.Provider>
  )
})

TableRow.displayName = 'TableRow'
