import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragMoveEvent,
  DragOverlay,
  type DragStartEvent,
  type KeyboardCodes,
  type KeyboardSensorOptions,
  MouseSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {restrictToHorizontalAxis, restrictToVerticalAxis} from '@dnd-kit/modifiers'
import {
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {announce} from '@github-ui/aria-live'
import {ssrSafeDocument} from '@github-ui/ssr-utils'
import {testIdProps} from '@github-ui/test-id-props'
import {useClientValue} from '@github-ui/use-client-value'
import {usePrefersReducedMotion} from '@github-ui/use-prefers-reduced-motion'
import {useLocalStorage} from '@github-ui/use-safe-storage/local-storage'
import {clsx} from 'clsx'
import {type HTMLAttributes, useCallback, useEffect, useMemo, useState} from 'react'
import {createPortal} from 'react-dom'

import {DragAndDropContext} from '../context/DragAndDropContext'
import {useBodyClass} from '../hooks/use-body-class'
import {useRootElement} from '../hooks/use-root-element'
import {debounceAnnouncement, defaultAnnouncementsOff, successfulMoveAnnouncement} from '../utils/announcements'
import {closestVerticalCenter, CustomKeyboardSensor} from '../utils/dnd-utils'
import {DragAndDropResources} from '../utils/strings'
import type {DragAndDropDirection, DragDropMetadata, OnDropArgs} from '../utils/types'
import {DragAndDropMoveModal} from './DragAndDropMoveModal'
import {
  HideKeyboardSpecificInstructionsModalKey,
  KeyboardSpecificInstructionsModal,
} from './KeyboardSpecificInstructionsModal'
import styles from './SortableListContainer.module.css'

interface SortableContainerProps<T extends string | number, K extends {id: T; title: string}>
  extends Omit<HTMLAttributes<HTMLUListElement>, 'onDrop'> {
  /**
   * Array of ids and titles of the items
   */
  items: K[]
  /**
   * Direction of the list, defaults to vertical
   */
  direction?: DragAndDropDirection
  /**
   * Callback called when a drop occurs
   */
  onDrop: (args: OnDropArgs<T>) => void
  /**
   * Component type to render for drag and drop container
   */
  as?: React.ElementType
  /**
   * Render function for overlay
   */
  renderOverlay: (item: K, index: number) => React.ReactNode
  /**
   * Keyboard codes to use for drag and drop
   */
  keyboardCodes?: KeyboardCodes
}

/**
 * A container for a list of sortable items. This component is responsible for
 * managing the drag and drop state and passing it down to the items.
 *
 * @param props SortableContainerProps
 */
export const SortableListContainer = <T extends string | number, K extends {id: T; title: string}>({
  onDrop,
  items,
  direction = 'vertical',
  children,
  as: As = 'ul',
  renderOverlay,
  keyboardCodes,
  ...htmlULprops
}: SortableContainerProps<T, K>) => {
  const [isDragging, setIsDragging] = useState(false)
  const [overIndex, setOverIndex] = useState(0)
  const [hasMoved, setHasMoved] = useState(false)
  const [dragIndex, setDragIndex] = useState(0)
  const [overId, setOverId] = useState<T | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [doNotShowAgain] = useLocalStorage(HideKeyboardSpecificInstructionsModalKey, false)
  const [isKeyboardDragging, setIsKeyboardDragging] = useState(false)
  const [moveModalItem, setMoveModalItem] = useState<{title: string; index: number} | null>(null)
  const itemIds = items.map(item => item.id)
  const titleMap = useMemo(() => {
    return items.reduce(
      (map, item) => {
        map[item.id] = item.title
        return map
      },
      {} as Record<T, string>,
    )
  }, [items])

  useBodyClass('is-dragging', isDragging)
  useBodyClass(styles.isKeyboardDragging, isKeyboardDragging)
  const prefersReducedMotion = usePrefersReducedMotion()

  const onInstructionsClose = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (!event.active) return
      announce(DragAndDropResources.instructions(titleMap[event.active.id as T] ?? event.active.id), {assertive: true})
      const dragMetadata = event.active.data.current?.metadata as DragDropMetadata<T>
      setOverId(dragMetadata?.id ?? null)
      setDragIndex((event.active.data.current?.sortable.index as number) ?? 0)
      setOverIndex((event.active.data.current?.sortable.index as number) ?? 0)

      setIsDragging(true)
    },
    [titleMap],
  )

  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      const overMetadata = event.over?.data.current?.metadata as DragDropMetadata<T>
      const over = overMetadata?.id ?? null
      setOverId(over)

      if (!hasMoved) {
        setHasMoved(true)
      }

      if (event.over && event.over.data.current) {
        const positionIndex: number = event.over.data.current.sortable.index

        setOverIndex(positionIndex)
      }
    },
    [hasMoved],
  )

  /* Announce the drag item's current location when it changes */
  useEffect(() => {
    if (isDragging && hasMoved) {
      if (overIndex === 0) {
        debounceAnnouncement(DragAndDropResources.firstItemInList)
      } else if (overIndex === itemIds.length - 1) {
        debounceAnnouncement(DragAndDropResources.lastItemInList)
      } else {
        const isBefore = overIndex <= dragIndex
        const originalPlacement = overIndex === dragIndex
        const itemA = isBefore ? (itemIds[overIndex - 1] as T) : (itemIds[overIndex + 1] as T)
        const itemB = originalPlacement ? (itemIds[overIndex + 1] as T) : (itemIds[overIndex] as T)
        debounceAnnouncement(DragAndDropResources.movedBetween(titleMap[itemA], titleMap[itemB]))
      }
    }
  }, [isDragging, hasMoved, overIndex, titleMap, itemIds, dragIndex])

  const handleDragCancel = useCallback(
    (event: DragEndEvent) => {
      announce(`${titleMap[event.active.id as T] ?? event.active.id} not moved.`, {assertive: true})
      setIsDragging(false)
      setIsKeyboardDragging(false)
      setHasMoved(false)
      setTimeout(() => {
        document.activeElement?.scrollIntoView({
          behavior: prefersReducedMotion ? 'instant' : 'smooth',
          block: 'nearest',
        })
      }, 1)
    },
    [titleMap, prefersReducedMotion],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setIsDragging(false)
      setIsKeyboardDragging(false)
      setHasMoved(false)

      if (!event.active || !event.over) return

      const dragMetadata = event.active.data.current?.metadata as DragDropMetadata<T>
      const dropMetadata = event.over.data.current?.metadata as DragDropMetadata<T>

      if (dragMetadata?.id !== dropMetadata?.id) {
        const isBefore = overIndex < dragIndex
        onDrop({dragMetadata, dropMetadata, isBefore})
      }
      setOverId(null)
      successfulMoveAnnouncement({
        newIndex: overIndex,
        currentIndex: dragIndex,
        items,
        title: titleMap[event.active.id as T],
      })
    },
    [overIndex, dragIndex, items, titleMap, onDrop],
  )

  const moveToPosition = useCallback(
    (currentPosition: number, newPosition: number, isBefore?: boolean) => {
      setOverId(itemIds[newPosition] ?? null)
      const drag = itemIds[currentPosition]
      const drop = itemIds[newPosition]
      if (drag && drop) {
        onDrop({
          dragMetadata: {id: drag},
          dropMetadata: {id: drop},
          isBefore: isBefore ?? newPosition < currentPosition,
        })
      }
    },
    [itemIds, onDrop],
  )

  const rootElement = useRootElement()

  const onActivation = useMemo(() => {
    return () => {
      if (!hasMoved && !doNotShowAgain) {
        setIsModalOpen(true)
      }
      setIsKeyboardDragging(true)
    }
  }, [doNotShowAgain, hasMoved])

  const onOpenMoveModal = useCallback((title: string, index: number) => {
    setMoveModalItem({title, index})
  }, [])

  const onCloseMoveModal = useCallback(() => {
    setMoveModalItem(null)
  }, [])

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor<KeyboardSensorOptions>(CustomKeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes,
      onActivation,
    }),
  )

  const dragItem = items[dragIndex]
  const [body] = useClientValue<HTMLElement | null>(() => document.body, null, [ssrSafeDocument?.body])

  return (
    <>
      <KeyboardSpecificInstructionsModal
        isOpen={isModalOpen}
        onClose={onInstructionsClose}
        direction={direction}
        keyboardCodes={keyboardCodes}
      />
      <DndContext
        collisionDetection={useMemo(
          () => (direction === 'horizontal' ? closestCorners : closestVerticalCenter),
          [direction],
        )}
        modifiers={useMemo(() => {
          return direction === 'horizontal' ? [restrictToHorizontalAxis] : [restrictToVerticalAxis]
        }, [direction])}
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragMove}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        accessibility={useMemo(
          () => ({
            container: rootElement,
            announcements: defaultAnnouncementsOff,
          }),
          [rootElement],
        )}
      >
        <SortableContext
          items={itemIds}
          strategy={useMemo(
            () => (direction === 'horizontal' ? horizontalListSortingStrategy : verticalListSortingStrategy),
            [direction],
          )}
        >
          <DragAndDropContext.Provider
            value={useMemo(
              () => ({
                overId,
                dragIndex,
                moveToPosition,
                items,
                direction,
                openMoveModal: onOpenMoveModal,
                moveModalItem,
                isInDragMode: isDragging && !isModalOpen,
              }),
              [
                overId,
                dragIndex,
                moveToPosition,
                items,
                direction,
                onOpenMoveModal,
                moveModalItem,
                isDragging,
                isModalOpen,
              ],
            )}
          >
            {moveModalItem && <DragAndDropMoveModal closeDialog={onCloseMoveModal} />}
            <As
              {...htmlULprops}
              className={clsx(styles.container)}
              {...testIdProps('sortable-list')}
              // to prevent tabbing out when dragging
              onKeyDown={(event: KeyboardEvent) => {
                if (isDragging && event.code === 'Tab') event.preventDefault()
              }}
            >
              {children}
            </As>
            {body
              ? createPortal(
                  <DragOverlay dropAnimation={null} className={clsx(styles.container)}>
                    {dragItem && !isModalOpen ? renderOverlay(dragItem, dragIndex) : null}
                  </DragOverlay>,
                  body,
                )
              : null}
          </DragAndDropContext.Provider>
        </SortableContext>
      </DndContext>
    </>
  )
}
