import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {addDays} from 'date-fns'
import {memo, useCallback, useEffect, useMemo, useState} from 'react'

import {ItemType} from '../../../api/memex-items/item-type'
import {RoadmapDateFieldNone} from '../../../api/view/contracts'
import type {RoadmapColumn, TimeSpan} from '../../../helpers/roadmap-helpers'
import useAutoScroll from '../../../hooks/use-auto-scroll'
import {useRoadmapSettings, useRoadmapTableWidth} from '../../../hooks/use-roadmap-settings'
import {isIterationColumnModel} from '../../../models/column-model/guards'
import {getSortedDates} from '../date-utils'
import {useRoadmapDragAndDrop} from '../hooks/use-roadmap-drag-and-drop'
import {useRoadmapPermissions} from '../hooks/use-roadmap-permissions'
import {useRoadmapPillAreaFocus} from '../hooks/use-roadmap-pill-area-focus'
import {useUpdateRoadmapDates} from '../hooks/use-update-roadmap-dates'
import {
  useRoadmapGetTimeSpan,
  useRoadmapGetViewport,
  useRoadmapNavigation,
  useRoadmapView,
} from '../roadmap-view-provider'
import {RoadmapPill, type RoadmapPillProps} from './roadmap-pill'
import {AddDateButton, NavigationArrowWithFocusContext} from './roadmap-pill-buttons'

const ADD_BUTTON_ICON_WIDTH = 22
const ADD_BUTTON_MARGIN = 8
const ADD_BUTTON_WIDTH = ADD_BUTTON_MARGIN + ADD_BUTTON_ICON_WIDTH

type RoadmapPillAreaProps = Pick<
  RoadmapPillProps,
  'index' | 'item' | 'number' | 'assignees' | 'mouseState' | 'titleHtml' | 'titleColumnValue' | 'renderLink' | 'url'
> & {
  /** Used for synchronizing the dragging state of the pill with the drag state of the row */
  setIsDragging: (isDragging: boolean) => void
}

/**
 * RoadmapPillArea includes an item's remaining row area to the right of the table cells.
 * This may render a navigation arrow, an add button, or the visible roadmap pill.
 * */
export const RoadmapPillArea = memo(function RoadmapPillArea({
  item,
  mouseState,
  setIsDragging,
  ...props
}: RoadmapPillAreaProps) {
  const getTimeSpan = useRoadmapGetTimeSpan()
  const getViewport = useRoadmapGetViewport()
  const {getX, getDateFromClientX, totalWidth} = useRoadmapView()
  const {canUpdateItem} = useRoadmapPermissions()
  const {dateFields, getTimeSpanFromColumnData} = useRoadmapSettings()
  const tableWidth = useRoadmapTableWidth()
  const {updateItemDates} = useUpdateRoadmapDates()
  const {roadmapRef} = useRoadmapNavigation()
  const {temporarilyIgnorePillLinkClick} = useRoadmapPillAreaFocus()

  const [pendingTimeSpan, setPendingTimeSpan] = useState<TimeSpan | null>(null)
  const [missingIterationFieldId, setMissingIterationFieldId] = useState<number | undefined>(undefined)

  const timeSpan = useMemo(() => getTimeSpanFromColumnData(item.columns), [item.columns, getTimeSpanFromColumnData])
  const roadmapLeft = roadmapRef.current?.getBoundingClientRect().left ?? 0

  /** Returns the IterationColumnModel if the newTimeSpan is missing an expected iteration value */
  const getMissingIterationField = useCallback(
    (newTimeSpan: TimeSpan) => {
      if (timeSpan.startIteration && !newTimeSpan.startIteration && dateFields[0]) {
        return getIterationField(dateFields[0])
      } else if (timeSpan.endIteration && !newTimeSpan.endIteration && dateFields[1]) {
        return getIterationField(dateFields[1])
      }
    },
    [dateFields, timeSpan],
  )

  /** Save the pill dates if valid, else update state to show the add iteration button */
  const onSaveDate = useCallback(
    (newTimeSpan: TimeSpan) => {
      const missingIterationField = getMissingIterationField(newTimeSpan)
      if (missingIterationField) {
        setMissingIterationFieldId(missingIterationField.id)
        return Promise.resolve()
      } else {
        setPendingTimeSpan(newTimeSpan)
        temporarilyIgnorePillLinkClick()
        return updateItemDates(item, newTimeSpan).finally(() => {
          setPendingTimeSpan(null)
        })
      }
    },
    [getMissingIterationField, item, updateItemDates, temporarilyIgnorePillLinkClick],
  )

  const onCancelDrag = useCallback(() => {
    // Allow extra time to ignore the mouse up event in case the cursor is still over the pill with mouse down
    temporarilyIgnorePillLinkClick(2000)
  }, [temporarilyIgnorePillLinkClick])

  const {allowedOperations, dragProps, dragDetails} = useRoadmapDragAndDrop({
    timeSpan,
    disabled: item.contentType === ItemType.RedactedItem || !!pendingTimeSpan,
    onSaveDate,
    onCancel: onCancelDrag,
  })

  // `dnd-kit` autoscroll does not provide a way to add a buffer to only one side of the scrollable area
  // so we use our own `useAutoScroll` hook to add a buffer to the right side to take into account the
  // table width.
  useAutoScroll({
    active: dragProps.isDragging,
    axis: 'x',
    scrollRef: roadmapRef,
    strength: 20,
    bufferX: [tableWidth, 50],
    bufferY: [20, 20],
    ease: (value: number) => {
      return Math.pow(value, 5)
    },
  })

  // Cancel showing the add iteration button if no longer hovering over an area without one following a drag operation
  useLayoutEffect(() => {
    if (missingIterationFieldId) {
      if (mouseState && mouseState.isHovered && mouseState.mouseX) {
        const isHoveredOverPillArea = mouseState.mouseX > roadmapLeft + tableWidth + ADD_BUTTON_MARGIN
        const hoveredDate = isHoveredOverPillArea ? getDateFromClientX(mouseState.mouseX) : undefined
        const hoverTimeSpan = hoveredDate && getTimeSpan(hoveredDate)
        const hoverMissingIteration = !!(hoverTimeSpan && (!hoverTimeSpan.start || !hoverTimeSpan.end))
        if (!hoverMissingIteration) {
          setMissingIterationFieldId(undefined)
        }
      } else {
        setMissingIterationFieldId(undefined)
      }
    }
  }, [
    mouseState?.isHovered,
    missingIterationFieldId,
    mouseState,
    roadmapLeft,
    tableWidth,
    getDateFromClientX,
    getTimeSpan,
  ])

  useEffect(() => {
    // Synchronize drag state with the parent component, so that we can
    // show this row as being dragged/hovered in the table.
    setIsDragging(dragProps.isDragging)
  }, [dragProps.isDragging, setIsDragging])

  const [startDate, endDate] = getSortedDates([timeSpan.start, timeSpan.end])

  // Absolute positioning within the full, scrollable roadmap width
  const pillOffsetLeft = startDate ? getX(startDate) : 0
  const pillWidth = endDate ? getX(addDays(endDate, 1)) - pillOffsetLeft : 0
  const isBefore = pillOffsetLeft + pillWidth <= 0
  const isAfter = pillOffsetLeft >= totalWidth
  const pillIsInTimeRange = !isBefore && !isAfter
  const hasDates = startDate || endDate
  const isMissingDragIteration = !!(
    dragProps.isDragging &&
    dragDetails &&
    getMissingIterationField(dragDetails.adjustedTimeSpan)
  )

  // Render the Add button if we're hovering over the pill area for an item without any dates set
  // The Add button is also used to add iterations when hovering over an area without one
  const showAddButton = !hasDates && canUpdateItem(item)
  const showIterationsButton = (hasDates && missingIterationFieldId) || isMissingDragIteration
  if ((showAddButton || showIterationsButton) && mouseState && mouseState.isHovered && mouseState.mouseX) {
    const isHoveredOverPillArea = mouseState.mouseX > roadmapLeft + tableWidth + ADD_BUTTON_MARGIN
    let hoveredDate = isHoveredOverPillArea ? getDateFromClientX(mouseState.mouseX) : undefined

    if (hoveredDate) {
      let offsetX: number
      const viewPortLeft = getViewport().left
      const isTodayButtonHover = mouseState.mouseX < roadmapLeft + tableWidth + ADD_BUTTON_WIDTH
      const isDraggingAnotherPill = mouseState.buttonPressedOnEntry && !dragProps.isDragging

      // When hovering over the default Add button, add to today.  Otherwise, add to the hovered date (unless we're dragging another pill).
      if ((isTodayButtonHover && !missingIterationFieldId) || isDraggingAnotherPill) {
        offsetX = viewPortLeft + ADD_BUTTON_MARGIN + ADD_BUTTON_ICON_WIDTH / 2
        hoveredDate = undefined
      } else {
        offsetX = viewPortLeft - roadmapLeft - tableWidth + mouseState.mouseX
      }
      return (
        <AddDateButton
          item={item}
          date={hoveredDate}
          offsetX={offsetX}
          hideTooltip={dragProps.isDragging}
          hidePlaceholder={isDraggingAnotherPill}
        />
      )
    }
  }

  if (isMissingDragIteration) return null

  return pillIsInTimeRange ? (
    <RoadmapPill
      item={item}
      timeSpan={timeSpan}
      allowedOperations={allowedOperations}
      dragProps={dragProps}
      dragDetails={dragDetails}
      pendingTimeSpan={pendingTimeSpan}
      {...props}
    />
  ) : hasDates ? (
    <NavigationArrowWithFocusContext role="gridcell" isBefore={isBefore} startDate={startDate} endDate={endDate} />
  ) : canUpdateItem(item) && !missingIterationFieldId ? (
    <AddDateButton isDefaultAddButton item={item} date={undefined} offsetX={0} />
  ) : null
})

function getIterationField(column: RoadmapColumn) {
  if (column && column !== RoadmapDateFieldNone && isIterationColumnModel(column)) {
    return column
  }
}
