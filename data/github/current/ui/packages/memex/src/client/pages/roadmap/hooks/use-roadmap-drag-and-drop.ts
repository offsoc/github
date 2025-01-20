import {useDndMonitor, useDraggable} from '@github-ui/drag-and-drop'
import {differenceInCalendarDays, isAfter} from 'date-fns'
import {useCallback, useEffect, useMemo, useRef} from 'react'

import {RoadmapDateFieldNone} from '../../../api/view/contracts'
import {assertNever} from '../../../helpers/assert-never'
import type {TimeSpan} from '../../../helpers/roadmap-helpers'
import useBodyClass from '../../../hooks/use-body-class'
import {useRoadmapSettings} from '../../../hooks/use-roadmap-settings'
import {useRoadmapGetViewport, useRoadmapView} from '../roadmap-view-provider'
import {useRoadmapPermissions} from './use-roadmap-permissions'
import {adjustDate, isIteration, useRoadmapPillSpans} from './use-roadmap-pill-spans'

export type RoadmapDragAndDropOperations = 'allowed-drag-update' | 'allowed-drag-expand'
const roadmapDndOperations = new Set(['move', 'expand-leading', 'expand-trailing'] as const)
export type RoadmapDndOperation = SetOptions<typeof roadmapDndOperations>

function isValidRoadmapDndOperation(t: string | undefined | null): t is RoadmapDndOperation {
  return !!t && roadmapDndOperations.has(t as RoadmapDndOperation)
}

type UseRoadmapDragAndDropOptions = {
  timeSpan: TimeSpan
  onSaveDate: (timeSpan: TimeSpan) => Promise<void>
  onCancel: () => void
  disabled: boolean
}

export function useRoadmapDragAndDrop({
  timeSpan: originalTimeSpan,
  onSaveDate,
  onCancel,
  disabled,
}: UseRoadmapDragAndDropOptions) {
  const {getDateFromClientX, getXFromClientX, getDateFromX} = useRoadmapView()
  const getViewport = useRoadmapGetViewport()
  const {dateFields} = useRoadmapSettings()
  const {getNextTimeSpanWithDates, getNextTimeSpanWithIterations, getGhostSpan} = useRoadmapPillSpans()
  const initialDragPosition = useRef<{x: number; date: Date} | null>(null)

  const startColumn = dateFields[0] ?? RoadmapDateFieldNone
  const endColumn = dateFields[1] ?? RoadmapDateFieldNone
  const usesIterations = isIteration(startColumn) || isIteration(endColumn)
  const originalDatesReversed =
    originalTimeSpan.start && originalTimeSpan.end && isAfter(originalTimeSpan.start, originalTimeSpan.end)

  const canUpdate = useRoadmapPermissions().canUpdate && !disabled
  const canExpand =
    canUpdate &&
    !dateFields.some(field => field === RoadmapDateFieldNone) &&
    !(usesIterations && startColumn === endColumn) &&
    !(usesIterations && originalDatesReversed) // Reversed pills with iterations can be corrected by dragging to move first

  const dragProps = useDraggable({
    id: `pill`,
    disabled: !canUpdate,
  })
  const {isDragging, activatorEvent, transform} = dragProps

  useBodyClass('is-dragging', isDragging)

  // resets initial drag position when dragging ends or cancelled
  useEffect(() => {
    if (!isDragging && initialDragPosition.current) {
      initialDragPosition.current = null
    }
  }, [isDragging])

  const allowedOperations = useMemo(() => {
    const ops = new Set<RoadmapDragAndDropOperations>()
    if (canUpdate) {
      ops.add('allowed-drag-update')
    }
    if (canExpand) {
      ops.add('allowed-drag-expand')
    }
    return ops
  }, [canExpand, canUpdate])

  const operation = useMemo(() => {
    if (activatorEvent && activatorEvent.target instanceof HTMLElement) {
      const closest = activatorEvent.target.closest('[data-dnd-operation]')
      if (closest && closest instanceof HTMLElement) {
        const dndOperation = closest.getAttribute('data-dnd-operation')
        if (isValidRoadmapDndOperation(dndOperation)) {
          return dndOperation
        }
      }
    }
    return 'move'
  }, [activatorEvent])

  const getDragDetails = () => {
    const initialClientX = activatorEvent && 'clientX' in activatorEvent ? (activatorEvent.clientX as number) : null
    if (!operation || !initialClientX) return null

    if (!initialDragPosition.current) {
      const initialDragX = getXFromClientX(initialClientX)
      const initialDragDate = getDateFromClientX(initialClientX)
      if (!initialDragDate) return null

      initialDragPosition.current = {x: initialDragX, date: initialDragDate}
    }

    // Limit the drag delta to the viewport so that the pills are not dragged off the screen
    const viewport = getViewport()
    const deltaX = Math.min(
      viewport.right - initialDragPosition.current.x,
      Math.max(viewport.left - initialDragPosition.current.x, transform?.x ?? 0),
    )

    const dateBeingDragged = initialDragPosition.current.date
    const draggedToDate = getDateFromX(initialDragPosition.current.x + deltaX)

    if (!draggedToDate || !dateBeingDragged) return null

    const timeSpan = {...originalTimeSpan}
    if (originalDatesReversed) {
      timeSpan.start = originalTimeSpan.end
      timeSpan.startIteration = originalTimeSpan.endIteration
      timeSpan.end = originalTimeSpan.start
      timeSpan.endIteration = originalTimeSpan.startIteration
    }
    const dayDiff = differenceInCalendarDays(draggedToDate, dateBeingDragged)
    let nextTimeSpan: TimeSpan | undefined
    let swapHandles = false

    if (usesIterations) {
      // Various combination of fields that include any iterations require special handling
      let nextDate: Date
      switch (operation) {
        case 'move': {
          nextDate = draggedToDate
          break
        }
        case 'expand-leading': {
          nextDate = timeSpan.start ? adjustDate(timeSpan.start, dayDiff) : draggedToDate
          break
        }
        case 'expand-trailing': {
          nextDate = timeSpan.end ? adjustDate(timeSpan.end, dayDiff) : draggedToDate
          break
        }
        default: {
          assertNever(operation)
        }
      }

      nextTimeSpan = getNextTimeSpanWithIterations(timeSpan, operation, nextDate)

      // Since we disallow dragging to reverse the order of pills with iterations, the nextTimeSpan may be undefined
      if (!nextTimeSpan) return null
    } else {
      // Else, we're using only simple date field(s)
      const {nextTimeSpan: next, swapHandles: swap} = getNextTimeSpanWithDates(timeSpan, operation, dayDiff)
      nextTimeSpan = next
      swapHandles = swap
    }

    const dragGhostSpan = getGhostSpan(timeSpan, operation, deltaX, swapHandles)

    return {
      operation,
      adjustedTimeSpan: nextTimeSpan,
      dragGhostSpan,
      swapHandles,
    }
  }

  const dragDetails = getDragDetails()

  const onDragEnd = useCallback(async () => {
    if (dragDetails?.adjustedTimeSpan && allowedOperations.has('allowed-drag-update')) {
      await onSaveDate(dragDetails.adjustedTimeSpan)
    }
  }, [allowedOperations, dragDetails?.adjustedTimeSpan, onSaveDate])

  useDndMonitor({
    onDragEnd,
    onDragCancel: onCancel,
  })

  return {
    dragProps,
    allowedOperations,
    dragDetails,
  }
}
