import {type RefObject, useCallback, useMemo} from 'react'

import {ItemType} from '../../../api/memex-items/item-type'
import {isPortalActive} from '../../../helpers/portal-elements'
import {defined, isPlatformMeta} from '../../../helpers/util'
import type {MemexItemModel} from '../../../models/memex-item-model'
import type {Direction} from '../../../selection/types'
import {useFindMemexItem} from '../../../state-providers/memex-items/use-find-memex-item'
import {focusCard, useStableBoardNavigation} from '../navigation'
import {
  createExpandColumnSelectionAction,
  createExpandColumnSelectionViaKeysAction,
  createInitAction,
  createSelectAllCycleAction,
  createToggleAllSelectedAction,
  createToggleSelectedAction,
  useCardSelectionDispatch,
} from '../selection'

type UseCardSelection = {
  filteredSelectedCards: Array<MemexItemModel>
  selectAllCycle: () => void
  toggleCardSelected: (id: number, state?: boolean) => void
  toggleAllSelected: (state: boolean) => void
  state: {
    [key: string]: boolean
  }
  selectSingleCard: (id: number) => void
  filteredSelectedCardIds: Array<number>
  resetSelection: () => void
  onCardClick: React.MouseEventHandler<HTMLDivElement>
  expandColumnSelectionViaKeys: (direction: Direction) => void
}

export function useCardSelection(): UseCardSelection
export function useCardSelection(
  item: MemexItemModel | undefined,
  contextMenuRef: RefObject<HTMLDivElement> | undefined,
  horizontalGroupIndex: number,
  columnIndex: number,
): UseCardSelection
export function useCardSelection(
  item?: MemexItemModel,
  contextMenuRef?: RefObject<HTMLDivElement>,
  horizontalGroupIndex?: number,
  columnIndex?: number,
): UseCardSelection {
  const {
    selectionDispatch,
    state: {selected},
  } = useCardSelectionDispatch()

  const {findMemexItem} = useFindMemexItem()
  const {navigationDispatch, stateRef: focusState} = useStableBoardNavigation()

  const toggleCardSelected = useCallback(
    (id: number, state?: boolean) => {
      selectionDispatch(createToggleSelectedAction(id, state))
    },
    [selectionDispatch],
  )

  const toggleAllSelected = useCallback(
    (state: boolean) => {
      selectionDispatch(createToggleAllSelectedAction(state))
    },
    [selectionDispatch],
  )

  const selectSingleCard = useCallback(
    (id: number) => {
      toggleAllSelected(false)
      toggleCardSelected(id, true)
    },
    [toggleAllSelected, toggleCardSelected],
  )

  const resetSelection = useCallback(() => {
    selectionDispatch(createInitAction({selected: {}}))
  }, [selectionDispatch])

  const expandColumnSelection = useCallback(
    (anchorColumnIndex: number, anchorId: number, targetId: number) => {
      selectionDispatch(createExpandColumnSelectionAction(anchorColumnIndex, anchorId, targetId))
    },
    [selectionDispatch],
  )

  const expandColumnSelectionViaKeys = useCallback(
    (direction: Direction) => {
      if (focusState.current?.focus?.type === 'coordinate') {
        const {x: anchorColumnIndex, y: anchorId} = focusState.current.focus.details
        selectionDispatch(createExpandColumnSelectionViaKeysAction(anchorColumnIndex, anchorId, direction))
      }
    },
    [focusState, selectionDispatch],
  )

  // this list of selectedIds could also include redacted items
  const selectedIds = Object.keys(selected)
    .filter(key => selected[key] === true)
    .map(Number)

  /**
   * Returns actionable selected items
   */
  const filteredSelectedCards = useMemo<Array<MemexItemModel>>(
    () =>
      selectedIds
        .map(id => findMemexItem(id))
        .filter(defined)
        .filter(selectedItem => !isRedactedItem(selectedItem)),
    [findMemexItem, selectedIds],
  )

  /**
   * Returns actionable selected card Ids (e.g. cards that should be highlighted in the UI)
   */
  const [filteredSelectedCardIds, filteredSelectedCardIdSet] = useMemo<[Array<number>, Set<number>]>(() => {
    const cardIds = filteredSelectedCards.map(selectedItem => selectedItem.id)
    return [cardIds, new Set(cardIds)]
  }, [filteredSelectedCards])

  const onCardClick: React.MouseEventHandler<HTMLDivElement> = useCallback(
    e => {
      if (!item || item.contentType === ItemType.RedactedItem || e.defaultPrevented) return
      const isContextMenuClick = contextMenuRef?.current?.contains(e.target as Node)

      if (isContextMenuClick) {
        e.stopPropagation()
        return
      }

      // when shift clicking on a card, we want to expand the selection
      if (e.shiftKey && focusState.current?.focus?.type === 'coordinate') {
        const {x: anchorColumnIndex, y: anchorId} = focusState.current.focus.details
        expandColumnSelection(anchorColumnIndex, anchorId, item.id)
        // when meta clicking on a card, we want to toggle the selection
      } else if (isPlatformMeta(e) && focusState.current?.focus?.type === 'coordinate') {
        const isNothingSelected = selectedIds.length === 0
        if (isNothingSelected) {
          const {y: currentlyFocusedId} = focusState.current.focus.details
          toggleCardSelected(currentlyFocusedId, true)
        }

        toggleCardSelected(item.id)
        if (columnIndex !== undefined && horizontalGroupIndex !== undefined) {
          navigationDispatch(focusCard(horizontalGroupIndex, columnIndex, item.id))
        }
        // if multiple cards are selected and we click on an unselected card, we want to reset the selection
      } else if (filteredSelectedCards.length > 1 && !filteredSelectedCardIdSet.has(item.id)) {
        resetSelection()
      } else if (!isPortalActive()) {
        resetSelection()
      }
      // prevent card clicks from bubbling up to other click handlers that may reset selection
      e.stopPropagation()
    },
    [
      horizontalGroupIndex,
      columnIndex,
      contextMenuRef,
      expandColumnSelection,
      filteredSelectedCardIdSet,
      filteredSelectedCards.length,
      focusState,
      item,
      navigationDispatch,
      resetSelection,
      selectedIds.length,
      toggleCardSelected,
    ],
  )

  const selectAllCycle = useCallback(() => {
    if (columnIndex !== undefined) {
      selectionDispatch(createSelectAllCycleAction(columnIndex))
    }
  }, [columnIndex, selectionDispatch])

  return {
    expandColumnSelectionViaKeys,
    onCardClick,
    resetSelection,
    filteredSelectedCardIds,
    selectSingleCard,
    state: selected,
    toggleAllSelected,
    toggleCardSelected,
    selectAllCycle,
    filteredSelectedCards,
  }
}

function isRedactedItem(item: MemexItemModel) {
  return item.contentType === ItemType.RedactedItem
}
