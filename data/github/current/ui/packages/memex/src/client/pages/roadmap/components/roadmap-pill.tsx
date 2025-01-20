import {usePortalTooltip} from '@github-ui/portal-tooltip/use-portal-tooltip'
import {testIdProps} from '@github-ui/test-id-props'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {Box, type BoxProps, Label, Link, Text, Tooltip, Truncate, useTheme} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {clsx} from 'clsx'
import {addDays} from 'date-fns'
import {forwardRef, memo, useRef, useState} from 'react'

import type {TitleValueWithContentType} from '../../../api/columns/contracts/storage'
import type {User} from '../../../api/common-contracts'
import useIsVisible from '../../../components/board/hooks/use-is-visible'
import {AssigneeStack} from '../../../components/common/assignee-stack'
import {MemexItemIcon} from '../../../components/common/memex-item-icon'
import {SanitizedHtml} from '../../../components/dom/sanitized-html'
import {useClearTableFocus} from '../../../components/react_table/hooks/use-clear-table-focus'
import {ROADMAP_PILL_HEIGHT} from '../../../components/roadmap/constants'
import {useUserSettings} from '../../../components/user-settings'
import {formatISODateString} from '../../../helpers/parsing'
import type {TimeSpan} from '../../../helpers/roadmap-helpers'
import useBodyClass from '../../../hooks/use-body-class'
import {useRoadmapTableWidth} from '../../../hooks/use-roadmap-settings'
import type {ColumnValue} from '../../../models/column-value'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {RoadmapResources} from '../../../strings'
import {getSortedDates} from '../date-utils'
import type {MouseState} from '../hooks/use-mouse-state'
import type {
  RoadmapDndOperation,
  RoadmapDragAndDropOperations,
  useRoadmapDragAndDrop,
} from '../hooks/use-roadmap-drag-and-drop'
import {PillAreaFocusType, useRoadmapPillAreaFocus} from '../hooks/use-roadmap-pill-area-focus'
import {useRoadmapGetViewport, useRoadmapView} from '../roadmap-view-provider'
import {
  ROADMAP_PILL_ASSIGNEE_TOOLTIP_INDEX,
  ROADMAP_PILL_DRAG_HANDLE_Z_INDEX,
  ROADMAP_PILL_Z_INDEX,
} from '../roadmap-z-index'
import {getTooltipText} from '../tooltip-helper'
import {NavigationArrowWithFocusContext} from './roadmap-pill-buttons'
import {RoadmapCell} from './roadmap-table-layout'

// Title max width is used to prevent titles that spill out of the pill from also spilling outside the roadmap range
const PILL_PADDING = 8
const PILL_STICKY_MARGIN = 8
const PILL_BORDER_RADIUS = 5

const titleStyles: BetterSystemStyleObject = {
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
}

const titleLinkStyles: BetterSystemStyleObject = {
  color: 'fg.muted',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  textDecoration: 'none',
}

const pillBackgroundStyles: BetterSystemStyleObject = {
  flexShrink: 0,
  left: 0,
  height: ROADMAP_PILL_HEIGHT,
  backgroundColor: 'canvas.default',
  boxShadow: 'shadow.medium',
  borderColor: 'border.default',
  padding: `0 ${PILL_PADDING}px`,
  borderRadius: `${PILL_BORDER_RADIUS}px`,
}

const pillBackgroundRightStyles: BetterSystemStyleObject = {
  position: 'absolute',
  right: '0',
  width: '1px',
  height: '16px',
  backgroundColor: 'canvas.subtle',
}

const pillStyles: BetterSystemStyleObject = {
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  lineHeight: 1.5,
  left: 0,
  height: ROADMAP_PILL_HEIGHT,
  fontSize: '14px',
  fontWeight: 'normal',
  backgroundColor: 'transparent',
  padding: `0 ${PILL_PADDING}px`,
  borderColor: 'transparent',
  borderRadius: 1,
  cursor: 'default',
}

const pillDragStyles: BetterSystemStyleObject = {
  ...pillStyles,
  cursor: 'grab',
}

const targetPillStyles: BetterSystemStyleObject = {
  position: 'absolute',
  height: ROADMAP_PILL_HEIGHT,
  backgroundColor: 'accent.muted',
  borderStyle: 'dotted',
  borderWidth: '1px',
  borderColor: 'accent.muted',
  borderRadius: 1,
  opacity: 0.5,
}

const roadmapMainTooltipStyles: BetterSystemStyleObject = {
  position: 'absolute',
  left: 0,
  right: 0,
  height: '100%',
  // do not show non-active drag handle on hover while dragging
  'body.is-dragging &:hover': {
    ' &:not(.active)': {
      backgroundColor: 'transparent',
      '&::after, &::before': {
        opacity: 0,
        display: 'none',
      },
    },
  },
}

const roadmapMainTooltipHiddenStyles = {
  ...roadmapMainTooltipStyles,
  display: 'none',
}

const ROADMAP_ITEM_GRAB_HANDLE_WIDTH = 21
const ROADMAP_ITEM_GRAB_HANDLE_HEIGHT = 21

const roadmapItemGrabHandleStyles: BetterSystemStyleObject = {
  width: ROADMAP_ITEM_GRAB_HANDLE_WIDTH,
  height: ROADMAP_ITEM_GRAB_HANDLE_HEIGHT,
  cursor: 'col-resize',
  position: 'absolute',
  zIndex: ROADMAP_PILL_DRAG_HANDLE_Z_INDEX,
  '& .roadmap-item-drag-handle': {
    content: '""',
    width: '3px',
    height: ROADMAP_ITEM_GRAB_HANDLE_HEIGHT,
    backgroundColor: 'transparent',
    boxShadow: 'none',
    borderRadius: '2px',
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    bottom: 0,
    '&.active': {
      backgroundColor: 'fg.default',
      borderColor: 'black',
      borderWidth: 1,
      borderStyle: 'solid',
      boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    },
  },
  '&.expand-trailing': {
    left: '100%',
    '& .roadmap-item-drag-handle': {
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },
  },
  '&.expand-leading': {
    right: '100%',
    '& .roadmap-item-drag-handle': {
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },
  },
  '&:hover': {
    '& .roadmap-item-drag-handle': {
      backgroundColor: 'fg.subtle',
      '&.active': {
        backgroundColor: 'fg.default',
        borderColor: 'black',
      },
    },
  },
  // do not show non-active drag handle on hover while dragging
  'body.is-dragging &:hover': {
    '& .roadmap-item-drag-handle:not(.active)': {
      backgroundColor: 'transparent',
    },
  },
}

const RoadmapPillDragHandle = memo(
  forwardRef<
    HTMLDivElement,
    Omit<BoxProps, 'sx'> & {
      tooltip: string | undefined
      operation: RoadmapDndOperation
      active?: boolean
      containerRef: React.RefObject<HTMLElement>
    }
  >(function RoadmapPillDragHandle({tooltip, operation, active, containerRef, ...props}, forwardedRef) {
    const [contentProps, portalTooltip] = usePortalTooltip({
      contentRef: containerRef,
      'aria-label': tooltip,
      className: 'roadmap-item-drag-handle-tooltip',
      direction: 'n',
      alignmentOffset: -ROADMAP_ITEM_GRAB_HANDLE_HEIGHT / 2,
      anchorOffset: -ROADMAP_ITEM_GRAB_HANDLE_WIDTH / 2,
      anchorSide: operation === 'expand-leading' ? 'inside-left' : 'inside-right',
      open: active ? true : undefined,
    })

    return (
      <Box
        {...testIdProps(`roadmap-view-item-${operation}-handle`)}
        className={operation}
        data-dnd-operation={operation}
        sx={roadmapItemGrabHandleStyles}
        {...props}
        ref={forwardedRef}
        {...contentProps}
      >
        <div className={clsx('roadmap-item-drag-handle', {active})} />
        {portalTooltip}
      </Box>
    )
  }),
)

export type RoadmapPillProps = {
  titleHtml: string
  renderLink: boolean
  url: string
  titleColumnValue: ColumnValue<TitleValueWithContentType>
  timeSpan: TimeSpan
  pendingTimeSpan: TimeSpan | null
  number?: number
  assignees?: Array<User>
  allowedOperations: Set<RoadmapDragAndDropOperations>
  dragProps: ReturnType<typeof useRoadmapDragAndDrop>['dragProps']
  dragDetails: ReturnType<typeof useRoadmapDragAndDrop>['dragDetails']
  index: number
  item: MemexItemModel
  mouseState?: MouseState
}

const defaultAssignees: Array<User> = []
/** Roadmap Pill Implementation - renders the item pill with the position and size determined by the start/end dates */
export const RoadmapPill = memo(function RoadmapPill({
  titleHtml,
  renderLink,
  titleColumnValue,
  timeSpan,
  pendingTimeSpan,
  url,
  number,
  assignees = defaultAssignees,
  allowedOperations,
  dragProps,
  dragDetails,
  index,
}: RoadmapPillProps) {
  const getViewport = useRoadmapGetViewport()
  const {getX} = useRoadmapView()
  const tableWidth = useRoadmapTableWidth()
  const {isVisible} = useIsVisible({ref: dragProps.node})
  const isSavePending = pendingTimeSpan !== null
  const {wrapperProps, focusType, refocusPillArea, onFocusInternalElement, linkRef, onClickPillLink} =
    useRoadmapPillAreaFocus()

  const leadingEdgeRef = useRef<HTMLDivElement | null>(null)
  const {isVisible: isLeadingEdgeVisible} = useIsVisible({ref: leadingEdgeRef})

  // Relative positioning within the visible roadmap viewport.  Add 1 to avoid fractional floating point errors.
  const [startDate, endDate] = pendingTimeSpan
    ? getSortedDates([pendingTimeSpan.start, pendingTimeSpan.end])
    : getSortedDates([timeSpan.start, timeSpan.end])
  const pillOffsetLeft = startDate ? getX(startDate) : 0
  const pillWidth = endDate ? getX(addDays(endDate, 1)) - pillOffsetLeft : 0

  const viewport = getViewport()
  const isBefore = !isVisible && pillOffsetLeft + pillWidth <= viewport.left + 1
  const isAfter = !isVisible && pillOffsetLeft >= viewport.right - 1
  const clearTableFocus = useClearTableFocus()

  const [tooltipPosition, setTooltipPosition] = useState<{left: number; right: number} | undefined>(undefined)

  /** We need to extend the z-index on hovered rows so that the tooltip remains visible on top of other other rows.
   *  We only want to do this when the tooltip is visible, because otherwise table cells can be obscured while hovering
   */
  useBodyClass('roadmap-date-tooltip-visible', tooltipPosition !== undefined)

  useLayoutEffect(() => {
    // refocus pill element after dragging or scrolling, if cell has navigation focus
    void isVisible
    void dragProps.isDragging

    refocusPillArea()
  }, [isVisible, dragProps.isDragging, refocusPillArea])

  const {roadmapTruncateTitles} = useUserSettings()
  const titleSpan = <SanitizedHtml sx={titleStyles}>{titleHtml}</SanitizedHtml>
  const canDrag = allowedOperations.has('allowed-drag-update')
  const isDragging = dragProps.isDragging && !!dragDetails
  const ghostPillWidth =
    isDragging && !isSavePending ? dragDetails.dragGhostSpan.endX - dragDetails.dragGhostSpan.startX : 0

  // Attempt to modify the Primer themed box-shadow to avoid any shadowing at the right-side gap of the pill.
  // If found, replace the default '0 3px 6px' with '-3px 6px 6px -3px' (same medium shadow, but not at the right edge)
  // Examples of Primer theme medium shadows:
  //   light.css:  --color-shadow-medium: 0 3px 6px rgba(140, 149, 159, 0.15)
  //   dark_high_contrast.css: --color-shadow-medium: 0 3px 6px #010409
  const {theme} = useTheme()
  let shadow = theme?.shadows.shadow.medium
  if (typeof shadow === 'string' && (shadow.startsWith('0 3px 6px rgb') || shadow.startsWith('0 3px 6px #'))) {
    shadow = shadow.replace('0 3px 6px', '-3px 6px 6px -3px')
  }
  const modifiedBackgroundStyles = shadow ? {...pillBackgroundStyles, boxShadow: shadow} : pillBackgroundStyles

  // pillBackground provides the static styling of the pill container with absolute positioning based on start/end dates.
  const pillBackground = (
    <Label
      sx={modifiedBackgroundStyles}
      style={{
        width: pillWidth,
      }}
    />
  )

  // visiblePill provides the user interaction of the pill container with absolute positioning based on start/end dates.
  const pillForeground = (
    <Label
      ref={linkRef}
      // The entire visiblePill container serves as a link to open the issue, just like clicking the actual visible link title in pillContent
      as="a"
      href={url}
      target="_blank"
      rel="noreferrer"
      onClick={onClickPillLink}
      onFocus={onFocusInternalElement}
      sx={{
        ...(canDrag ? pillDragStyles : pillStyles),
        pointerEvents: isDragging ? 'none' : 'auto',
        outline: 'none', // handed via is-focused below

        '&.is-focused::before': {
          content: '""',
          position: 'absolute',
          width: 'calc(100% - 4px)',
          height: 'calc(100% - 4px)',
          border: '2px solid',
          borderColor: 'accent.emphasis',
          borderRadius: `${PILL_BORDER_RADIUS}px`,
          inset: 0,
        },
      }}
      style={{
        width: isDragging ? ghostPillWidth : pillWidth,
      }}
      {...dragProps.attributes}
      {...dragProps.listeners}
      onMouseOver={e => {
        // Position and resize the tooltip within the pill so that it is centered at mouse entry and always spans the full pill width
        if (isDragging) return
        const box = e.currentTarget.getBoundingClientRect()
        const innerOffset = e.clientX - box.left
        const isPastCenter = e.clientX - box.left > box.width / 2
        const tooltipLeft = isPastCenter ? 0 : innerOffset * 2 - box.width
        const tooltipRight = isPastCenter ? box.width - innerOffset * 2 : 0
        setTooltipPosition({left: tooltipLeft, right: tooltipRight})
      }}
      onMouseOut={() => {
        if (isDragging) return
        setTooltipPosition(undefined)
      }}
      className={clsx('roadmap-pill', {'is-focused': focusType === PillAreaFocusType.PillLink})}
      {...testIdProps('roadmap-view-item-pill')}
    >
      <Tooltip
        aria-label={getTooltipText(isDragging ? dragDetails.adjustedTimeSpan : timeSpan)}
        className={clsx('roadmap-pill-tooltip', {
          active: dragDetails?.operation === 'move',
        })}
        // hide pill tooltip when dragging to resize
        sx={isDragging && dragDetails.operation !== 'move' ? roadmapMainTooltipHiddenStyles : roadmapMainTooltipStyles}
        style={tooltipPosition}
        direction={index === 0 ? 's' : 'n'}
      />
    </Label>
  )

  // pillContent includes the issue title that might overflow the visiblePill,
  // and gets sticky positioning on the left side when the visiblePill is partially scrolled out of view.
  const pillContent = (
    <>
      <Box sx={{flexShrink: 0, mr: 2, display: 'flex', pointerEvents: 'none'}}>
        <MemexItemIcon titleColumn={titleColumnValue} />
      </Box>
      {renderLink ? (
        <Link
          href={url}
          target="_blank"
          rel="noreferrer"
          onClick={onClickPillLink}
          sx={{
            ...titleLinkStyles,
            pointerEvents: isDragging ? 'none' : 'auto',
          }}
          hoverColor="accent.fg"
          draggable={false}
          tabIndex={-1}
          {...testIdProps('roadmap-item-link')}
        >
          {titleSpan}
        </Link>
      ) : (
        titleSpan
      )}
      {number && <Text sx={{ml: 1, color: 'fg.muted'}}>{`#${number}`}</Text>}
      <AssigneeStack
        assignees={assignees}
        sx={{ml: 2}}
        wrapperSx={{zIndex: ROADMAP_PILL_ASSIGNEE_TOOLTIP_INDEX}}
        avatarProps={{onFocus: clearTableFocus}}
        {...testIdProps(`roadmap-item-assignees`)}
      />
    </>
  )

  const isLeadingActive =
    (dragDetails?.operation === 'expand-leading' && !dragDetails?.swapHandles) ||
    (dragDetails?.operation === 'expand-trailing' && dragDetails?.swapHandles)
  const isTrailingActive =
    (dragDetails?.operation === 'expand-trailing' && !dragDetails?.swapHandles) ||
    (dragDetails?.operation === 'expand-leading' && dragDetails?.swapHandles)

  return (
    <RoadmapCell
      role="gridcell"
      {...testIdProps('roadmap-pill')}
      data-date-start={startDate ? formatISODateString(startDate) : undefined}
      data-date-end={endDate ? formatISODateString(endDate) : undefined}
      sx={{
        backgroundColor: 'initial',
        zIndex: ROADMAP_PILL_Z_INDEX,
        display: 'flex',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Box
        ref={leadingEdgeRef}
        role={'presentation'}
        sx={{
          position: 'absolute',
          width: PILL_PADDING - PILL_STICKY_MARGIN,
        }}
        style={{left: pillOffsetLeft}}
      />

      <Box
        ref={dragProps.setNodeRef}
        sx={{
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
        }}
        style={{left: pillOffsetLeft}}
        {...testIdProps('roadmap-view-pill-background')}
      >
        {pillBackground}
        {!roadmapTruncateTitles.enabled && <Box sx={pillBackgroundRightStyles} />}
      </Box>

      {isDragging && !isSavePending && <TargetPill timeSpan={dragDetails.adjustedTimeSpan} />}
      <Box
        ref={dragProps.setNodeRef}
        sx={{
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          zIndex: 1,
        }}
        style={{
          left: pillOffsetLeft,
          // In Safari there is a bug where tooltip is not rendered correctly when the pill is dragged.
          // Adding translateZ(0) forces a repaint and resolved the issue.
          // https://stackoverflow.com/questions/3485365/how-can-i-force-webkit-to-redraw-repaint-to-propagate-style-changes
          transform: `translateX(${
            isDragging && dragDetails.dragGhostSpan.startX ? dragDetails.dragGhostSpan.startX - pillOffsetLeft : 0
          }px) translateZ(0)`,
        }}
        {...wrapperProps}
        {...testIdProps('roadmap-view-pill-foreground')}
      >
        {pillForeground}
        {allowedOperations.has('allowed-drag-expand') && startDate && endDate ? (
          <>
            {isTrailingActive ? null : (
              <RoadmapPillDragHandle
                tooltip={
                  getTooltipText({
                    start: isDragging ? dragDetails.adjustedTimeSpan.start : timeSpan.start,
                    startIteration: isDragging ? dragDetails.adjustedTimeSpan.startIteration : timeSpan.startIteration,
                    end: undefined,
                  }) || RoadmapResources.noDateSet
                }
                operation="expand-leading"
                active={isLeadingActive}
                ref={dragProps.setActivatorNodeRef}
                containerRef={dragProps.node}
                {...dragProps.attributes}
                {...dragProps.listeners}
                tabIndex={-1}
                aria-label="Resize the item by dragging the earlier date"
              />
            )}
            {isLeadingActive ? null : (
              <RoadmapPillDragHandle
                tooltip={
                  getTooltipText({
                    start: undefined,
                    end: isDragging ? dragDetails.adjustedTimeSpan.end : timeSpan.end,
                    endIteration: isDragging ? dragDetails.adjustedTimeSpan.endIteration : timeSpan.endIteration,
                  }) || RoadmapResources.noDateSet
                }
                operation="expand-trailing"
                active={isTrailingActive}
                ref={dragProps.setActivatorNodeRef}
                containerRef={dragProps.node}
                {...dragProps.attributes}
                {...dragProps.listeners}
                tabIndex={-1}
                aria-label="Resize the item by dragging the later date"
              />
            )}
          </>
        ) : null}
      </Box>
      {isVisible || isDragging ? (
        <Box
          sx={{
            position:
              isLeadingEdgeVisible || isDragging || isSavePending || roadmapTruncateTitles.enabled
                ? 'absolute'
                : 'sticky',
            display: 'flex',
            alignItems: 'center',
          }}
          style={{
            left:
              isLeadingEdgeVisible || isDragging || isSavePending || roadmapTruncateTitles.enabled
                ? pillOffsetLeft + PILL_PADDING
                : tableWidth + PILL_STICKY_MARGIN,
            opacity: isDragging || isSavePending ? 0.3 : undefined,
          }}
          {...testIdProps('roadmap-view-item-pill-content')}
        >
          {roadmapTruncateTitles.enabled ? (
            <Truncate
              title={titleHtml}
              expandable
              sx={{maxWidth: pillWidth - 16, display: 'flex', alignItems: 'center'}}
            >
              {pillContent}
            </Truncate>
          ) : (
            pillContent
          )}
        </Box>
      ) : isBefore || isAfter ? (
        <NavigationArrowWithFocusContext isBefore={isBefore} startDate={startDate} endDate={endDate} />
      ) : null}
    </RoadmapCell>
  )
})

/**
 * Renders the target timespan that a pill will snap to at the end of a drag operation.
 */
const TargetPill = ({timeSpan}: {timeSpan: TimeSpan}) => {
  const {getX} = useRoadmapView()

  const [startDate, endDate] = getSortedDates([timeSpan.start, timeSpan.end])
  const pillOffsetLeft = startDate ? getX(startDate) : 0
  const pillWidth = endDate ? getX(addDays(endDate, 1)) - pillOffsetLeft : 0

  return (
    <Box
      sx={targetPillStyles}
      style={{
        width: pillWidth,
        left: pillOffsetLeft,
      }}
      {...testIdProps('roadmap-view-pill-drag-target')}
    >
      &nbsp;
    </Box>
  )
}
