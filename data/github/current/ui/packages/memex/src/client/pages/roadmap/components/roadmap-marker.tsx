import {usePortalTooltip} from '@github-ui/portal-tooltip/use-portal-tooltip'
import {testIdProps} from '@github-ui/test-id-props'
import {Box} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {
  addDays,
  addHours,
  addMonths,
  addWeeks,
  differenceInMonths,
  differenceInWeeks,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import {memo, useMemo, useRef} from 'react'

import {RoadmapZoomLevel} from '../../../api/view/contracts'
import useIsVisible from '../../../components/board/hooks/use-is-visible'
import {dateStringFromISODate} from '../../../helpers/date-string-from-iso-string'
import {intervalDateRange} from '../../../helpers/iterations'
import {getIterationOptionsTooltipText} from '../../../helpers/roadmap-helpers'
import {useRoadmapZoomLevel} from '../../../hooks/use-roadmap-settings'
import {
  isCurrentIterationByMarker,
  type RoadmapMarker,
  RoadmapMarkerType,
  useRoadmapMarkersInRange,
} from '../components/roadmap-markers-in-range'
import {startOfDayUtc} from '../date-utils'
import {useRoadmapView} from '../roadmap-view-provider'
import {ROADMAP_MARKER_NUB_Z_INDEX} from '../roadmap-z-index'
import {getTooltipText} from '../tooltip-helper'
import {roadmapColorScheme} from './roadmap-marker-colors'

const MARKER_NUB_TOP_OFFSET = -4.5
const MARKER_NUB_ITERATION_SIZE = 7
const MARKER_NUB_CUSTOM_DATE_SIZE = 4

const markerStylesBase: BetterSystemStyleObject = {
  position: 'absolute',
  width: '1px',
  borderLeftWidth: 1,
  borderLeftStyle: 'solid',
  top: '1px',
  bottom: 0,
  zIndex: -1,
}

const todayMarkerStyles: BetterSystemStyleObject = {
  ...markerStylesBase,
  borderLeftColor: roadmapColorScheme.today.marker,
  borderLeftWidth: 2,
}

const iterationMarkerStyles: BetterSystemStyleObject = {
  ...markerStylesBase,
  borderLeftColor: roadmapColorScheme.iteration.marker,
  opacity: 0.33,
}

const milestoneMarkerStyles: BetterSystemStyleObject = {
  ...markerStylesBase,
  borderLeftColor: roadmapColorScheme.milestone.marker,
}

const customDateMarkerStyles: BetterSystemStyleObject = {
  ...markerStylesBase,
  borderLeftColor: roadmapColorScheme.customDate.marker,
  opacity: 0.33,
}

const currentIterationMarkerStyles: BetterSystemStyleObject = {
  ...markerStylesBase,
  borderLeftColor: roadmapColorScheme.currentIteration.marker,
}

const dividerStyles: BetterSystemStyleObject = {
  ...markerStylesBase,
  borderLeftColor: roadmapColorScheme.divider.marker,
}

const markerNubStylesBase: BetterSystemStyleObject = {
  display: 'inline-block',
  position: 'absolute',
  height: `${MARKER_NUB_ITERATION_SIZE}px`,
  width: `${MARKER_NUB_ITERATION_SIZE}px`,
  borderRadius: 0,
  zIndex: ROADMAP_MARKER_NUB_Z_INDEX,
  top: `${MARKER_NUB_TOP_OFFSET}px`,
}

const todayNubStyles: BetterSystemStyleObject = {
  ...markerNubStylesBase,
  borderRadius: '100%',
  backgroundColor: roadmapColorScheme.today.nub,
  width: `${MARKER_NUB_ITERATION_SIZE + 1}px`,
  height: `${MARKER_NUB_ITERATION_SIZE + 1}px`,
  top: `${MARKER_NUB_TOP_OFFSET - 0.5}px`,
}

const invisibleNubStyles: BetterSystemStyleObject = {
  ...markerNubStylesBase,
  backgroundColor: 'transparent',
}

const iterationNubStyles: BetterSystemStyleObject = {
  ...markerNubStylesBase,
  backgroundColor: 'transparent',
  borderColor: roadmapColorScheme.iteration.nub,
  borderStyle: 'solid',
  borderWidth: 2,
  borderRadius: '100%',
}

const milestoneNubStyles: BetterSystemStyleObject = {
  ...markerNubStylesBase,
  borderRadius: '2px',
  backgroundColor: roadmapColorScheme.milestone.nub,
  transform: 'rotate(45deg)',
}

const customDateNubStyles: BetterSystemStyleObject = {
  ...markerNubStylesBase,
  height: `${MARKER_NUB_CUSTOM_DATE_SIZE}px`,
  width: `${MARKER_NUB_CUSTOM_DATE_SIZE}px`,
  borderRadius: 0,
  backgroundColor: roadmapColorScheme.customDate.nub,
  top: `${MARKER_NUB_TOP_OFFSET}px`,
  borderTopRightRadius: '50%',
  transform: 'translate(1.5px, 2px) rotate(120deg) skewX(-30deg) scale(1,.866)',

  '&::before': {
    content: '""',
    position: 'absolute',
    height: `${MARKER_NUB_CUSTOM_DATE_SIZE}px`,
    width: `${MARKER_NUB_CUSTOM_DATE_SIZE}px`,
    backgroundColor: 'inherit',
    borderTopRightRadius: '50%',
    transform: 'rotate(-135deg) skewX(-45deg) scale(1.414,.707) translate(0,-50%)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    height: `${MARKER_NUB_CUSTOM_DATE_SIZE}px`,
    width: `${MARKER_NUB_CUSTOM_DATE_SIZE}px`,
    backgroundColor: 'inherit',
    borderTopRightRadius: '50%',
    transform: 'rotate(135deg) skewY(-45deg) scale(.707,1.414) translate(50%)',
  },
}

const breakIterationNubStyles: BetterSystemStyleObject = {
  ...iterationNubStyles,
  backgroundColor: roadmapColorScheme.iterationBreak.nub,
}

const currentIterationNubStyles: BetterSystemStyleObject = {
  ...iterationNubStyles,
  borderColor: roadmapColorScheme.currentIteration.nub,
}

/**
 * Renders the small circles (or other shapes) at the top of a marker, at the bottom edge of the header
 * Currently includes the "Today" marker, but could be expanded to include other markers like "Iteration X".
 * */
export function RoadmapMarkerHeaderNubs() {
  return (
    <Box role="row" sx={{position: 'relative'}}>
      <TodayMarkerNub />
      <MarkerNubs />
    </Box>
  )
}

/**
 * Renders the vertical marker lines within the roadmap item area
 * Currently includes the "Today" marker and roadmap date dividers, but could be expanded to include other markers like "Iteration X".
 * */
export function RoadmapMarkers() {
  return (
    <>
      <DividerMarkersLines />
      <TodayMarkerLine />
      <MarkerLines />
    </>
  )
}

function TodayMarkerNub() {
  const {getX, today} = useRoadmapView()
  const {singleDayMarkerMap} = useRoadmapMarkersInRange()
  const midday = useMemo(() => addHours(today, 12), [today])
  const leftOffset = getX(midday) - 3.5

  const ref = useRef<HTMLTimeElement | null>(null)
  const {isVisible} = useIsVisible({ref})
  const [contentProps, tooltip] = usePortalTooltip({
    contentRef: ref,
    'aria-label': `Today: ${getTooltipText({start: today, end: today})}`,
  })

  const todayDateString = dateStringFromISODate(today.toISOString())
  // if a single day marker is already present, don't render the today marker
  const isSingleDateMarkerPresent = singleDayMarkerMap.has(todayDateString)

  return (
    <Box
      as="time"
      role="gridcell"
      dateTime={todayDateString}
      ref={ref}
      sx={isVisible && !isSingleDateMarkerPresent ? todayNubStyles : invisibleNubStyles}
      style={{left: `${leftOffset}px`}}
      {...contentProps}
      {...testIdProps(`roadmap-today-marker-nub`)}
    >
      {tooltip}
    </Box>
  )
}

function TodayMarkerLine() {
  const {getX, today, totalWidth} = useRoadmapView()
  const {singleDayMarkerMap} = useRoadmapMarkersInRange()
  const midday = useMemo(() => addHours(today, 12), [today])
  const leftOffset = getX(midday)
  const isInTimeRange = leftOffset > 0 && leftOffset < totalWidth

  if (!isInTimeRange) return null

  const todayDateString = dateStringFromISODate(today.toISOString())
  // if a single day marker is already present, don't render the today marker
  if (singleDayMarkerMap.has(todayDateString)) return null

  return (
    <Box
      sx={todayMarkerStyles}
      // Slightly move marker to the left to accomodate thicker border on today marker
      style={{left: `${leftOffset - 0.5}px`, height: `100%`}}
      {...testIdProps(`roadmap-today-marker`)}
    />
  )
}
function MarkerNubs() {
  const {markersInRange} = useRoadmapMarkersInRange()

  return (
    <>
      {markersInRange.map(marker => (
        <MarkerNub marker={marker} key={marker.id} isCurrent={isCurrentIterationByMarker(marker)} />
      ))}
    </>
  )
}

const markerNubStyleMap = {
  [RoadmapMarkerType.CustomDate]: customDateNubStyles,
  [RoadmapMarkerType.Iteration]: iterationNubStyles,
  [RoadmapMarkerType.IterationBreak]: breakIterationNubStyles,
  [RoadmapMarkerType.Milestone]: milestoneNubStyles,
}

function MarkerNub({isCurrent = false, marker}: {isCurrent?: boolean; marker: RoadmapMarker}) {
  const {getX, today} = useRoadmapView()

  const {startDate, endDate} = useMemo(() => {
    const markerStartDate = 'duration' in marker ? new Date(marker.date) : addHours(new Date(marker.date), 12)
    const markerEndDate = 'duration' in marker ? addDays(markerStartDate, marker.duration) : new Date(marker.date)
    return {
      startDate: markerStartDate,
      endDate: markerEndDate,
    }
  }, [marker])

  const leftOffset = getX(new Date(startDate)) - 3
  const ref = useRef<HTMLTimeElement | null>(null)
  const {isVisible} = useIsVisible({ref})
  const todayDateString = dateStringFromISODate(today.toISOString())
  // is today and single day marker
  const isToday = marker.date === todayDateString && !('duration' in marker)

  const {startDate: tooltipStart, endDate: tooltipEnd} =
    'duration' in marker
      ? intervalDateRange({
          startDate: marker.date,
          duration: marker.duration,
        })
      : {startDate, endDate}

  const tooltipText =
    'duration' in marker && marker.options.length > 1
      ? getIterationOptionsTooltipText(marker.options)
      : `${marker.title}: ${getTooltipText({
          start: tooltipStart,
          end: tooltipEnd,
        })}`

  const [contentProps, tooltip] = usePortalTooltip({
    contentRef: ref,
    'aria-label': tooltipText,
  })

  const sx = isCurrent ? currentIterationNubStyles : markerNubStyleMap[marker.type]

  return (
    <Box
      as="time"
      role="gridcell"
      dateTime={marker.date}
      ref={ref}
      sx={isToday ? {...sx, backgroundColor: roadmapColorScheme.today.nub} : sx}
      style={{
        left: `${leftOffset}px`,
        ...(isVisible ? {} : {backgroundColor: 'transparent', borderColor: 'transparent'}),
      }}
      {...contentProps}
      {...testIdProps(`${marker.type}-marker-nub-${marker.id}`)}
    >
      {tooltip}
    </Box>
  )
}

const MarkerLines = memo(function MarkerLines() {
  const {markersInRange} = useRoadmapMarkersInRange()

  return (
    <>
      {markersInRange.map(marker => (
        <MarkerLine key={marker.id} marker={marker} isCurrent={isCurrentIterationByMarker(marker)} />
      ))}
    </>
  )
})

const markerLineStyleMap = {
  [RoadmapMarkerType.CustomDate]: customDateMarkerStyles,
  [RoadmapMarkerType.Iteration]: iterationMarkerStyles,
  [RoadmapMarkerType.IterationBreak]: iterationMarkerStyles,
  [RoadmapMarkerType.Milestone]: milestoneMarkerStyles,
}

function MarkerLine({marker, isCurrent = false}: {marker: RoadmapMarker; isCurrent?: boolean}) {
  const {getX, today} = useRoadmapView()
  const date = useMemo(
    () => ('duration' in marker ? new Date(marker.date) : addHours(new Date(marker.date), 12)),
    [marker],
  )
  const leftOffset = getX(new Date(date))
  const todayDateString = dateStringFromISODate(today.toISOString())
  // is today and single day marker
  const isToday = marker.date === todayDateString && !('duration' in marker)
  const sx = isCurrent ? currentIterationMarkerStyles : markerLineStyleMap[marker.type]
  const styles = isToday ? {...sx, borderLeftColor: roadmapColorScheme.today.marker, opacity: 1} : sx

  return (
    <Box {...testIdProps(`${marker.type}-marker-line`)} sx={styles} style={{left: `${leftOffset}px`, height: `100%`}} />
  )
}

/** Renders subtle marker lines (no nubs) that are used to divide the roadmap area based on month/week starts */
function DividerMarkersLines() {
  const {getX, timeRangeEnd, timeRangeStart} = useRoadmapView()
  const zoomLevel = useRoadmapZoomLevel()

  const totalMarkers =
    zoomLevel === RoadmapZoomLevel.Month
      ? Math.abs(differenceInWeeks(timeRangeEnd, timeRangeStart)) + 1
      : Math.abs(differenceInMonths(timeRangeEnd, timeRangeStart)) + 1

  const dates = Array.from({length: totalMarkers}, (_, i) => {
    // Use Monday as the start of the week in the month view
    return zoomLevel === RoadmapZoomLevel.Month
      ? startOfDayUtc(addWeeks(startOfWeek(timeRangeStart, {weekStartsOn: 1}), i))
      : startOfDayUtc(addMonths(startOfMonth(timeRangeStart), i))
  })

  return (
    <>
      {dates.map(date => {
        const leftOffset = getX(date)
        return <Box key={leftOffset} sx={dividerStyles} style={{left: `${leftOffset}px`, height: `100%`}} />
      })}
    </>
  )
}
