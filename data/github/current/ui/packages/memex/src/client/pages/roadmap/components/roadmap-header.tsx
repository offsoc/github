import {formatDate} from '@github-ui/date-picker'
import {usePortalTooltip} from '@github-ui/portal-tooltip/use-portal-tooltip'
import {testIdProps} from '@github-ui/test-id-props'
import {getAnchoredPosition} from '@primer/behaviors'
import {ActionList, ActionMenu, Box, type BoxProps, Button, Link, Portal} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {addDays, addHours, addMonths, differenceInDays, differenceInMonths, startOfMonth} from 'date-fns'
import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

import {RoadmapZoomLevel} from '../../../api/view/contracts'
import {intervalDateRange} from '../../../helpers/iterations'
import {getIterationOptionsTooltipText} from '../../../helpers/roadmap-helpers'
import {ViewerPrivileges} from '../../../helpers/viewer-privileges'
import {useRoadmapZoomLevel} from '../../../hooks/use-roadmap-settings'
import {
  isCurrentIterationByMarker,
  type IterationMarker,
  type MilestoneMarker,
  RoadmapMarkerType,
  useRoadmapIterationMarkersSize,
  useRoadmapMarkersInRange,
  useRoadmapMilestoneMarkersSize,
} from '../components/roadmap-markers-in-range'
import {formatDateUtc, startOfDayUtc} from '../date-utils'
import {useRoadmapHeaderHeight} from '../hooks/use-roadmap-header-height'
import {useRoadmapShowMarkersHeader} from '../hooks/use-roadmap-show-markers-header'
import {useRoadmapNavigation, useRoadmapView} from '../roadmap-view-provider'
import {ROADMAP_HEADER_Z_INDEX} from '../roadmap-z-index'
import {getTooltipText} from '../tooltip-helper'
import {RoadmapMarkerHeaderNubs} from './roadmap-marker'
import {roadmapColorScheme} from './roadmap-marker-colors'
import {RoadmapTableColumnResizeProvider} from './roadmap-table-column-resize-provider'
import {RoadmapTableHeaderDragSash} from './roadmap-table-drag-sash'

const MONTH_LEFT_PADDING = 12
const MARKER_LEFT_PADDING = 12
const PAGE_PADDING = 16
const PAGE_PADDING_RIGHT = 32

const monthStyles: BetterSystemStyleObject = {
  position: 'sticky',
  left: `${PAGE_PADDING - MONTH_LEFT_PADDING}px`,
  paddingLeft: `${MONTH_LEFT_PADDING}px`,
  paddingTop: '8px',
  fontSize: '12px',
  backgroundColor: 'canvas.default',
  whiteSpace: 'nowrap',
  flexShrink: 0,
  flexGrow: 0,
  // Add a gradient to the left of the month name, to help fade out the
  // incoming month name from the right side when scrolling horizontally
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-20px',
    width: '20px',
    height: '100%',
    backgroundColor: 'canvas.default',
    // Opacity gradient from left to right to slowly add more of the background color.
    maskImage: 'linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)',
  },
}

const dayStyles: BetterSystemStyleObject = {
  position: 'absolute',
  paddingTop: '6px',
  display: 'flex',
  justifyContent: 'center',
  fontSize: '12px',
}

const todayStyles: BetterSystemStyleObject = {
  ...dayStyles,
  color: roadmapColorScheme.today.nub,
  fontWeight: 'bold',
}

const headerDragHandleStyles: BetterSystemStyleObject = {position: 'relative', width: '100%', top: '-32px'}

export const RoadmapHeader = memo(function RoadmapHeader() {
  const {totalWidth} = useRoadmapView()
  const showMarkersHeader = useRoadmapShowMarkersHeader()
  const headerHeight = useRoadmapHeaderHeight()
  const {hasWritePermissions} = ViewerPrivileges()
  return (
    <Box
      role="rowgroup"
      sx={{
        height: headerHeight,
        borderBottomStyle: 'solid',
        borderBottomWidth: 2,
        borderBottomColor: 'border.default',
        position: 'sticky',
        top: 0,
        zIndex: ROADMAP_HEADER_Z_INDEX,
        backgroundColor: 'canvas.default',
        width: `${totalWidth}px`,
        color: 'fg.muted',
        contain: 'layout',
      }}
      {...testIdProps('roadmap-header')}
    >
      <RoadmapMonths />
      {showMarkersHeader && <RoadmapMarkerHeaders />}
      <RoadmapDays />
      <RoadmapMarkerHeaderNubs />
      {hasWritePermissions ? (
        <Box role="row" sx={headerDragHandleStyles}>
          <div role="gridcell">
            <RoadmapTableColumnResizeProvider focusable>
              <RoadmapTableHeaderDragSash id="RoadmapTableHeaderDragSash" />
            </RoadmapTableColumnResizeProvider>
          </div>
        </Box>
      ) : null}
    </Box>
  )
})

const STEPS_BY_ZOOM_LEVEL: {
  [zoomLevel in RoadmapZoomLevel]: number
} = {
  [RoadmapZoomLevel.Month]: 1,
  [RoadmapZoomLevel.Quarter]: 7,
  [RoadmapZoomLevel.Year]: 14,
}
/**
 * Days rendered depends on the Zoom level:
 * - Month: render every day.
 * - Quarter and Year: render only the first day of each week.
 *     Monday is the start of the work week, but eventually we may want to support a user-configurable start of week.
 */
const RoadmapDays = memo(function RoadmapDays() {
  const {columnWidth, getX, timeRangeEnd, timeRangeStart, today} = useRoadmapView()
  const zoomLevel = useRoadmapZoomLevel()

  const days = useMemo(() => {
    const dayTime = 24 * 60 * 60 * 1000
    const startDayUtc = timeRangeStart.getUTCDay() // 0-6, Sunday is 0
    const dayStep = STEPS_BY_ZOOM_LEVEL[zoomLevel]
    const firstDay = addDays(timeRangeStart, (dayStep - startDayUtc + 1) % dayStep) // first day of the week should be Monday, so add 1
    const totalDays = Math.floor(differenceInDays(timeRangeEnd, firstDay) / dayStep)
    const startTime = firstDay.getTime()

    return Array.from({length: totalDays}, (_, i) => {
      const date = new Date(startTime + i * dayStep * dayTime)
      const isToday = date.getTime() === today.getTime()
      const isoDateString = `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}-${date
        .getUTCDate()
        .toString()
        .padStart(2, '0')}`

      return (
        <Box
          sx={isToday ? todayStyles : dayStyles}
          key={isoDateString}
          role="columnheader"
          style={{
            left: getX(date),
            width: columnWidth,
          }}
          as="time"
          data-index={i}
          dateTime={isoDateString}
          aria-current={isToday ? 'date' : undefined}
        >
          {date.getUTCDate()}
        </Box>
      )
    })
  }, [columnWidth, getX, timeRangeEnd, timeRangeStart, today, zoomLevel])

  return (
    <Box role="row" sx={{position: 'relative', display: 'flex', height: '32px'}}>
      {days}
    </Box>
  )
})

const RoadmapMonths = memo(function RoadmapMonths() {
  const {timeRangeEnd, timeRangeStart, getX} = useRoadmapView()
  const zoomLevel = useRoadmapZoomLevel()
  const timeRangeStartMonthLocal = startOfMonth(timeRangeStart)
  const firstFullMonthUtc = startOfDayUtc(addMonths(timeRangeStartMonthLocal, 1))
  const spaceOnLeft = getX(firstFullMonthUtc) - MONTH_LEFT_PADDING

  const totalMonths = useMemo(
    () => differenceInMonths(timeRangeEnd, timeRangeStart) + 1,
    [timeRangeEnd, timeRangeStart],
  )

  const isYearZoomLevel = zoomLevel === RoadmapZoomLevel.Year
  const months = useMemo(() => {
    return Array.from({length: totalMonths}, (_, i) => {
      const dateFormat = isYearZoomLevel ? 'MMM yyyy' : 'MMMM yyyy'
      const firstOfMonthLocal = addMonths(timeRangeStartMonthLocal, i)
      const firstOfMonthUtc = startOfDayUtc(firstOfMonthLocal)
      const nextFirstOfMonthUtc = startOfDayUtc(addMonths(firstOfMonthLocal, 1))

      let width = 0
      let left = PAGE_PADDING - MONTH_LEFT_PADDING
      let paddingLeft = MONTH_LEFT_PADDING

      if (i === 0) {
        // First month: The first month requires special width/styling for partial month days and page padding
        left = 0
        if (spaceOnLeft <= 0) {
          paddingLeft = 0
          width = 0
        } else if (spaceOnLeft < PAGE_PADDING) {
          paddingLeft = spaceOnLeft
          width = spaceOnLeft
        } else {
          paddingLeft = PAGE_PADDING
          width = spaceOnLeft
        }
      } else if (i === 1 && spaceOnLeft < 0) {
        // Second month: The left-side padding of the second month (first full month) may need to be adjusted for available space on the left.
        if (firstOfMonthUtc.getTime() === timeRangeStart.getTime()) {
          width = getX(nextFirstOfMonthUtc) - getX(firstOfMonthUtc) - MONTH_LEFT_PADDING
        } else {
          const paddingToFitSpace = MONTH_LEFT_PADDING + spaceOnLeft
          paddingLeft = paddingToFitSpace
          left = -paddingToFitSpace
          width = getX(nextFirstOfMonthUtc) - getX(firstOfMonthUtc) - MONTH_LEFT_PADDING + paddingToFitSpace
        }
      } else if (i === totalMonths - 1) {
        // Last month: The last month requires special width/styling for partial month days and available space on the right.
        const spaceOnRight = getX(timeRangeEnd) - getX(firstOfMonthUtc) + MONTH_LEFT_PADDING - PAGE_PADDING_RIGHT
        if (spaceOnRight <= 0) {
          paddingLeft = 0
          width = 0
        } else if (spaceOnRight < MONTH_LEFT_PADDING) {
          paddingLeft = spaceOnRight
          width = spaceOnRight
        } else {
          width = spaceOnRight
        }
      } else {
        // All other month headers are full width
        width = getX(nextFirstOfMonthUtc) - getX(firstOfMonthUtc)
      }

      return (
        <Box
          role="columnheader"
          key={firstOfMonthLocal.getTime()}
          sx={monthStyles}
          style={{
            width: `${width}px`,
            left: `${left}px`,
            paddingLeft: `${paddingLeft}px`,
          }}
        >
          {formatDate(firstOfMonthLocal, dateFormat)}
        </Box>
      )
    })
  }, [totalMonths, isYearZoomLevel, timeRangeStartMonthLocal, spaceOnLeft, timeRangeStart, getX, timeRangeEnd])

  return (
    <Box role="row" sx={{position: 'relative', display: 'flex', height: '32px'}}>
      {months}
      <RoadmapControlsCaulk />
    </Box>
  )
})

/** Seals the gap between the absolute positioned roadmap contols and the browser edge/scrollbar so we don't see month header text */
const RoadmapControlsCaulk = () => {
  return (
    <Box
      sx={{
        position: 'sticky',
        width: `${PAGE_PADDING_RIGHT}px}`,
        right: 0,
        backgroundColor: 'canvas.default',
      }}
    />
  )
}

const RoadmapMarkerHeaders = memo(function RoadmapMarkerHeaders() {
  const {getX} = useRoadmapView()
  const {markersInRange} = useRoadmapMarkersInRange()
  const iterationCount = useRoadmapIterationMarkersSize()
  const milestonesCount = useRoadmapMilestoneMarkersSize()

  // Keeping these as separate arrays for the time being, since iteration markers are sticky
  const {milestoneMarkers, iterationMarkers} = useMemo(
    () =>
      markersInRange.reduce<{
        milestoneMarkers: Array<MilestoneMarker>
        iterationMarkers: Array<IterationMarker>
      }>(
        (acc, marker) => {
          if (marker.type === RoadmapMarkerType.Iteration || marker.type === RoadmapMarkerType.IterationBreak) {
            acc.iterationMarkers.push(marker)
          } else if (marker.type === RoadmapMarkerType.Milestone) {
            acc.milestoneMarkers.push(marker)
          }

          return acc
        },
        {iterationMarkers: [], milestoneMarkers: []},
      ),
    [markersInRange],
  )

  const firstIterationMarker = iterationMarkers[0]
  const firstIterationLeftOffset = firstIterationMarker ? getX(new Date(firstIterationMarker.date)) : 0

  return markersInRange.length > 0 || milestonesCount > 0 ? (
    <Box
      role="row"
      sx={{
        position: 'relative',
        display: 'flex',
        height: '24px',
      }}
    >
      <Box
        role="presentation"
        sx={defaultIterationHeaderStyles}
        style={{
          width: `${firstIterationLeftOffset - MARKER_LEFT_PADDING}px`,
        }}
        {...testIdProps(`roadmap-iteration-marker-header-spacer`)}
      />

      {iterationMarkers.map((marker, index) => {
        return <RoadmapIterationHeader key={marker.id} marker={marker} nextMarker={iterationMarkers[index + 1]} />
      })}
      {iterationCount > 0 && (
        <Box
          role="presentation"
          sx={{...defaultIterationHeaderStyles, width: '200px'}}
          {...testIdProps(`roadmap-iteration-marker-header-fill`)}
        />
      )}
      {milestoneMarkers.map(marker => {
        return <RoadmapMilestoneHeader key={marker.id} marker={marker} />
      })}
    </Box>
  ) : null
})

const defaultIterationHeaderStyles: BetterSystemStyleObject = {
  position: 'sticky',
  color: roadmapColorScheme.iteration.nub,
  fontWeight: 600,
  left: `${PAGE_PADDING - MARKER_LEFT_PADDING}px`,
  paddingLeft: `${MARKER_LEFT_PADDING}px`,
  paddingTop: '6px',
  fontSize: '12px',
  lineHeight: '12px',
  backgroundColor: 'canvas.default',
  whiteSpace: 'nowrap',
  flexShrink: 0,
  flexGrow: 0,
  // Add a gradient to the left of the month name, to help fade out the
  // incoming month name from the right side when scrolling horizontally
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-20px',
    width: '20px',
    height: '100%',
    backgroundColor: 'canvas.default',
    // Opacity gradient from left to right to slowly add more of the background color.
    maskImage: 'linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)',
    pointerEvents: 'none',
  },
}

const milestoneHeaderStyle: BetterSystemStyleObject = {
  ...defaultIterationHeaderStyles,
  color: roadmapColorScheme.milestone.nub,
  position: 'absolute',
  pl: 0,
  boxShadow: theme => `0px 0px 11px 1px ${theme.colors.canvas.default}`,
  '&:hover': {
    // on hover, show the shadow on the left and right and raise the element over any potentially overlapping headers
    boxShadow: theme =>
      `10px 0 11px 1px ${theme.colors.canvas.default}, -10px 0 11px 1px ${theme.colors.canvas.default}`,
    zIndex: 1,
  },
}

const currentIterationHeaderStyles: BetterSystemStyleObject = {
  ...defaultIterationHeaderStyles,
  color: roadmapColorScheme.currentIteration.nub,
}

function RoadmapMilestoneHeader({marker}: {marker: MilestoneMarker}) {
  const {getX} = useRoadmapView()
  const dueDateAtMidday = useMemo(() => addHours(new Date(marker.date), 12), [marker.date])
  const leftOffset = getX(dueDateAtMidday)

  const ref = useRef<HTMLDivElement>(null)
  const [contentProps, tooltip] = usePortalTooltip({
    contentRef: ref,
    'aria-label': getTooltipText({
      start: dueDateAtMidday,
      end: dueDateAtMidday,
    }),
  })
  return (
    <Box
      ref={ref}
      role="columnheader"
      sx={milestoneHeaderStyle}
      style={{
        left: leftOffset,
      }}
      {...contentProps}
      {...testIdProps(`roadmap-milestone-marker-header`)}
    >
      {(marker.options.length || 0) > 1 ? (
        <RoadmapMilestoneMarkerActionMenu marker={marker} />
      ) : (
        <RoadmapMilestoneMarkerHeaderLink marker={marker} />
      )}
      {tooltip}
    </Box>
  )
}

function RoadmapIterationHeader({marker, nextMarker}: {marker: IterationMarker; nextMarker?: IterationMarker}) {
  const {getX, timeRangeEnd} = useRoadmapView()
  const isCurrent = isCurrentIterationByMarker(marker)
  const startDate = new Date(marker.date)
  const endDate = nextMarker ? new Date(nextMarker.date) : addDays(startDate, marker.duration || 0)
  const leftOffset = getX(startDate)
  // if the iteration ends after the time range, we need to use the time range end date
  const rightOffset = getX(timeRangeEnd < endDate ? timeRangeEnd : endDate)
  const width = rightOffset - leftOffset
  const ref = useRef<HTMLDivElement>(null)
  const [contentProps, tooltip] = usePortalTooltip({
    contentRef: ref,
    'aria-label': getIterationOptionsTooltipText(marker.options),
    anchorOffset: 6,
  })
  return (
    <Box
      ref={ref}
      role="columnheader"
      sx={isCurrent ? currentIterationHeaderStyles : defaultIterationHeaderStyles}
      style={{
        width: `${width}px`,
      }}
      {...testIdProps(`roadmap-iteration-marker-header-${marker.id}`)}
    >
      <HoverOverPortalContent
        ref={ref}
        sx={isCurrent ? currentIterationHeaderStyles : defaultIterationHeaderStyles}
        {...contentProps}
      >
        {marker.options.length === 1 ? (
          <>{marker.title}</>
        ) : (
          <ActionMenu>
            <ActionMenu.Anchor>
              <Button
                title={marker.title}
                aria-label={marker.title}
                sx={{
                  all: 'unset',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'inherit',
                    textDecoration: 'underline',
                  },
                }}
              >
                {marker.title}
                {marker.date && (
                  <span className="sr-only">
                    (Starting on <time dateTime={marker.date}>{formatDateUtc(new Date(marker.date))}</time>)
                  </span>
                )}
              </Button>
            </ActionMenu.Anchor>
            <ActionMenu.Overlay sx={{marginTop: '7px'}}>
              <ActionList {...testIdProps(`roadmap-iteration-marker-selector`)}>
                {marker.options.map(option => {
                  const {startDate: optionStartDate, endDate: optionEndDate} = intervalDateRange({
                    startDate: option.startDate,
                    duration: option.duration,
                  })
                  return (
                    <ActionList.Item
                      key={option.id}
                      active={false}
                      selected={false}
                      sx={{
                        cursor: 'default',
                        pointerEvents: 'none',
                        '&:hover': {
                          backgroundColor: 'unset',
                          color: 'unset',
                        },
                      }}
                    >
                      {option.title}
                      <ActionList.Description>
                        {getTooltipText({
                          start: optionStartDate,
                          end: optionEndDate,
                        })}
                      </ActionList.Description>
                    </ActionList.Item>
                  )
                })}
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        )}
      </HoverOverPortalContent>
      {tooltip}
    </Box>
  )
}

function RoadmapMilestoneMarkerHeaderLink({marker}: {marker: MilestoneMarker}) {
  const firstOption = marker.options[0]
  const url: string | undefined = firstOption?.url

  return (
    <Link
      sx={{all: 'unset', cursor: 'pointer', display: 'inline-block'}}
      target="_blank"
      rel="noopener noreferrer"
      href={url}
      title={marker.description}
    >
      {marker.title}
      {marker.date && (
        <span className="sr-only">
          (Due on <time dateTime={marker.date}>{formatDateUtc(new Date(marker.date))}</time>)
        </span>
      )}
    </Link>
  )
}

function RoadmapMilestoneMarkerActionMenu({marker}: {marker: MilestoneMarker}) {
  return (
    <ActionMenu>
      <ActionMenu.Anchor>
        <Button
          as="button"
          title={marker.description}
          aria-label={marker.description}
          sx={{
            all: 'unset',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'inherit',
              textDecoration: 'underline',
            },
          }}
        >
          {marker.options.length} milestones
          {marker.date && (
            <span className="sr-only">
              (Due on <time dateTime={marker.date}>{formatDateUtc(new Date(marker.date))}</time>)
            </span>
          )}
        </Button>
      </ActionMenu.Anchor>
      <ActionMenu.Overlay sx={{marginTop: '7px'}}>
        <ActionList {...testIdProps(`roadmap-milestone-marker-selector`)}>
          {marker.options.map(option => {
            return (
              <ActionList.LinkItem href={option.url} target="_blank" rel="noopener noreferrer" key={option.id}>
                {option.title}
                <ActionList.Description>{option.repoNameWithOwner}</ActionList.Description>
              </ActionList.LinkItem>
            )
          })}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}

/**
 * This component renders content, and also renders a portal with the same content
 * that displays when the user hovers over the content, avoiding z-index issues related to this
 * element being in a different stacking context.
 */
const HoverOverPortalContent = forwardRef<HTMLElement, BoxProps>(function HoverOverPortalContent(
  {children, sx, ...rest},
  forwardedRef,
) {
  const contentRef = useRef<HTMLDivElement>(null)
  useImperativeHandle<HTMLElement | null, HTMLElement | null>(forwardedRef, () => contentRef.current)
  const [showOverlay, setShowOverlay] = useState(false)
  return (
    <Box
      ref={contentRef}
      {...rest}
      sx={{display: 'inline-block'}}
      onPointerEnter={e => {
        setShowOverlay(true)
        rest.onPointerEnter?.(e)
      }}
      onPointerLeave={e => {
        setShowOverlay(false)
        rest.onPointerLeave?.(e)
      }}
    >
      {children}
      {showOverlay ? (
        <OverlayingContent sx={sx} contentRef={contentRef}>
          {children}
        </OverlayingContent>
      ) : null}
    </Box>
  )
})

function OverlayingContent({
  contentRef,
  children,
  sx,
}: {
  contentRef: React.RefObject<HTMLDivElement>
  children: React.ReactNode
  sx?: BetterSystemStyleObject
}) {
  const floatingRef = useRef<HTMLDivElement>(null)
  const {left, top} = usePositionRelativeToContentRefBasedOnRoadmapScroll(floatingRef, contentRef)

  return (
    <Portal>
      <Box
        role="presentation"
        aria-hidden
        sx={{
          ...sx,
          position: 'absolute',
          fontSize: '12px',
          lineHeight: '12px',
          backgroundColor: 'canvas.default',
          pointerEvents: 'none',
          padding: 0,
          boxShadow: theme =>
            `10px 0 11px 1px ${theme.colors.canvas.default}, -10px 0 11px 1px ${theme.colors.canvas.default}`,
        }}
        style={{
          left,
          top,
        }}
        ref={floatingRef}
      >
        {children}
      </Box>
    </Portal>
  )
}

const usePositionRelativeToContentRefBasedOnRoadmapScroll = (
  floatingElementRef: React.RefObject<HTMLElement>,
  contentRef: React.RefObject<HTMLElement>,
) => {
  const {roadmapRef} = useRoadmapNavigation()
  const currentAnchorPosition = useRef({
    top: 0,
    left: 0,
  })

  return useSyncExternalStore(
    useCallback(
      notify => {
        roadmapRef.current?.addEventListener('scroll', notify)
        return () => {
          roadmapRef.current?.removeEventListener('scroll', notify)
        }
      },
      [roadmapRef],
    ),
    useCallback(() => {
      if (!floatingElementRef.current || !contentRef.current) return currentAnchorPosition.current
      const {left, top} = getAnchoredPosition(floatingElementRef.current, contentRef.current, {
        side: 'inside-top',
        align: 'start',
        alignmentOffset: 0,
        anchorOffset: 0,
      })
      /**
       * Only update the object if the position has changed. This is to prevent excessive re-renders
       */
      if (currentAnchorPosition.current.left !== left || currentAnchorPosition.current.top !== top) {
        currentAnchorPosition.current = {
          left,
          top,
        }
      }

      return currentAnchorPosition.current
    }, [contentRef, floatingElementRef]),
  )
}
