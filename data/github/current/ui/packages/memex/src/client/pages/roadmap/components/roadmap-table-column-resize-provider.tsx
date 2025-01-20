import {
  DndContext,
  type DragCancelEvent,
  type DragEndEvent,
  type DragMoveEvent,
  type KeyboardCodes,
  type KeyboardCoordinateGetter,
  KeyboardSensor,
  PointerSensor,
  restrictToHorizontalAxis,
  useSensor,
  useSensors,
} from '@github-ui/drag-and-drop'
import {memo, useCallback, useMemo, useState} from 'react'

import {useClearTableFocus} from '../../../components/react_table/hooks/use-clear-table-focus'
import {useDeselectAll} from '../../../components/react_table/use-deselect-all'
import {ROADMAP_TITLE_COLUMN_MAX_WIDTH, ROADMAP_TITLE_COLUMN_MIN_WIDTH} from '../../../components/roadmap/constants'
import {shortcutFromEvent, SHORTCUTS} from '../../../helpers/keyboard-shortcuts'
import useBodyClass from '../../../hooks/use-body-class'
import {useRoadmapSettings, useRoadmapTotalFixedColumnWidth} from '../../../hooks/use-roadmap-settings'
import {useRootElement} from '../../../hooks/use-root-element'
import {useRoadmapNavigation, useRoadmapSetIsScrollingLocked, useRoadmapView} from '../roadmap-view-provider'

export const ROADMAP_TABLE_EXPANDING_CLASS = 'is-roadmap-table-expanding-dragging'

const modifiers = [restrictToHorizontalAxis]
const keyboardCodes: KeyboardCodes = {
  start: ['Space', 'Enter'],
  cancel: ['Escape'],
  // we're adding tab as a 'commit' key since we don't expect users need to navigate while dragging
  end: ['Space', 'Enter', 'Tab'],
}

export const RoadmapTableColumnResizeProvider = memo(function RoadmapTableColumnResizeProvider({
  children,
  focusable,
}: {
  children: React.ReactNode
  focusable?: boolean
}) {
  const {columnWidth} = useRoadmapView()
  const {roadmapRef} = useRoadmapNavigation()
  const setIsScrollingLocked = useRoadmapSetIsScrollingLocked()
  const [isDragging, setIsDragging] = useState(false)
  const startDragging = useCallback(() => {
    setIsDragging(true)
    setIsScrollingLocked(true)
  }, [setIsScrollingLocked])
  const endDragging = useCallback(() => {
    setIsDragging(false)
    setIsScrollingLocked(false)
  }, [setIsScrollingLocked])
  const {updateTitleColumnWidth, updateLocalTitleColumnWidth} = useRoadmapSettings()
  const totalFixedColumnsWidth = useRoadmapTotalFixedColumnWidth()

  useBodyClass('is-dragging', isDragging)
  useBodyClass('is-roadmap-table-expanding-dragging', isDragging)

  const deselectAll = useDeselectAll()
  const clearFocus = useClearTableFocus()

  // Calculate the new title column width while dragging (the offset from the left edge of the roadmap table)
  const getNewTitleColumnWidth = useCallback(
    (event: DragMoveEvent | DragEndEvent): number | undefined => {
      const initialActiveRect = event.active.rect.current.initial
      if (!initialActiveRect) return

      const dragDeltaX = event.delta.x
      const initialLeft = Math.floor(initialActiveRect.left + initialActiveRect.width / 2 ?? 0)
      const roadmapLeft = roadmapRef.current?.getBoundingClientRect().left ?? 0
      const newTitleColumnWidth = Math.round(initialLeft + dragDeltaX - totalFixedColumnsWidth - roadmapLeft)

      return Math.min(Math.max(newTitleColumnWidth, ROADMAP_TITLE_COLUMN_MIN_WIDTH), ROADMAP_TITLE_COLUMN_MAX_WIDTH)
    },
    [totalFixedColumnsWidth, roadmapRef],
  )

  // Update local title column width on drag move
  const onDragMove = useCallback(
    (event: DragMoveEvent) => {
      startDragging()
      const newTitleColumnWidth = getNewTitleColumnWidth(event)
      if (!newTitleColumnWidth) return

      updateLocalTitleColumnWidth(newTitleColumnWidth)
      deselectAll()
      clearFocus()
    },
    [clearFocus, deselectAll, getNewTitleColumnWidth, startDragging, updateLocalTitleColumnWidth],
  )

  // Persist the new column width
  const onDragEnd = useCallback(
    async (event: DragEndEvent) => {
      endDragging()
      const newTitleColumnWidth = getNewTitleColumnWidth(event)
      if (!newTitleColumnWidth) return

      try {
        await updateTitleColumnWidth(newTitleColumnWidth)
      } finally {
        // Whether the update succeeds or fails, we want to reset the local state
        // So that we use the persisted value or default on the next render
        updateLocalTitleColumnWidth(null)
      }
    },
    [endDragging, getNewTitleColumnWidth, updateTitleColumnWidth, updateLocalTitleColumnWidth],
  )

  // If the user cancels the dragging operation, reset the local state
  const onDragCancel = useCallback(
    async (_event: DragCancelEvent) => {
      endDragging()
      updateLocalTitleColumnWidth(null)
    },
    [updateLocalTitleColumnWidth, endDragging],
  )

  const coordinateGetter: KeyboardCoordinateGetter = useCallback(
    (event, args) => {
      const {currentCoordinates} = args
      const shortcut = shortcutFromEvent(event)
      switch (shortcut) {
        case SHORTCUTS.ARROW_RIGHT: {
          return {
            ...currentCoordinates,
            x: currentCoordinates.x + columnWidth,
          }
        }
        case SHORTCUTS.ARROW_LEFT: {
          return {
            ...currentCoordinates,
            x: currentCoordinates.x - columnWidth,
          }
        }
      }

      return undefined
    },
    [columnWidth],
  )

  const pointerSensor = useSensor(PointerSensor)
  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter,
    keyboardCodes,
  })

  const sensors = useSensors(pointerSensor, focusable ? keyboardSensor : null)
  const rootElement = useRootElement()
  return (
    <DndContext
      autoScroll={false}
      onDragStart={startDragging}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
      modifiers={modifiers}
      sensors={sensors}
      accessibility={useMemo(() => ({container: rootElement}), [rootElement])}
    >
      {children}
    </DndContext>
  )
})
