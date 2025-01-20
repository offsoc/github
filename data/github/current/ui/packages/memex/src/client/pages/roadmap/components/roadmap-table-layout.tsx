import {Box} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {clsx} from 'clsx'
import {forwardRef, type HTMLAttributes, memo, type RefObject} from 'react'
import type {Row} from 'react-table'

import type {TableDataType} from '../../../components/react_table/table-data-type'
import {useTableInstance, useTableSelectedRowIds} from '../../../components/react_table/table-provider'
import {getSelectionInfo, isRowActionable} from '../../../components/react_table/use-row-selection'
import {ROADMAP_ROW_HEIGHT} from '../../../components/roadmap/constants'
import {useRoadmapTableWidth} from '../../../hooks/use-roadmap-settings'
import {useRoadmapScrollMargins} from '../hooks/use-roadmap-scroll-margins'
import {ROADMAP_CELL_Z_INDEX, ROADMAP_HIGHLIGHT_ROW_Z_INDEX, ROADMAP_ROW_HOVER_Z_INDEX} from '../roadmap-z-index'

export type TestIdentifiersProps = {
  'data-testid'?: string
}

export function RoadmapCellContent({children, sx}: {children: React.ReactNode; sx?: BetterSystemStyleObject}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        padding: '12px',
        position: 'relative',
        height: `${ROADMAP_ROW_HEIGHT}px`,
        borderBottom: '1px solid',
        borderColor: 'border.muted',
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}

type RoadmapCellProps = {
  ref?: RefObject<HTMLDivElement>
  children: React.ReactNode
  role?: string
  style?: React.CSSProperties
  sx?: BetterSystemStyleObject
  className?: string
} & TestIdentifiersProps

export const roadmapCellSx = {cursor: 'default', backgroundColor: 'canvas.default', zIndex: ROADMAP_CELL_Z_INDEX}

export const RoadmapCell = memo(
  forwardRef<HTMLDivElement, RoadmapCellProps>(function RoadmapCell(props, ref?) {
    const {children, sx, role = 'gridcell', style, ...other} = props

    return (
      <Box
        ref={ref}
        role={role}
        sx={{
          ...roadmapCellSx,
          ...sx,
        }}
        style={style}
        {...other}
      >
        {children}
      </Box>
    )
  }),
)

export const roadmapRowSx: BetterSystemStyleObject = {
  display: 'flex',
  height: `${ROADMAP_ROW_HEIGHT}px`,
  alignItems: 'center',

  // Only override z-index on rows for roadmap tooltips, otherwise overflowed cell focus states are obscured
  'body.roadmap-date-tooltip-visible:not(.is-dragging) &.roadmap-row:hover': {
    zIndex: ROADMAP_ROW_HOVER_Z_INDEX,
  },

  'body:not(.is-dragging) &.roadmap-row:hover, &.pill-drag': {
    '& .roadmap-table-cell': {
      backgroundColor: 'canvas.subtle',
      '&:before': {
        backgroundColor: 'canvas.subtle',
      },
    },
    '& .roadmap-pill:not(.is-focused)': {
      border: '1px solid',
      borderColor: 'fg.muted',
      borderRadius: 1,
    },
    '& .menu-trigger': {
      opacity: 1,
    },

    '&.row-highlight': {
      zIndex: ROADMAP_HIGHLIGHT_ROW_Z_INDEX,
    },
  },

  '&.roadmap-row.row-highlight:not(.row-selected)': {
    '& .roadmap-table-cell, & .roadmap-table-cell:hover': {
      boxShadow: (theme: FixMeTheme) =>
        `0 -1px 0 0 ${theme.colors.accent.emphasis}, 0 1px 0 0 ${theme.colors.accent.emphasis}`,
    },
  },

  '&.roadmap-row.row-highlight, &.roadmap-row.row-selected': {
    zIndex: ROADMAP_HIGHLIGHT_ROW_Z_INDEX,

    '& .roadmap-table-cell, & .roadmap-table-cell:hover': {
      backgroundColor: 'canvas.default',

      // use pseudo-element for dark theme where emphasis has transparency.
      // Prevents roadmap backdrop from showing through
      '&:before': {
        zIndex: -1,
        content: '""',
        position: 'absolute',
        backgroundColor: (theme: FixMeTheme) => `${theme.colors.accent.subtle}`,
      },

      ':not(.is-focused):before': {
        inset: 0,
      },
    },

    '&.selection-top-edge .roadmap-table-cell': {
      boxShadow: (theme: FixMeTheme) => `0 -1px 0 0 ${theme.colors.accent.emphasis}`,
    },

    '&.selection-bottom-edge .roadmap-table-cell': {
      boxShadow: (theme: FixMeTheme) => `0 1px 0 0 ${theme.colors.accent.emphasis}`,
    },

    '&.selection-top-edge.selection-bottom-edge .roadmap-table-cell': {
      boxShadow: (theme: FixMeTheme) =>
        `0 -1px 0 0 ${theme.colors.accent.emphasis}, 0 1px 0 0 ${theme.colors.accent.emphasis}`,
    },
  },

  '& .roadmap-table-cell.is-focused': {
    zIndex: ROADMAP_HIGHLIGHT_ROW_Z_INDEX,
    position: 'sticky',

    '& .roadmap-drag-sash:after': {
      borderColor: 'transparent',
    },
  },

  '& .roadmap-table-cell.is-selected, .roadmap-table-cell.is-copy-source': {
    zIndex: ROADMAP_HIGHLIGHT_ROW_Z_INDEX,
    position: 'sticky',
  },

  '& .roadmap-table-cell.is-selected': {
    backgroundColor: 'canvas.default',
    '&:before': {
      backgroundColor: (theme: FixMeTheme) => `${theme.colors.accent.subtle}`,
    },
  },

  '& .roadmap-table-cell': {
    userSelect: 'none',
  },
}

export const rowGroupSx: BetterSystemStyleObject = {
  boxShadow: 'shadow.medium',

  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderBottom: '1px solid',
    borderBottomColor: 'border.default',
    zIndex: -1,
  },
}

type RoadmapRowProps = {
  row?: Row<TableDataType>
  ref?: RefObject<HTMLDivElement>
  children?: React.ReactNode
  isSelected?: boolean
  isDraggingPill?: boolean
  isHighlighted?: boolean
} & TestIdentifiersProps &
  HTMLAttributes<HTMLDivElement>

export const RoadmapRow = forwardRef<HTMLDivElement, RoadmapRowProps>(function RoadmapRow(
  {row, children, isDraggingPill, isHighlighted, ...props},
  ref?,
) {
  const {flatRows, groupedRows} = useTableInstance()
  const selectedRowIds = useTableSelectedRowIds()
  const selectionInfo = row ? getSelectionInfo(row, flatRows, groupedRows) : null
  const isSelected = row && Boolean(selectedRowIds?.[row.id]) && isRowActionable(row)

  const tableWidth = useRoadmapTableWidth()
  const className = clsx('roadmap-row', {
    'row-highlight': isHighlighted,
    'row-selected': isSelected,
    'selection-top-edge': isSelected && selectionInfo && (!selectionInfo.beforeSelected || selectionInfo.firstInGroup),
    'selection-bottom-edge': isSelected && selectionInfo && (!selectionInfo.afterSelected || selectionInfo.lastInGroup),
    'pill-drag': isDraggingPill,
  })
  const scrollMargins = useRoadmapScrollMargins()

  return (
    <Box
      ref={ref}
      role="row"
      className={className}
      sx={roadmapRowSx}
      style={{...scrollMargins, marginLeft: `-${tableWidth}px`}}
      data-test-row-is-selected={isSelected}
      {...props}
    >
      {children}
    </Box>
  )
})
