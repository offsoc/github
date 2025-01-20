import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  restrictToFirstScrollableAncestor,
  restrictToVerticalAxis,
  useSensor,
  useSensors,
} from '@github-ui/drag-and-drop'
import {memo, useCallback, useMemo, useState} from 'react'

import type {GroupingMetadataWithSource} from '../../../features/grouping/types'
import {closestVerticalCenter} from '../../../helpers/dnd-kit/closest-vertical-center'
import {getVerticalDropSide} from '../../../helpers/dnd-kit/drop-helpers'
import useBodyClass from '../../../hooks/use-body-class'
import {DroppableGroupData} from '../../../hooks/use-droppable-group'
import {useRootElement} from '../../../hooks/use-root-element'
import {useClearTableFocus} from '../hooks/use-clear-table-focus'
import {useTableInstance} from '../table-provider'
import {useDeselectAll} from '../use-deselect-all'
import {DroppedItemIdContext} from './dropped-item-id-context'
import {useRowDropHandler} from './hooks/use-row-drop-handler'
import {ReorderableRowData} from './reorderable-rows'

const modifiers = [restrictToVerticalAxis, restrictToFirstScrollableAncestor]

const autoScrollConfig = {threshold: {x: 0, y: 0.2}}

interface RowReorderingProviderProps {
  children: React.ReactNode
}

/** Provides the drag-and-drop context for sortable rows. Define once for entire table. */
export const RowReorderingProvider = memo(function RowReorderingProvider({children}: RowReorderingProviderProps) {
  const clearFocus = useClearTableFocus()

  const table = useTableInstance()
  const deselectAll = useDeselectAll()

  const [isDragging, setIsDragging] = useState(false)
  const [droppedItemId, setDroppedItemId] = useState<number | null>(null)

  const getItemById = useCallback(
    (itemId: number) => table.flatRows.find(r => r.original.id === itemId)?.original,
    [table],
  )

  const getGroupWithValue = useCallback(
    (groupedValue: string): GroupingMetadataWithSource | undefined => {
      const groupRow = table.groupedRows?.find(row => row.groupedValue === groupedValue)

      return (
        groupRow && {
          sourceObject: groupRow.groupedSourceObject,
          value: groupRow.groupedValue,
        }
      )
    },
    [table],
  )

  useBodyClass('is-dragging', isDragging)

  const handleDrop = useRowDropHandler()

  const handleDragStart = useCallback(() => {
    setIsDragging(true)
    deselectAll()
    clearFocus()
  }, [deselectAll, clearFocus])

  const handleDragCancel = useCallback(() => setIsDragging(false), [])

  const handleDragEnd = useCallback(
    async ({over, active}: DragEndEvent) => {
      setIsDragging(false)

      const activeData = active.data.current
      if (!ReorderableRowData.is(activeData)) return

      setDroppedItemId(activeData.originalItemId)

      const activeItem = getItemById(activeData.originalItemId)
      const activeItemGroup = getGroupWithValue(activeData.sortable.containerId)
      if (!activeItem) return

      const overData = over?.data.current

      // Items can either be dropped on another row (ReorderableRowData) or an empty/collapsed group (DroppableGroupData)
      if (ReorderableRowData.is(overData)) {
        const overItem = getItemById(overData.originalItemId)
        const side = getVerticalDropSide(active, over)
        const overItemGroup = getGroupWithValue(overData.sortable.containerId)

        if (!overItem || !side) return

        await handleDrop({
          activeItem,
          activeItemGroup,
          overItemGroup,
          overItem,
          side,
        })
      } else if (DroppableGroupData.is(overData)) {
        const overItemGroup = getGroupWithValue(overData.groupedValue)

        if (!overItemGroup || !activeItemGroup) return

        await handleDrop({
          activeItem,
          activeItemGroup,
          overItemGroup,
        })
      }

      // The dropped item state is only used to highlight the row until it can be selected, which happens after it
      // moves in `handleDrop`. Resetting the state here ensures that there won't be an extra highlighted row when
      // the user changes the selection.
      setDroppedItemId(null)
    },
    [getItemById, getGroupWithValue, handleDrop],
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4, // constraint ensure that draggable areas can still support click events
      },
    }),
  )
  const rootElement = useRootElement()
  return (
    <DndContext
      collisionDetection={closestVerticalCenter}
      modifiers={modifiers}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      autoScroll={autoScrollConfig}
      sensors={sensors}
      accessibility={useMemo(() => ({container: rootElement}), [rootElement])}
    >
      <DroppedItemIdContext.Provider value={droppedItemId}>{children}</DroppedItemIdContext.Provider>
    </DndContext>
  )
})
