import {announce} from '@github-ui/aria-live'
import type {
  Activators,
  Coordinates,
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  KeyboardCodes,
  KeyboardCoordinateGetter,
  KeyboardSensorOptions,
  SensorContext,
  UniqueIdentifier,
} from '@github-ui/drag-and-drop'
import {
  DndContext,
  KeyboardCode,
  KeyboardSensor,
  MouseSensor,
  restrictToFirstScrollableAncestor,
  restrictToVerticalAxis,
  SortableContext,
  useSensor,
  useSensors,
  verticalListSortingStrategy,
} from '@github-ui/drag-and-drop'
import {useLocalStorage} from '@github-ui/use-safe-storage/local-storage'
import debounce from 'lodash-es/debounce'
import {type ReactNode, useCallback, useEffect, useMemo, useState} from 'react'

import {useReturnFocus} from '../../hooks/common/use-return-focus'
import useBodyClass from '../../hooks/use-body-class'
import {useRootElement} from '../../hooks/use-root-element'
import {DragAndDropResources} from '../../strings'
import {closestVerticalCenter} from './closest-vertical-center'
import {DragAndDropContext} from './drag-and-drop-context'
import type {DropSide as DropSideType} from './drop-helpers'
import {DropSide, getDropSideFromEvent} from './drop-helpers'
import {
  HideKeyboardReorderInstructionsModalKey,
  KeyboardReorderInstructionsModal,
} from './keyboard-reorder-instructions-modal'

export const defaultKeyboardCodes: KeyboardCodes = {
  start: [KeyboardCode.Space, KeyboardCode.Enter],
  cancel: [KeyboardCode.Esc],
  end: [KeyboardCode.Space, KeyboardCode.Enter],
}

/**
 * Metadata that will be attached to the draggable element.
 */
export type DragDropMetadata<T> = {id: T}
export type keyboardAndSRSensorOption = Omit<KeyboardSensorOptions, 'onActivation'> & {
  onActivation?({event, returnFocusRef}: {event: KeyboardEvent; returnFocusRef: React.RefObject<HTMLElement>}): void
}

/**
 * Arguments passed to the onDrop callback.
 * @param dragMetadata - Metadata of the dragged item
 * @param dropMetadata - Metadata of the item that was dropped on
 * @param side - Close side of the item that was dropped on
 */
export interface OnDropArgs<T> {
  dragMetadata: DragDropMetadata<T>
  dropMetadata: DragDropMetadata<T>
  side: DropSideType
}

interface VerticalSortableContextProps<T extends string | number> {
  itemIds: Array<T>
  titleMap?: Record<UniqueIdentifier, string>
  children: ReactNode
  onDrop: (args: OnDropArgs<T>) => void
}

const modifiers = [restrictToVerticalAxis, restrictToFirstScrollableAncestor]

const debounceAnnouncement = debounce((announcement: string) => {
  announce(announcement, {assertive: true})
}, 100)

class CustomKeyboardSensor extends KeyboardSensor {
  static override activators: Activators<keyboardAndSRSensorOption> = [
    {
      eventName: 'onKeyDown' as const,
      handler: (event: React.KeyboardEvent, {keyboardCodes = defaultKeyboardCodes, onActivation}, {active}) => {
        const {code} = event.nativeEvent
        if (keyboardCodes.start.includes(code)) {
          const activator = active.activatorNode.current

          if (activator && event.target !== activator) {
            return false
          }
          event.preventDefault()

          onActivation?.({event: event.nativeEvent, returnFocusRef: active.activatorNode})

          return true
        }

        return false
      },
    },
    {
      eventName: 'onClick' as const,
      handler: (event: React.MouseEvent, {onActivation}, {active}) => {
        event.preventDefault()
        const keyboardEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
        })
        onActivation?.({event: keyboardEvent, returnFocusRef: active.activatorNode})

        return true
      },
    },
  ]
}

const emptyAnnouncement = () => ''

/**
 *
 * Used for vertical lists of sortable items, providing a context to
 * retrieve the drop side of the dragged item.
 *
 *
 * @param onDrop - Callback called when a drop occurs
 * @param itemIds - Array of ids of the items in the list
 */
export const VerticalSortableContext = <T extends string | number>({
  onDrop,
  itemIds,
  titleMap = {} as Record<T, string>,
  children,
}: VerticalSortableContextProps<T>) => {
  const [isDragging, setIsDragging] = useState(false)
  const [overIndex, setOverIndex] = useState(0)
  const [hasMoved, setHasMoved] = useState(false)
  const [returnFocusRef, setReturnFocusRef] = useState<React.RefObject<HTMLElement> | null>(null)
  const [dropSide, setDropSide] = useState<DropSideType | null>(null)
  const [overId, setOverId] = useState<T | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [doNotShowAgain] = useLocalStorage(HideKeyboardReorderInstructionsModalKey, false)
  useReturnFocus(isModalOpen, returnFocusRef)
  useBodyClass('is-dragging', isDragging)

  const onInstructionsClose = useCallback(() => {
    setIsModalOpen(false)
    setIsDragging(true)
  }, [])

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (!event.active) return
      announce(DragAndDropResources.instructions(titleMap[event.active.id] ?? event.active.id), {assertive: true})
      const dragMetadata = event.active.data.current?.metadata as DragDropMetadata<T>
      setOverId(dragMetadata?.id ?? null)
      setOverIndex((event.active.data.current?.sortable.index as number) ?? 0)

      setDropSide(DropSide.BEFORE)
    },
    [titleMap],
  )

  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      const overMetadata = event.over?.data.current?.metadata as DragDropMetadata<T>
      const over = overMetadata?.id ?? null
      const newDropSide = getDropSideFromEvent(event)
      setDropSide(newDropSide)
      setOverId(over)
      setHasMoved(true)
      setIsDragging(true)

      if (event.over && event.over.data.current) {
        let positionIndex: number = event.over.data.current.sortable.index

        if (newDropSide === DropSide.AFTER && positionIndex === itemIds.length - 1) {
          positionIndex++
        }

        setOverIndex(positionIndex)
      }
    },
    [itemIds],
  )

  /* Announce the drag item's current location when it changes */
  useEffect(() => {
    if (isDragging && hasMoved) {
      if (overIndex === 0) {
        debounceAnnouncement(DragAndDropResources.firstItemInList)
      } else if (overIndex === itemIds.length) {
        debounceAnnouncement(DragAndDropResources.lastItemInList)
      } else {
        const itemA = itemIds[overIndex - 1] as T
        const itemB = itemIds[overIndex] as T
        debounceAnnouncement(DragAndDropResources.movedBetween(titleMap[itemA], titleMap[itemB]))
      }
    }
  }, [isDragging, hasMoved, overIndex, titleMap, itemIds])

  const handleDragCancel = useCallback(
    (event: DragEndEvent) => {
      announce(`${titleMap[event.active.id] ?? event.active.id} not moved.`, {assertive: true})
      setIsDragging(false)
      setHasMoved(false)
    },
    [titleMap],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setIsDragging(false)
      setHasMoved(false)

      if (!event.active || !event.over) return

      const dragMetadata = event.active.data.current?.metadata as DragDropMetadata<T>
      const dropMetadata = event.over.data.current?.metadata as DragDropMetadata<T>

      if (dragMetadata?.id !== dropMetadata?.id && dropSide) {
        onDrop({dragMetadata, dropMetadata, side: dropSide})
      }
      setOverId(null)

      if (overIndex === 0)
        announce(DragAndDropResources.successfulMoveTop(titleMap[event.active.id] ?? ''), {assertive: true})
      else if (overIndex === itemIds.length)
        announce(DragAndDropResources.successfulMoveBottom(titleMap[event.active.id] ?? ''), {assertive: true})
      else {
        const itemA = itemIds[overIndex - 1] as T
        const itemB = itemIds[overIndex] as T
        announce(
          DragAndDropResources.successfulMove(titleMap[event.active.id] ?? '', titleMap[itemA], titleMap[itemB]),
          {assertive: true},
        )
      }
    },
    [onDrop, dropSide, titleMap, itemIds, overIndex],
  )

  const moveToPosition = useCallback(
    (currentPosition: number, newPosition: number, before: boolean) => {
      setOverId(itemIds[newPosition] ?? null)
      const drag = itemIds[currentPosition]
      const drop = itemIds[newPosition]
      if (drag && drop) {
        onDrop({
          dragMetadata: {id: drag},
          dropMetadata: {id: drop},
          side: before ? DropSide.BEFORE : DropSide.AFTER,
        })
      }
    },
    [itemIds, onDrop],
  )

  const rootElement = useRootElement()

  const verticalCoordinatesGetter: KeyboardCoordinateGetter = useCallback(
    (
      event: KeyboardEvent,
      args: {
        active: UniqueIdentifier
        currentCoordinates: Coordinates
        context: SensorContext
      },
    ) => {
      const {currentCoordinates, context} = args
      const delta = context.active?.rect.current.initial?.height ?? 25
      const coordinates = {...currentCoordinates}
      switch (event.code) {
        case 'ArrowDown':
          coordinates.y = coordinates.y + delta
          break
        case 'ArrowUp':
          coordinates.y = coordinates.y - delta
          break
        case 'ArrowRight':
          coordinates.y = coordinates.y + delta
          break
        case 'ArrowLeft':
          coordinates.y = coordinates.y - delta
          break
        case 'Tab':
          // Prevent the browser from changing the focus
          event.preventDefault()
          break
        default:
          return undefined
      }

      const sashPositions = []
      const rects = Array.from(context.droppableRects.values())
      for (const rect of rects) {
        sashPositions.push(rect.top)

        if (rects[rects.length - 1] === rect) {
          sashPositions.push(rect.bottom)
        }
      }

      // Get closest position to current coordinates
      coordinates.y = sashPositions.reduce((prev, curr) => {
        return Math.abs(curr - coordinates.y) < Math.abs(prev - coordinates.y) ? curr : prev
      })

      return coordinates
    },
    [],
  )

  const onActivation = useMemo(() => {
    return ({returnFocusRef: ref}: {returnFocusRef: React.RefObject<HTMLElement>}) => {
      if (!hasMoved && !doNotShowAgain) {
        setIsModalOpen(true)
        setReturnFocusRef(ref)
      }
    }
  }, [doNotShowAgain, setReturnFocusRef, hasMoved])

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor<keyboardAndSRSensorOption>(CustomKeyboardSensor, {
      coordinateGetter: verticalCoordinatesGetter,
      onActivation,
    }),
  )

  return (
    <>
      <KeyboardReorderInstructionsModal isOpen={isModalOpen} onClose={onInstructionsClose} />
      <DndContext
        collisionDetection={closestVerticalCenter}
        modifiers={modifiers}
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragOver={handleDragMove}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        accessibility={useMemo(
          () => ({
            container: rootElement,
            announcements: {
              // Clear announcements to use custom github announcer
              onDragStart: emptyAnnouncement,
              onDragOver: emptyAnnouncement,
              onDragMove: emptyAnnouncement,
              onDragEnd: emptyAnnouncement,
              onDragCancel: emptyAnnouncement,
            },
          }),
          [rootElement],
        )}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <DragAndDropContext.Provider
            value={useMemo(() => ({dropSide, overId, moveToPosition}), [dropSide, overId, moveToPosition])}
          >
            {children}
          </DragAndDropContext.Provider>
        </SortableContext>
      </DndContext>
    </>
  )
}
