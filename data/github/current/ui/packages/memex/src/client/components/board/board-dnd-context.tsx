import {
  DndContext,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@github-ui/drag-and-drop'
import {type RefObject, useCallback, useMemo, useRef} from 'react'
import invariant from 'tiny-invariant'

import {CardMove, CardMoveUI} from '../../api/stats/contracts'
import {DropSide, getDropSideFromEvent} from '../../helpers/dnd-kit/drop-helpers'
import {usePostStats} from '../../hooks/common/use-post-stats'
import {cleanSashState, setSashState} from '../../hooks/drag-and-drop/transformation'
import {useRootElement} from '../../hooks/use-root-element'
import {useSortedBy} from '../../hooks/use-sorted-by'
import type {MemexItemModel} from '../../models/memex-item-model'
import {StatsNoValueGroupId, type VerticalGroup} from '../../models/vertical-group'
import {useBoardContext} from './board-context'
import {useBoardCardActions} from './hooks/use-board-card-actions'
import {DragStateActionTypes, useBoardDndReducer} from './hooks/use-board-dnd-reducer'
import {useCardSelection} from './hooks/use-card-selection'
import {focusCard, useStableBoardNavigation} from './navigation'

export const BoardDndEventTypes = {
  CARD: 'card',
  COLUMN: 'column',
} as const
type BoardDndEventTypes = ObjectValues<typeof BoardDndEventTypes>

export type BoardDndCardEventData = {
  type: 'card'
  item: MemexItemModel
  ref: RefObject<HTMLElement | null>
  /** The column (field) that this card is in */
  verticalGroup: VerticalGroup
  /** Index of the column that this card is in, among all of the columns */
  columnIndex: number
  horizontalGroupIndex: number
}

type BoardDndColumnEventData = {
  type: 'column'
  verticalGroup: VerticalGroup
  ref: RefObject<HTMLElement | null>
  /** The index of the column within the column list */
  index: number
  horizontalGroupIndex: number
}

export type BoardDndEventData = BoardDndCardEventData | BoardDndColumnEventData

export function isBoardDndEventData(data: unknown): data is BoardDndEventData {
  if (!data) return false
  if (!(typeof data === 'object')) return false
  if (!('type' in data)) return false
  if (!(typeof data.type === 'string')) return false
  return data.type === BoardDndEventTypes.CARD || data.type === BoardDndEventTypes.COLUMN
}

export function isBoardDndCardData(data: unknown): data is BoardDndCardEventData {
  return isBoardDndEventData(data) && data.type === BoardDndEventTypes.CARD
}

export function isBoardDndColumnData(data: unknown): data is BoardDndColumnEventData {
  return isBoardDndEventData(data) && data.type === BoardDndEventTypes.COLUMN
}

export function BoardDndContext({
  children,
  setDraggingItem,
}: {
  children: React.ReactNode
  setDraggingItem: (card: MemexItemModel | null) => void
}) {
  const {groupedItems} = useBoardContext()
  const {moveCard, moveCards} = useBoardCardActions()
  const {resetSelection, filteredSelectedCards} = useCardSelection()
  const {navigationDispatch} = useStableBoardNavigation()
  const [{dropId, dropSide}, dispatch] = useBoardDndReducer()
  const {postStats} = usePostStats()

  const {isSorted} = useSortedBy()
  const disableSash = isSorted || filteredSelectedCards.length > 1

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2, // constraint to ensure that a click does not get registered as drag
      },
    }),
  )
  const rootElement = useRootElement()

  // There appears to be a race condition where a drag move event is
  // is occasionally triggered after a drag end event.
  // This ref is used to ensure a move does cause a dispatch
  // after the drag has ended.
  const isDraggingRef = useRef(false)

  const resetState = useCallback(() => {
    setDraggingItem(null) // clears the item being dragged
    dispatch({type: DragStateActionTypes.RESET_STATE}) // resets the dropId/dropSide
    requestAnimationFrame(() => {
      cleanSashState() // clears the sash classes of the source card
    })
    isDraggingRef.current = false
  }, [dispatch, setDraggingItem])

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      resetState()

      const dragData: unknown = event.active.data.current
      const dropData: unknown = event.over?.data.current

      if (isBoardDndCardData(dropData) && isBoardDndCardData(dragData)) {
        const dragHorizontalGroup = groupedItems.horizontalGroups[dragData.horizontalGroupIndex]
        const horizontalGroup = groupedItems.horizontalGroups[dropData.horizontalGroupIndex]
        invariant(dragHorizontalGroup)
        invariant(horizontalGroup)

        // Case 1: dropping a card onto another card
        const itemsInVerticalGroup = horizontalGroup.itemsByVerticalGroup[dropData.verticalGroup.id]?.items ?? []
        const [cardId, side] = getDropTarget(
          itemsInVerticalGroup,
          dropId ? Number(dropId) : undefined,
          dropSide === DropSide.BEFORE ? 'top' : 'bottom',
        )
        navigationDispatch(focusCard(dropData.horizontalGroupIndex, dropData.columnIndex, dragData.item.id))

        if (filteredSelectedCards.length > 1) {
          moveCards(filteredSelectedCards, dropData.verticalGroup, dragHorizontalGroup, horizontalGroup)
        } else {
          moveCard(
            dragData.item,
            cardId,
            side,
            dropData.verticalGroup,
            dragData.verticalGroup.id,
            dragHorizontalGroup,
            horizontalGroup,
          )
        }

        postStats({
          name: CardMove,
          ui: CardMoveUI.MouseMove,
          context: JSON.stringify({
            fieldId: dropData.verticalGroup.groupMetadata?.id ?? StatsNoValueGroupId,
            ...(filteredSelectedCards.length > 1
              ? {itemIds: filteredSelectedCards.map(i => i.id)}
              : {itemId: dragData.item.id}),
          }),
        })
      } else if (isBoardDndColumnData(dropData) && isBoardDndCardData(dragData)) {
        const dragHorizontalGroup = groupedItems.horizontalGroups[dragData.horizontalGroupIndex]
        const horizontalGroup = groupedItems.horizontalGroups[dropData.horizontalGroupIndex]
        invariant(dragHorizontalGroup)
        invariant(horizontalGroup)

        // Case 2: dropping a card onto a column
        navigationDispatch(focusCard(dropData.horizontalGroupIndex, dropData.index, dragData.item.id))

        if (filteredSelectedCards.length > 1) {
          moveCards(filteredSelectedCards, dropData.verticalGroup, dragHorizontalGroup, horizontalGroup)
        } else {
          moveCard(
            dragData.item,
            dropId,
            'bottom',
            dropData.verticalGroup,
            dragData.verticalGroup.id,
            dragHorizontalGroup,
            horizontalGroup,
          )
        }

        postStats({
          name: CardMove,
          ui: CardMoveUI.MouseMove,
          context: JSON.stringify({
            fieldId: dropData.verticalGroup.groupMetadata?.id ?? StatsNoValueGroupId,
            ...(filteredSelectedCards.length > 1
              ? {itemIds: filteredSelectedCards.map(i => i.id)}
              : {itemId: dragData.item.id}),
          }),
        })
      }
    },
    [
      resetState,
      dropId,
      dropSide,
      navigationDispatch,
      filteredSelectedCards,
      postStats,
      moveCards,
      moveCard,
      groupedItems.horizontalGroups,
    ],
  )

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      // Card selection should reset when dragging starts unless multiple items are selected
      if (filteredSelectedCards.length <= 1) {
        resetSelection()
      }
      isDraggingRef.current = true

      const dragData: unknown = event.active.data.current
      if (isBoardDndCardData(dragData)) {
        setDraggingItem(dragData.item)
      }
    },
    [resetSelection, filteredSelectedCards.length, setDraggingItem],
  )

  const onDragCancel = useCallback(() => resetState(), [resetState])

  const onDragMove = useCallback(
    (event: DragMoveEvent) => {
      // If the drag is not over a droppable element, clear the sash
      if (!event.over || !isDraggingRef.current) {
        cleanSashState()
        return
      }

      // Find the closest element that has a draggable attribute, then get the drag ID attribute
      // from it, and use that as the element to drop before/after
      const overData: unknown = event.over?.data.current

      if (!overData) {
        dispatch({type: DragStateActionTypes.RESET_STATE}) // clear dropId when not over a droppable element
        return
      }

      if (isBoardDndCardData(overData)) {
        const currentDropId = overData?.item.id
        const side = getDropSideFromEvent(event)

        if (overData.ref.current && currentDropId) {
          dispatch({type: DragStateActionTypes.SET_DROP, dropId: currentDropId, dropSide: side})
          if (!disableSash) setSashState(overData.ref.current, side, BoardDndEventTypes.CARD)
        }
      } else if (isBoardDndColumnData(overData)) {
        const horizontalGroup = groupedItems.horizontalGroups[overData.horizontalGroupIndex]
        invariant(horizontalGroup)
        // If hovering over the column (empty space), then just place on bottom by default
        const currentDropId = horizontalGroup.itemsByVerticalGroup[overData.verticalGroup.id]?.items.at(-1)?.id
        const lastElement = currentDropId
          ? document.querySelector<HTMLElement>(`[data-board-card-id="${currentDropId}"]`)
          : undefined

        const side = DropSide.AFTER
        dispatch({type: DragStateActionTypes.SET_DROP, dropId: currentDropId, dropSide: side})

        if (!disableSash && lastElement) {
          setSashState(lastElement, side, BoardDndEventTypes.CARD)
        } else {
          cleanSashState()
        }
      }
    },
    [disableSash, dispatch, groupedItems.horizontalGroups],
  )

  return (
    <DndContext
      sensors={sensors}
      autoScroll={false}
      accessibility={useMemo(() => ({container: rootElement}), [rootElement])}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      {children}
    </DndContext>
  )
}

/**
 * Given a list of items, return the correct item and side to ensure we are
 * always dropping above an item, instead of below, if possible.
 */
function getDropTarget(
  items: ReadonlyArray<MemexItemModel>,
  dropID: number | undefined,
  dropSide: 'top' | 'bottom',
): [number | undefined, 'top' | 'bottom'] {
  if (dropID == null || dropSide === 'top') return [dropID, dropSide]

  const dropIndex = items.findIndex(({id}) => id === dropID)
  const nextItem = items[dropIndex + 1]

  if (nextItem) {
    return [nextItem.id, 'top']
  } else {
    return [dropID, dropSide]
  }
}
