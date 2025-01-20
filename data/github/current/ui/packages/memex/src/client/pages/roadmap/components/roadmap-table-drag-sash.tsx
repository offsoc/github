import {useDraggable} from '@github-ui/drag-and-drop'
import {usePortalTooltip} from '@github-ui/portal-tooltip/use-portal-tooltip'
import {testIdProps} from '@github-ui/test-id-props'
import {UnfoldIcon} from '@primer/octicons-react'
import {Box} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {memo, useCallback, useRef} from 'react'

import {useClearTableFocus} from '../../../components/react_table/hooks/use-clear-table-focus'
import {
  ROADMAP_NUMBER_COLUMN_WIDTH,
  ROADMAP_TITLE_COLUMN_MAX_WIDTH,
  ROADMAP_TITLE_COLUMN_MIN_WIDTH,
} from '../../../components/roadmap/constants'
import {useRoadmapTableWidth, useRoadmapTotalFixedColumnWidth} from '../../../hooks/use-roadmap-settings'
import {RoadmapResources} from '../../../strings'
import {ROADMAP_CELL_Z_INDEX} from '../roadmap-z-index'
import {ROADMAP_TABLE_EXPANDING_CLASS} from './roadmap-table-column-resize-provider'

export const DRAG_HANDLE_WIDTH = 16
export const DRAG_HANDLE_HALF_WIDTH = DRAG_HANDLE_WIDTH / 2

const minWidth = ROADMAP_TITLE_COLUMN_MIN_WIDTH + ROADMAP_NUMBER_COLUMN_WIDTH
const maxWidth = ROADMAP_TITLE_COLUMN_MAX_WIDTH + ROADMAP_NUMBER_COLUMN_WIDTH

const tableDragStyles: BetterSystemStyleObject = {
  cursor: 'col-resize',
  paddingLeft: `${DRAG_HANDLE_HALF_WIDTH}px`,
  position: 'absolute',
  top: 0,
  right: `-${DRAG_HANDLE_HALF_WIDTH}px`,
  width: `${DRAG_HANDLE_WIDTH}px`,
  height: '100%',
  zIndex: ROADMAP_CELL_Z_INDEX + 1,
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '-1px',
    right: '8px',
    bottom: '-1px',
    borderRight: '1px solid',
    borderColor: 'border.muted',
  },
  [`body.${ROADMAP_TABLE_EXPANDING_CLASS} &`]: {
    '&::after': {
      borderRightColor: 'accent.fg',
    },
  },
}

/**
 * This is a major workaround to account for the fact that drag handles are currently nested
 * inside of table cells, which contain event listeners for click, mousedown, and focus that can
 * put the cell into various undesirable while dragging.
 *
 * After resize handles are moved outside of table cells, this can be removed.
 */
const onClick = (e: React.MouseEvent) => {
  e.stopPropagation()
  e.preventDefault()
}

const onMouseDown = (e: React.MouseEvent) => {
  e.stopPropagation()
  e.preventDefault()
}

const onFocus = (e: React.FocusEvent) => {
  e.stopPropagation()
  e.preventDefault()
}

export const RoadmapTableDragSash = memo(function RoadmapTableDragSash({id}: {id: string}) {
  const tableWidth = useRoadmapTableWidth()
  const totalFixedColumnsWidth = useRoadmapTotalFixedColumnWidth()
  const {attributes, listeners, setNodeRef} = useDraggable({
    id,
    attributes: {
      role: 'separator',
      tabIndex: -1,
    },
  })

  return (
    // eslint-disable-next-line github/a11y-role-supports-aria-props
    <Box
      sx={tableDragStyles}
      className="roadmap-drag-sash"
      ref={setNodeRef}
      aria-label={RoadmapResources.dragSashAriaLabel}
      aria-valuenow={tableWidth + ROADMAP_NUMBER_COLUMN_WIDTH}
      aria-valuemin={minWidth + totalFixedColumnsWidth}
      aria-valuemax={maxWidth + totalFixedColumnsWidth}
      aria-orientation="vertical"
      {...listeners}
      onClick={onClick}
      onFocus={onFocus}
      onMouseDown={onMouseDown}
      {...attributes}
      {...testIdProps('roadmap-table-drag-sash')}
    />
  )
})

const tableHeaderDragStyles: BetterSystemStyleObject = {
  cursor: 'col-resize',
  display: 'flex',
  position: 'sticky',
  width: `${DRAG_HANDLE_WIDTH + 2}px`,
  height: `32px`,
  zIndex: ROADMAP_CELL_Z_INDEX + 1,
  alignItems: 'center',
  top: `-32px`,
  justifyContent: 'center',
  '& > svg': {
    backgroundColor: 'canvas.default',
    transform: 'rotate(90deg)',
  },
  [`&:hover, &:focus-visible, .${ROADMAP_TABLE_EXPANDING_CLASS} &`]: {
    '& > svg': {
      color: 'accent.fg',
    },
  },
}

const HALF_DRAG_HANDLE_WIDTH = 0.5 * DRAG_HANDLE_WIDTH
export const RoadmapTableHeaderDragSash = memo(function RoadmapHeaderDragIcon({id}: {id: string}) {
  const tableWidth = useRoadmapTableWidth()
  const totalFixedColumnsWidth = useRoadmapTotalFixedColumnWidth()
  const clearTableFocus = useClearTableFocus()

  const {attributes, listeners, setNodeRef} = useDraggable({
    id,
    attributes: {
      role: 'separator',
    },
  })
  const contentRef = useRef<HTMLDivElement | null>(null)

  const [contentProps, tooltip] = usePortalTooltip({
    contentRef,
    'aria-label': RoadmapResources.dragSashAriaLabel,
  })
  return (
    // eslint-disable-next-line github/a11y-role-supports-aria-props
    <Box
      sx={tableHeaderDragStyles}
      ref={node => {
        contentRef.current = node
        setNodeRef(node)
      }}
      style={{
        left: tableWidth - HALF_DRAG_HANDLE_WIDTH - 1,
      }}
      aria-label={RoadmapResources.dragSashAriaLabel}
      aria-valuenow={tableWidth + ROADMAP_NUMBER_COLUMN_WIDTH}
      aria-valuemin={minWidth + totalFixedColumnsWidth}
      aria-valuemax={maxWidth + totalFixedColumnsWidth}
      aria-orientation="vertical"
      {...listeners}
      {...attributes}
      {...contentProps}
      {...testIdProps('roadmap-table-drag-sash')}
      onFocus={useCallback(() => {
        contentProps.onFocus()
        clearTableFocus()
      }, [clearTableFocus, contentProps])}
    >
      <UnfoldIcon />
      {tooltip}
    </Box>
  )
})
