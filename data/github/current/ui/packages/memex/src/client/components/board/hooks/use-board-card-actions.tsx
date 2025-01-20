import {createContext, useCallback, useContext, useMemo} from 'react'

import type {UpdateColumnValueAction} from '../../../api/columns/contracts/domain'
import {
  MemexColumnDataType,
  type MemexProjectColumnId,
  type SystemColumnId,
} from '../../../api/columns/contracts/memex-column'
import {DropSide} from '../../../helpers/dnd-kit/drop-helpers'
import {isSingleSelectOrIterationColumnValue} from '../../../helpers/parsing'
import {useGetUpdateForGroupDropEvent} from '../../../hooks/drag-and-drop/use-group-drop-handler'
import {useBulkUpdateItems} from '../../../hooks/use-bulk-update-items'
import {useEnabledFeatures} from '../../../hooks/use-enabled-features'
import {buildUpdateItemActions, useUpdateAndReorderItem} from '../../../hooks/use-update-item'
import type {HorizontalGroup} from '../../../models/horizontal-group'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {MissingVerticalGroupId, type VerticalGroup} from '../../../models/vertical-group'
import type {ReorderItemData} from '../../../state-providers/memex-items/types'
import {useBoardItems} from './use-board-items'

export const CardPositionType = {
  TOP: 'top',
  BOTTOM: 'bottom',
} as const
export type CardPositionType = ObjectValues<typeof CardPositionType>

type BoardCardActionsContextType = {
  /** Reorders a card within a column, and optionally moves it to a new column */
  moveCard: (
    cardToMove: MemexItemModel,
    previousCardId: number | undefined,
    side: 'top' | 'bottom',
    newVerticalGroup?: VerticalGroup,
    oldVerticalGroupId?: string,
    dragHorizontalGroup?: HorizontalGroup,
    dropHorizontalGroup?: HorizontalGroup,
  ) => Promise<void>
  /** Moves multiple cards to a new column */
  moveCards: (
    selectedItems: Array<MemexItemModel>,
    newVerticalGroup: VerticalGroup,
    dragHorizontalGroup?: HorizontalGroup,
    dropHorizontalGroup?: HorizontalGroup,
  ) => Promise<void>
  /** Moves a card to the top or bottom position within its current column */
  moveCardToPosition: (cardToMoveId: number, verticalGroupId: string, position: 'top' | 'bottom') => Promise<void>
}

const BoardCardActionsContext = createContext<BoardCardActionsContextType | null>(null)

export const BoardCardActionsProvider: React.FC<{
  groupByFieldId: number | typeof SystemColumnId.Status
  horizontalGroupByFieldId: MemexProjectColumnId | undefined
  children: React.ReactNode
}> = ({groupByFieldId, horizontalGroupByFieldId, children}) => {
  const {updateAndReorderItem} = useUpdateAndReorderItem()
  const {groupedItems} = useBoardItems()
  const {bulkUpdateMultipleColumnValues} = useBulkUpdateItems()
  const {getUpdateForGroupDropEvent, handleGroupDropRequestError} = useGetUpdateForGroupDropEvent()
  const {memex_table_without_limits} = useEnabledFeatures()

  const moveCardMWLDisabled = useCallback(
    async (
      cardToMove: MemexItemModel,
      previousCardId: number | undefined,
      side: 'top' | 'bottom',
      newVerticalGroup?: VerticalGroup,
      _oldVerticalGroupId?: string,
      dragHorizontalGroup?: HorizontalGroup,
      dropHorizontalGroup?: HorizontalGroup,
    ) => {
      // skip if we're over the same card
      if (cardToMove.id === previousCardId) {
        return
      }

      const updateColumnActions: Array<UpdateColumnValueAction> = []
      let horizontalGroupActionFailed = false

      if (
        dragHorizontalGroup?.sourceObject &&
        dropHorizontalGroup?.sourceObject &&
        dragHorizontalGroup.value !== dropHorizontalGroup.value
      ) {
        const columnAction = await getUpdateForGroupDropEvent({
          activeItem: cardToMove,
          activeItemGroup: dragHorizontalGroup,
          overItemGroup: dropHorizontalGroup,
        })

        if (columnAction) {
          updateColumnActions.push(columnAction)
        } else {
          horizontalGroupActionFailed = true
        }
      }

      if (newVerticalGroup && !horizontalGroupActionFailed) {
        updateColumnActions.push({
          dataType: MemexColumnDataType.SingleSelect,
          memexProjectColumnId: groupByFieldId,
          value: {id: newVerticalGroup.groupMetadata?.id ?? ''},
        })
      }

      const dropSide = side === 'top' ? DropSide.BEFORE : DropSide.AFTER
      const reorderData = previousCardId != null ? {overItemId: previousCardId, side: dropSide} : undefined

      const updateItemData = buildUpdateItemActions(updateColumnActions, reorderData)

      if (!updateItemData) {
        return
      }

      try {
        await updateAndReorderItem(cardToMove.id, updateItemData, {})
      } catch (error) {
        handleGroupDropRequestError(error)
      }
    },
    [getUpdateForGroupDropEvent, groupByFieldId, handleGroupDropRequestError, updateAndReorderItem],
  )

  const moveCardMWLEnabled = useCallback(
    async (
      cardToMove: MemexItemModel,
      previousCardId: number | undefined,
      side: 'top' | 'bottom',
      newVerticalGroup?: VerticalGroup,
      oldVerticalGroupId?: string,
      dragHorizontalGroup?: HorizontalGroup,
      dropHorizontalGroup?: HorizontalGroup,
    ) => {
      // skip if we're over the same card
      if (cardToMove.id === previousCardId) {
        return
      }

      const updateColumnActions: Array<UpdateColumnValueAction> = []
      let horizontalGroupActionFailed = false

      if (
        dragHorizontalGroup?.sourceObject &&
        dropHorizontalGroup?.sourceObject &&
        dragHorizontalGroup.value !== dropHorizontalGroup.value
      ) {
        const columnAction = await getUpdateForGroupDropEvent({
          activeItem: cardToMove,
          activeItemGroup: dragHorizontalGroup,
          overItemGroup: dropHorizontalGroup,
        })

        if (columnAction) {
          updateColumnActions.push(columnAction)
        } else {
          horizontalGroupActionFailed = true
        }
      }

      if (newVerticalGroup && newVerticalGroup.id !== oldVerticalGroupId && !horizontalGroupActionFailed) {
        updateColumnActions.push({
          dataType: MemexColumnDataType.SingleSelect,
          memexProjectColumnId: groupByFieldId,
          value: {id: newVerticalGroup.groupMetadata?.id ?? ''},
        })
      }

      const dropSide = side === 'top' ? DropSide.BEFORE : DropSide.AFTER
      // If there is no `previousCardId` it means we're dropping into an empty group
      // so we need to include the an `overGroupId` in the `reorderData`.
      const reorderData: ReorderItemData =
        previousCardId != null
          ? {overItemId: previousCardId, side: dropSide}
          : {overGroupId: groupedItems.allItemsByVerticalGroup[newVerticalGroup?.id || '']?.groupId || ''}
      const updateItemData = buildUpdateItemActions(updateColumnActions, reorderData)

      if (!updateItemData) {
        return
      }

      try {
        await updateAndReorderItem(cardToMove.id, updateItemData, {})
      } catch (error) {
        handleGroupDropRequestError(error)
      }
    },
    [
      getUpdateForGroupDropEvent,
      groupByFieldId,
      groupedItems.allItemsByVerticalGroup,
      handleGroupDropRequestError,
      updateAndReorderItem,
    ],
  )

  const moveCard = memex_table_without_limits ? moveCardMWLEnabled : moveCardMWLDisabled

  const moveCardToPosition = useCallback(
    async (cardToMoveId: number, verticalGroupId: string, position: CardPositionType) => {
      // Find the first/last item in the current column
      const columnItems = groupedItems.allItemsByVerticalGroup[verticalGroupId]?.items
      const item = position === CardPositionType.TOP ? columnItems?.at(0) : columnItems?.at(-1)
      if (!item) return

      const reorderData = {
        overItemId: item.id,
        side: position === CardPositionType.TOP ? DropSide.BEFORE : DropSide.AFTER,
      }
      const updateItemData = buildUpdateItemActions(undefined, reorderData)
      if (!updateItemData) {
        return
      }
      await updateAndReorderItem(cardToMoveId, updateItemData, {})
    },
    [groupedItems.allItemsByVerticalGroup, updateAndReorderItem],
  )

  const moveCards = useCallback(
    async (
      selectedItems: Array<MemexItemModel>,
      newVerticalGroup: VerticalGroup,
      dragHorizontalGroup?: HorizontalGroup,
      dropHorizontalGroup?: HorizontalGroup,
    ) => {
      // skip if all the items are already in the target column
      if (!horizontalGroupByFieldId && isEveryItemInColumn(selectedItems, newVerticalGroup, groupByFieldId)) {
        return
      }

      const itemUpdates = []
      let horizontalGroupActionFailed = false

      for (const item of selectedItems) {
        const updateColumnActions: Array<UpdateColumnValueAction> = []

        if (dragHorizontalGroup?.sourceObject && dropHorizontalGroup?.sourceObject) {
          const columnAction = await getUpdateForGroupDropEvent({
            activeItem: item,
            activeItemGroup: dragHorizontalGroup,
            overItemGroup: dropHorizontalGroup,
          })

          if (columnAction) {
            updateColumnActions.push(columnAction)
          } else {
            horizontalGroupActionFailed = true
            break
          }
        }

        if (newVerticalGroup && !horizontalGroupActionFailed) {
          updateColumnActions.push({
            dataType: MemexColumnDataType.SingleSelect,
            memexProjectColumnId: groupByFieldId,
            value: {id: newVerticalGroup.groupMetadata?.id ?? ''},
          })
        }

        itemUpdates.push({
          itemId: item.id,
          updates: updateColumnActions,
        })
      }

      if (!horizontalGroupActionFailed) {
        try {
          await bulkUpdateMultipleColumnValues(itemUpdates)
        } catch (error) {
          handleGroupDropRequestError(error)
        }
      }
    },
    [
      bulkUpdateMultipleColumnValues,
      getUpdateForGroupDropEvent,
      groupByFieldId,
      handleGroupDropRequestError,
      horizontalGroupByFieldId,
    ],
  )

  const boardCardActionsContextValue = useMemo(
    () => ({moveCard, moveCards, moveCardToPosition}),
    [moveCard, moveCardToPosition, moveCards],
  )

  return (
    <BoardCardActionsContext.Provider value={boardCardActionsContextValue}>{children}</BoardCardActionsContext.Provider>
  )
}

export function useBoardCardActions() {
  const value = useContext(BoardCardActionsContext)

  if (value == null) {
    throw new Error(`useBoardCardActions must be used within a BoardCardActionsContext`)
  }

  return value
}

// checks whether every item is already in the target column
export function isEveryItemInColumn(
  selectedItems: Array<MemexItemModel>,
  targetVerticalGroup: VerticalGroup,
  groupByFieldId: number | 'Status',
) {
  return selectedItems.every(item => {
    const columnValue = item.columns[groupByFieldId]

    if (columnValue) {
      return (
        isSingleSelectOrIterationColumnValue(columnValue) && columnValue.id === targetVerticalGroup.groupMetadata?.id
      )
    } else {
      // for items in the no-option column
      return targetVerticalGroup.id === MissingVerticalGroupId
    }
  })
}
