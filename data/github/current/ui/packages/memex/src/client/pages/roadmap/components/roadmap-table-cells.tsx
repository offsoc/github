import {memo} from 'react'
import type {Cell} from 'react-table'

import {getCellFocusState} from '../../../components/react_table/get-cell-focus-state'
import {useTableNavigation} from '../../../components/react_table/navigation'
import {TableCell} from '../../../components/react_table/table-cell'
import {useIsCellBulkSelected} from '../../../components/react_table/table-cell-bulk-selection'
import type {TableDataType} from '../../../components/react_table/table-data-type'
import type {FocusCellElementType} from '../../../components/react_table/use-item-data'
import {
  ROADMAP_DATE_COLUMN_WIDTH,
  ROADMAP_NUMBER_COLUMN_WIDTH,
  ROADMAP_ROW_HEIGHT,
} from '../../../components/roadmap/constants'
import {ViewerPrivileges} from '../../../helpers/viewer-privileges'
import {useRoadmapSettings} from '../../../hooks/use-roadmap-settings'
import {useRoadmapScrollMargins} from '../hooks/use-roadmap-scroll-margins'
import {RoadmapTableColumnResizeProvider} from './roadmap-table-column-resize-provider'
import {RoadmapTableDragSash} from './roadmap-table-drag-sash'
import {roadmapCellSx, type TestIdentifiersProps} from './roadmap-table-layout'

type RoadmapTitleCellProps = {
  number?: number
  focusCellElement: FocusCellElementType
  cell: Pick<Cell<TableDataType>, 'column' | 'row' | 'render' | 'getCellProps'>
  isLastCell: boolean
}

const tileCellSx = {
  ...roadmapCellSx,
  height: ROADMAP_ROW_HEIGHT,
  position: 'sticky',
  flexGrow: 1,
  left: ROADMAP_NUMBER_COLUMN_WIDTH,
}

export const RoadmapTitleCell = memo(function RoadmapTitleCell({
  number,
  cell,
  focusCellElement,
  isLastCell,
}: RoadmapTitleCellProps & TestIdentifiersProps) {
  const {titleColumnWidth} = useRoadmapSettings()
  const {hasWritePermissions} = ViewerPrivileges()
  const scrollMargins = useRoadmapScrollMargins()

  return (
    <TableCell
      row={cell.row}
      column={cell.column}
      render={cell.render}
      getCellProps={cell.getCellProps}
      // Prefer dragging styles defined in <RoadmapRow /> until we can unify d&d implementations, and substitute row-dragger for RoadmapNumberCell
      isDragging={false}
      focusCellElement={focusCellElement}
      sx={tileCellSx}
      styles={{
        ...scrollMargins,
        maxWidth: titleColumnWidth,
        minWidth: titleColumnWidth,
      }}
      className="roadmap-table-cell"
    >
      {hasWritePermissions && isLastCell && (
        <RoadmapTableColumnResizeProvider>
          <RoadmapTableDragSash id={`RoadmapTableDragSash-${number}`} />
        </RoadmapTableColumnResizeProvider>
      )}
    </TableCell>
  )
})

type RoadmapNumberCellProps = {
  focusCellElement: FocusCellElementType
  cell: Cell<TableDataType>
  isDragging: boolean
}

const numberCellSx = {
  ...roadmapCellSx,
  height: ROADMAP_ROW_HEIGHT,
  position: 'sticky',
  left: '0px',
  flexShrink: 0,
  width: ROADMAP_NUMBER_COLUMN_WIDTH,
  minWidth: ROADMAP_NUMBER_COLUMN_WIDTH,
}

export const RoadmapNumberCell = memo(function RoadmapNumberCell({
  cell,
  focusCellElement,
  isDragging,
}: RoadmapNumberCellProps & TestIdentifiersProps) {
  return (
    <TableCell
      row={cell.row}
      column={cell.column}
      render={cell.render}
      getCellProps={cell.getCellProps}
      isDragging={isDragging}
      focusCellElement={focusCellElement}
      sx={numberCellSx}
      className="roadmap-table-cell"
    />
  )
})

type RoadmapTimeSpanCellsProps = {
  number?: number
  focusCellElement: FocusCellElementType
  startCell: Cell<TableDataType> | undefined
  endCell: Cell<TableDataType> | undefined
}

const dateCellStyles = {
  ...roadmapCellSx,
  height: ROADMAP_ROW_HEIGHT,
  position: 'sticky',
  flexGrow: 1,
  maxWidth: ROADMAP_DATE_COLUMN_WIDTH,
  minWidth: ROADMAP_DATE_COLUMN_WIDTH,
}

export const RoadmapTimeSpanCells = memo(function RoadmapTimeSpanCells({
  number,
  startCell,
  endCell,
  focusCellElement,
}: RoadmapTimeSpanCellsProps & TestIdentifiersProps) {
  const {hasWritePermissions} = ViewerPrivileges()
  const {titleColumnWidth} = useRoadmapSettings()

  const hasEndCell = endCell && startCell !== endCell
  const endDateLeft = startCell ? ROADMAP_DATE_COLUMN_WIDTH : 0

  const {
    state: {focus},
  } = useTableNavigation()

  const {isFocused: isStartCellFocused} = startCell ? getCellFocusState(startCell, focus) : {isFocused: false}
  const {isFocused: isEndCellFocused} = endCell ? getCellFocusState(endCell, focus) : {isFocused: false}
  const isStartBulkSelected = useIsCellBulkSelected(startCell)
  const isEndBulkSelected = useIsCellBulkSelected(endCell)

  return (
    <>
      {startCell && (
        <TableCell
          row={startCell.row}
          column={startCell.column}
          render={startCell.render}
          getCellProps={startCell.getCellProps}
          // Prefer dragging styles defined in <RoadmapRow /> until we can unify d&d implementations, and substitute row-dragger for RoadmapNumberCell
          isDragging={false}
          focusCellElement={focusCellElement}
          sx={dateCellStyles}
          styles={{
            maxWidth: ROADMAP_DATE_COLUMN_WIDTH,
            minWidth: ROADMAP_DATE_COLUMN_WIDTH,
            left: ROADMAP_NUMBER_COLUMN_WIDTH + titleColumnWidth,
          }}
          className="roadmap-table-cell"
        >
          {!hasEndCell && hasWritePermissions && (
            <RoadmapTableColumnResizeProvider>
              {!isStartBulkSelected && !isStartCellFocused && (
                <RoadmapTableDragSash id={`RoadmapTableDragSash-${number}`} />
              )}
            </RoadmapTableColumnResizeProvider>
          )}
        </TableCell>
      )}
      {hasEndCell && (
        <TableCell
          row={endCell.row}
          column={endCell.column}
          render={endCell.render}
          getCellProps={endCell.getCellProps}
          // Prefer dragging styles defined in <RoadmapRow /> until we can unify d&d implementations, and substitute row-dragger for RoadmapNumberCell
          isDragging={false}
          focusCellElement={focusCellElement}
          sx={dateCellStyles}
          styles={{
            maxWidth: ROADMAP_DATE_COLUMN_WIDTH,
            minWidth: ROADMAP_DATE_COLUMN_WIDTH,
            left: ROADMAP_NUMBER_COLUMN_WIDTH + titleColumnWidth + endDateLeft,
          }}
          className="roadmap-table-cell"
        >
          {hasWritePermissions && (
            <RoadmapTableColumnResizeProvider>
              {!isEndBulkSelected && !isEndCellFocused && (
                <RoadmapTableDragSash id={`RoadmapTableDragSash-${number}`} />
              )}
            </RoadmapTableColumnResizeProvider>
          )}
        </TableCell>
      )}
    </>
  )
})
