import invariant from 'tiny-invariant'

import {not_typesafe_nonNullAssertion} from '../../helpers/non-null-assertion'
import type {RelativePosition} from '../../hooks/drag-and-drop/transformation'
import type {MemexItemModel} from '../../models/memex-item-model'
import {MissingVerticalGroupId} from '../../models/vertical-group'
import {
  createNavigateAction,
  createNavigationContext,
  createSetFocusStateAction,
  type FocusState,
  type NavigateAction,
  type SetFocusStateAction,
} from '../../navigation/context'
import {type CoordinateFocus, type Focus, FocusType, NavigationDirection} from '../../navigation/types'

type FooterFocus = Focus<{verticalGroupId: string; horizontalGroupIndex: number}> & {
  type: 'footer'
}

type AddItemFocus = Focus<{verticalGroupId: string; horizontalGroupIndex: number}> & {
  type: 'add-item'
}

type SearchFocus = Focus & {
  type: 'search-input'
}

export type MovingCards = {
  sashSide: RelativePosition
  /** Where to return focus to if movement is canceled */
  returnFocus: {
    horizontalGroupIndex: number
    columnIndex: number
    cardId: number
  }
  cardIds: Array<number>
}

/**
 * The information needed to move a card using a keyboard.
 */
type FocusMetadata = {
  keyboardMovingCard?: MovingCards
  horizontalGroupIndex: number
}

/**
 * In the x direction we are using the column index.
 * In the y direction we are using the card id.
 * The focus metadata for a given card.
 */
export type BoardFocus = CoordinateFocus<number, number, FocusMetadata> | FooterFocus | SearchFocus | AddItemFocus

export type BoardFocusState = FocusState<BoardFocus>

export type BoardColumn = {verticalGroupId: string; items: ReadonlyArray<MemexItemModel>}

type BoardSetFocusStateAction = SetFocusStateAction<BoardFocus>

export type BoardNavigateAction = NavigateAction<
  | {type: 'previousFocus'}
  | {type: 'footer'; verticalGroupId?: string; horizontalGroupIndex: number}
  | {type: 'add-item'; verticalGroupId?: string; horizontalGroupIndex: number}
  | {type: 'search-input'}
  | {
      type: 'nearestCard'
      // position of the card in the column
      indexOfCardWithinColumn: number
      horizontalGroupIndex: number
      // the column index within the board the card is in
      columnIndex: number
      // the id of the card to find the nearest neighbor of
      cardId: number
      findMemexItem?: (id: number) => MemexItemModel | undefined
    }
>

export const {
  useNavigation: useBoardNavigation,
  useStableNavigation: useStableBoardNavigation,
  NavigationProvider: BoardNavigationProvider,
} = createNavigationContext(boardNavigationReducer, boardSetFocusReducer)

export const KeyboardMoveCardCoordinate = -1

/**
 * Determine whether the given focus is on the add item button
 *
 * @param focus The focus to test
 * @returns A type predicate for a add item focus
 */
export function isAddItemFocus(focus: BoardFocus | null): focus is AddItemFocus {
  return focus?.type === 'add-item'
}

/**
 * Determine whether the given focus is on the omnibar
 *
 * @param focus The focus to test
 * @returns A type predicate for a footer/omnibar focus
 */
export function isFooterFocus(focus: BoardFocus | null): focus is FooterFocus {
  return focus?.type === 'footer'
}

/**
 * Determine whether the given focus is on the search input
 *
 * @param focus The focus to test
 * @returns A type predicate for a search input focus
 */
export function isSearchInputFocus(focus?: BoardFocus | null): focus is SearchFocus {
  return focus?.type === 'search-input'
}

/**
 * Set the current card focus.
 */
export function focusCard(
  horizontalGroupIndex: number,
  columnIndex: number,
  cardId: number,
  focusType: FocusType = FocusType.Focus,
): SetFocusStateAction<BoardFocus> {
  return createSetFocusStateAction({
    type: 'coordinate',
    focusType,
    details: {
      x: columnIndex,
      y: cardId,
      meta: {
        horizontalGroupIndex,
      },
    },
  })
}

/**
 * Select the card for moving with a keyboard.
 */
export function selectCardsToMove(
  currentCardId: number,
  horizontalGroupIndex: number,
  columnIndex: number,
  cardIds: Array<number>,
): SetFocusStateAction<BoardFocus> {
  return createSetFocusStateAction({
    type: 'coordinate',
    focusType: FocusType.Focus,
    details: {
      x: columnIndex,
      y: currentCardId,
      meta: {
        horizontalGroupIndex,
        keyboardMovingCard: {
          sashSide: 'after',
          cardIds,
          returnFocus: {
            horizontalGroupIndex,
            columnIndex,
            // Focus should be returned to the first card that was focused
            cardId: currentCardId,
          },
        } satisfies MovingCards,
      },
    },
  })
}

export function focusPrevious(): BoardNavigateAction {
  return createNavigateAction({focusType: FocusType.Focus, details: {type: 'previousFocus'}})
}

export function focusNearestCard(
  indexOfCardWithinColumn: number,
  columnIndex: number,
  horizontalGroupIndex: number,
  cardId: number,
  findMemexItem?: (id: number) => MemexItemModel | undefined,
): BoardNavigateAction {
  return createNavigateAction({
    focusType: FocusType.Focus,
    details: {type: 'nearestCard', indexOfCardWithinColumn, columnIndex, cardId, findMemexItem, horizontalGroupIndex},
  })
}

export function focusOmnibar(verticalGroupId: string | undefined, horizontalGroupIndex: number): BoardNavigateAction {
  return createNavigateAction({
    focusType: FocusType.Focus,
    details: {type: 'footer', verticalGroupId, horizontalGroupIndex},
  })
}

export function focusSearchInput(): BoardNavigateAction {
  return createNavigateAction({focusType: FocusType.Focus, details: {type: 'search-input'}})
}

export function clearFocus() {
  return createSetFocusStateAction(null)
}

/**
 * To start this is a single element tuple which handles the case without any horizontal groupings applied.
 *
 * Soon this will get extended to account for multiple horizontalGroups
 */
export type CardGrid = ReadonlyArray<{
  horizontalGroupId: string
  isCollapsed: boolean
  isFooterDisabled: boolean
  verticalGroups: ReadonlyArray<Readonly<BoardColumn>>
}>

export function boardNavigationReducer(
  state: BoardFocusState,
  meta: {
    cardGrid: CardGrid
  },
  action: BoardNavigateAction,
): BoardFocusState {
  const {focus} = state

  if (action.navigation.details?.type === 'previousFocus') {
    return {...state, focus: state.previousFocus, previousFocus: null}
  }
  if (action.navigation.details?.type === 'footer') {
    // If we're moving to the footer we want need to figure out the column id to
    // associate the focus state with.
    // In order our options are:
    // 1. The column id passed in the action
    // 2. The current focus in the x direction
    // 3. The first column
    let verticalGroupId = action.navigation.details.verticalGroupId
    if (verticalGroupId == null) {
      if (focus?.type === 'coordinate') {
        const horizontalGroup = meta.cardGrid[focus.details.meta.horizontalGroupIndex]
        invariant(horizontalGroup, 'horizontalGroup should not be null')
        verticalGroupId = horizontalGroup?.verticalGroups[focus.details.x]?.verticalGroupId
      } else {
        const horizontalGroup = meta.cardGrid[0]
        invariant(horizontalGroup, 'horizontalGroup should not be null')
        verticalGroupId = horizontalGroup.verticalGroups[0]?.verticalGroupId
      }
    }
    return {
      ...state,
      focus: {
        type: 'footer',
        focusType: FocusType.Focus,
        details: {
          verticalGroupId: not_typesafe_nonNullAssertion(verticalGroupId),
          horizontalGroupIndex: action.navigation.details.horizontalGroupIndex,
        },
      },
      previousFocus: state.focus,
    }
  } else if (action.navigation.details?.type === 'search-input') {
    return {
      ...state,
      focus: {
        type: 'search-input',
        focusType: FocusType.Focus,
        details: {},
      },
      previousFocus: state.focus ?? state.previousFocus,
    }
  } else if (action.navigation.details?.type === 'nearestCard') {
    const {indexOfCardWithinColumn, columnIndex, cardId, findMemexItem, horizontalGroupIndex} =
      action.navigation.details
    return {
      ...state,
      focus: getFocalPointForNearestCard(
        horizontalGroupIndex,
        indexOfCardWithinColumn,
        columnIndex,
        cardId,
        meta.cardGrid,
        findMemexItem,
      ),
      previousFocus: state.focus,
    }
  }

  if (!focus) {
    return state
  }

  if (focus.type === 'coordinate') {
    const newFocalPoint = getFocalPointFromCard(focus, action, meta.cardGrid)
    return {...state, focus: newFocalPoint, previousFocus: state.focus}
  } else {
    const newFocalPoint = getFocalPointFromFooter(focus, action, meta.cardGrid)
    return {...state, focus: newFocalPoint, previousFocus: state.focus}
  }
}

function boardSetFocusReducer(
  state: BoardFocusState,
  _: {cardGrid: CardGrid},
  action: BoardSetFocusStateAction,
): BoardFocusState {
  return {
    ...state,
    focus: action.focus,
    previousFocus: getNextPreviousFocus(state),
  }
}

/**
 * Determines whether or not the provided focus state is for the item within the column provided.
 * @param focusState Current focus state to compare against
 * @param itemId Id of the card - will be the `y` value of the focus state's coordinates
 * @param columnIndex Index of the column - will be the `x` value of the focus state's coordinates
 * @returns
 */
export function cardHasFocus(focusState: BoardFocusState | null, itemId: number, columnIndex: number) {
  if (!focusState?.focus?.details || focusState.focus.type !== 'coordinate') return false
  const focusDetails = focusState.focus.details
  return focusDetails.y === itemId && focusDetails.x === columnIndex
}

function getNextPreviousFocus({focus, previousFocus}: BoardFocusState): BoardFocus | null {
  if (!focus) return null

  return isFooterFocus(focus) || isSearchInputFocus(focus) ? previousFocus : focus
}

function getFocalPointForNearestCard(
  horizontalGroupIndex: number,
  indexOfCardWithinColumn: number,
  columnIndex: number,
  cardId: number,
  cardGrid: CardGrid,
  findMemexItem?: (id: number) => MemexItemModel | undefined,
): BoardFocus {
  const horizontalGroup = cardGrid[horizontalGroupIndex]
  const column = horizontalGroup?.verticalGroups[columnIndex]
  const itemsInColumn = findMemexItem
    ? not_typesafe_nonNullAssertion(column).items.filter(i => findMemexItem(i.id))
    : not_typesafe_nonNullAssertion(column).items

  // currentCardIndex is the index of the item within the overall list of
  // all items in the project - not in a specific column.
  const currentCardIndex = itemsInColumn.findIndex(item => item.id === cardId)
  const hasMoreColumnItems = itemsInColumn.length > 1
  const hasAnyItems = itemsInColumn.length > 0
  const indexOfLastCardInColumn = itemsInColumn.length - 1

  let newRowId = -1
  let newColIndex = columnIndex

  if (hasAnyItems && currentCardIndex === -1) {
    const nextIndex =
      indexOfCardWithinColumn > indexOfLastCardInColumn ? indexOfLastCardInColumn : indexOfCardWithinColumn
    newRowId = itemsInColumn[nextIndex]?.id ?? 0
  } else if (hasMoreColumnItems) {
    // The nearest card is going to be in the current column.
    // If we're looking for the nearest card to the the last card in the column, focus the previous one.
    // Otherwise, focus the card with the same index as the one we're looking for
    newRowId =
      currentCardIndex === indexOfLastCardInColumn
        ? not_typesafe_nonNullAssertion(itemsInColumn[currentCardIndex - 1]).id
        : not_typesafe_nonNullAssertion(itemsInColumn[currentCardIndex + 1]).id
  } else {
    // The card that we're trying to find the nearest neighbor of is the only card in the column, so we
    // have to search through some other columns.
    // We step simultaneously step left and right from our starting column until we find a column with cards.
    // Once we find a column we'll just use the first card in that column.
    // If we exceed the bounds of the column grid in both directions, that means there are no card in any columns,
    // so we just focus the omnibar for the original column.
    let columnOffset = 1
    while (
      newRowId === -1 &&
      (columnIndex - columnOffset >= 0 || columnIndex + columnOffset < (horizontalGroup?.verticalGroups.length ?? 0))
    ) {
      const previousColumn = horizontalGroup?.verticalGroups[columnIndex - columnOffset]
      const nextColumn = horizontalGroup?.verticalGroups[columnIndex + columnOffset]
      if (columnIndex - columnOffset >= 0 && !isEmptyColumn(previousColumn)) {
        newRowId = not_typesafe_nonNullAssertion(not_typesafe_nonNullAssertion(previousColumn).items[0]).id
        newColIndex = columnIndex - columnOffset
      } else if (
        columnIndex + columnOffset < (horizontalGroup?.verticalGroups.length ?? 0) &&
        !isEmptyColumn(nextColumn)
      ) {
        newRowId = not_typesafe_nonNullAssertion(not_typesafe_nonNullAssertion(nextColumn).items[0]).id
        newColIndex = columnIndex + columnOffset
      }
      columnOffset++
    }
    if (newRowId === -1) {
      return {
        type: 'footer',
        focusType: FocusType.Focus,
        details: {
          verticalGroupId: not_typesafe_nonNullAssertion(column).verticalGroupId,
          horizontalGroupIndex,
        },
      }
    }
  }

  return {
    type: 'coordinate',
    focusType: FocusType.Focus,
    details: {
      x: newColIndex,
      y: newRowId,
      meta: {
        horizontalGroupIndex: horizontalGroupIndex ?? 0,
      },
    },
  }
}

function getFocalPointFromCard(
  focalPoint: CoordinateFocus<number, number, FocusMetadata>,
  action: BoardNavigateAction,
  cardGrid: CardGrid,
): BoardFocus | null {
  const horizontalGroup = cardGrid[focalPoint.details.meta.horizontalGroupIndex]
  invariant(horizontalGroup, 'horizontalGroup should not be null')
  // if keyboardMovingCard is set, then we're using keyboard navigation to specify the destination of the selected card
  const keyboardMovingCard = focalPoint.details.meta.keyboardMovingCard
  const firstHorizontalGroupIndex = cardGrid.findIndex(hg => !hg.isCollapsed)
  const isFirstHorizontalGroup = focalPoint.details.meta.horizontalGroupIndex === firstHorizontalGroupIndex

  if (
    action.navigation.y === NavigationDirection.Next &&
    isLastCardInColumnForHorizontalGroup(horizontalGroup, focalPoint.details.x, focalPoint.details.y)
  ) {
    // While navigating the board with a keyboard while a card is selected, prevent the focus from going to the footer
    // below the column until a card is no longer selected with a keyboard.
    if (keyboardMovingCard) {
      return {
        ...focalPoint,
        details: {
          ...focalPoint.details,
          meta: {
            ...focalPoint.details.meta,
            keyboardMovingCard: {
              ...keyboardMovingCard,
              sashSide: 'after',
            },
          },
        },
      }
    }

    const newColIndex = focalPoint.details.x
    let newHorizontalGroupIndex = focalPoint.details.meta.horizontalGroupIndex
    let newHorizontalGroup = cardGrid[newHorizontalGroupIndex]
    let newColumn = cardGrid[newHorizontalGroupIndex]?.verticalGroups[newColIndex]

    // loop through to first non empty column if footers are disables (when grouped by milestones/repos)
    while (newHorizontalGroupIndex < cardGrid.length - 1 && newHorizontalGroup && newHorizontalGroup.isFooterDisabled) {
      newHorizontalGroupIndex = getNewHorizontalGroupIndex(cardGrid, newHorizontalGroupIndex, NavigationDirection.Next)
      newHorizontalGroup = cardGrid[newHorizontalGroupIndex]
      newColumn = cardGrid[newHorizontalGroupIndex]?.verticalGroups[newColIndex]

      if (!isEmptyColumn(newColumn)) {
        const newRowId = not_typesafe_nonNullAssertion(newColumn?.items[0]).id
        return {
          type: 'coordinate',
          focusType: FocusType.Focus,
          details: {
            x: newColIndex,
            y: newRowId,
            meta: {
              horizontalGroupIndex: newHorizontalGroupIndex,
            },
          },
        }
      }
    }

    if (newHorizontalGroup && !newHorizontalGroup.isFooterDisabled && !newHorizontalGroup.isCollapsed) {
      // We're moving down and already on the last card, so focus the omnibar for the row below
      return {
        type: cardGrid.length > 1 ? 'add-item' : 'footer',
        focusType: FocusType.Focus,
        details: {
          verticalGroupId: not_typesafe_nonNullAssertion(newColumn).verticalGroupId,
          horizontalGroupIndex: newHorizontalGroupIndex,
        },
      }
    }

    return focalPoint
  }

  if (
    action.navigation.y === NavigationDirection.Previous &&
    isFirstCardInColumnForHorizontalGroup(horizontalGroup, focalPoint.details.x, focalPoint.details.y)
  ) {
    // While navigating the board with a keyboard while a card is selected, prevent the focus from going to the search
    // input above the column until a card is no longer selected with a keyboard.
    if (keyboardMovingCard) {
      return {
        ...focalPoint,
        details: {
          ...focalPoint.details,
          meta: {
            ...focalPoint.details.meta,
            keyboardMovingCard: {
              ...keyboardMovingCard,
              sashSide: 'before',
            },
          },
        },
      }
    }

    if (isFirstHorizontalGroup) {
      return {
        type: 'search-input',
        focusType: FocusType.Focus,
        details: {},
      }
    }

    const newColIndex = focalPoint.details.x
    let newHorizontalGroupIndex = focalPoint.details.meta.horizontalGroupIndex
    let newHorizontalGroup = cardGrid[newHorizontalGroupIndex]
    let newColumn = cardGrid[newHorizontalGroupIndex]?.verticalGroups[newColIndex]

    if (!newHorizontalGroup?.isFooterDisabled) {
      newHorizontalGroupIndex = getNewHorizontalGroupIndex(
        cardGrid,
        newHorizontalGroupIndex,
        NavigationDirection.Previous,
      )
    }

    // loop through to first non empty column if footers are disables (when grouped by milestones/repos)
    while (newHorizontalGroupIndex > 0 && newHorizontalGroup && newHorizontalGroup.isFooterDisabled) {
      newHorizontalGroupIndex = getNewHorizontalGroupIndex(
        cardGrid,
        newHorizontalGroupIndex,
        NavigationDirection.Previous,
      )
      newHorizontalGroup = cardGrid[newHorizontalGroupIndex]
      newColumn = cardGrid[newHorizontalGroupIndex]?.verticalGroups[newColIndex]

      if (!isEmptyColumn(newColumn)) {
        const newRowId = not_typesafe_nonNullAssertion(newColumn?.items[0]).id
        return {
          type: 'coordinate',
          focusType: FocusType.Focus,
          details: {
            x: newColIndex,
            y: newRowId,
            meta: {
              horizontalGroupIndex: newHorizontalGroupIndex,
            },
          },
        }
      }
    }

    if (newHorizontalGroup && !newHorizontalGroup.isFooterDisabled && !newHorizontalGroup.isCollapsed) {
      // We're moving up and already in the first card, so focus the omnibar for the row above
      return {
        type: cardGrid.length > 1 ? 'add-item' : 'footer',
        focusType: FocusType.Focus,
        details: {
          verticalGroupId: not_typesafe_nonNullAssertion(newColumn).verticalGroupId,
          horizontalGroupIndex: newHorizontalGroupIndex,
        },
      }
    }

    return focalPoint
  }

  const newColIndex = getNewColumnIndex(
    cardGrid,
    focalPoint.details.meta.horizontalGroupIndex,
    focalPoint.details.x,
    action.navigation.x ?? NavigationDirection.Same,
    !!keyboardMovingCard,
  )
  const newColumn = horizontalGroup?.verticalGroups[newColIndex]

  // If moving a card into an empty column, put focus on a placeholder sash.
  if (keyboardMovingCard && isEmptyColumn(newColumn)) {
    return {
      type: 'coordinate',
      focusType: FocusType.Focus,
      details: {
        x: newColIndex,
        y: KeyboardMoveCardCoordinate,
        meta: {
          horizontalGroupIndex: focalPoint.details.meta.horizontalGroupIndex,
          keyboardMovingCard: {
            ...keyboardMovingCard,
            sashSide: 'before',
          },
        },
      },
    }
  }

  if (!newColumn) return focalPoint

  if (isEmptyColumn(newColumn)) {
    if (cardGrid.length === 1 || horizontalGroup?.isFooterDisabled) {
      // If we have navigated off the edge of the board or ended up on a column with no items, don't change focus
      return focalPoint
    } else {
      // If we have horizontal groups, go to the add item button if new column is empty
      return {
        type: 'add-item',
        focusType: FocusType.Focus,
        details: {
          verticalGroupId: not_typesafe_nonNullAssertion(newColumn).verticalGroupId,
          horizontalGroupIndex: focalPoint.details.meta.horizontalGroupIndex,
        },
      }
    }
  }

  // We're storing the card's id as the focus state, so we need to find the corresponding index
  const currentRowIndex = not_typesafe_nonNullAssertion(
    horizontalGroup.verticalGroups[focalPoint.details.x],
  ).items.findIndex(item => item.id === focalPoint.details.y)

  // navigateArray will ensure that if the new column doesn't have enough cards to match the old index
  // that we use the index of the last card in the new column
  const newRowIndex =
    focalPoint.details.y === KeyboardMoveCardCoordinate
      ? 0
      : navigateArray(newColumn.items, currentRowIndex, action.navigation.y ?? NavigationDirection.Same)

  // Now that we have an index, find the corresponding id for the new card
  const newRowId = not_typesafe_nonNullAssertion(newColumn.items[newRowIndex]).id

  // Determine if we need to move the sash up/down based on the direction we are moving
  const newSashSide = getNewSashSide({
    action,
    sashSide: focalPoint.details.meta.keyboardMovingCard?.sashSide,
    currentRowIndex,
    newRowIndex,
    newColumn,
  })

  return {
    type: 'coordinate',
    focusType: FocusType.Focus,
    details: {
      x: newColIndex,
      y: newRowId,
      meta: {
        horizontalGroupIndex: focalPoint.details.meta.horizontalGroupIndex,
        keyboardMovingCard: focalPoint.details.meta.keyboardMovingCard
          ? {
              ...focalPoint.details.meta.keyboardMovingCard,
              sashSide: newSashSide,
            }
          : undefined,
      },
    },
  }
}

/** Determines which side the sash should appear on, based on the current state and action. */
function getNewSashSide({
  action,
  sashSide,
  currentRowIndex,
  newRowIndex,
  newColumn,
}: {
  action: BoardNavigateAction
  sashSide: RelativePosition | undefined
  currentRowIndex: number
  newRowIndex: number
  newColumn: Readonly<BoardColumn>
}): RelativePosition {
  if (action.navigation.y === NavigationDirection.First) {
    // If we are going to the top of a column, the sash should be before the first card
    return 'before'
  } else if (action.navigation.y === NavigationDirection.Last) {
    // If we are going to the bottom of a column, the sash should be after the last card
    return 'after'
  } else if (
    action.navigation.y === NavigationDirection.Previous &&
    currentRowIndex === 0 &&
    currentRowIndex === newRowIndex
  ) {
    // If we are at the top and moving up, the sash should be before the first card
    return 'before'
  } else if (
    action.navigation.y === NavigationDirection.Next &&
    currentRowIndex === newColumn.items.length - 1 &&
    currentRowIndex === newRowIndex
  ) {
    // If we are at the bottom and moving down, the sash should be after the last card
    return 'after'
  } else if (sashSide && currentRowIndex !== newRowIndex) {
    // Otherwise, if we're just moving from card to card, keep the sash side the same
    return sashSide
  }
  return 'after'
}

// TODO: replace with findLastIndex once we upgrade to Node 18
function getLastHorizontalGroupIndex(cardGrid: CardGrid) {
  for (let i = cardGrid.length - 1; i >= 0; i--) {
    if (!cardGrid[i]?.isCollapsed) return i
  }

  return cardGrid.length - 1
}

function getFocalPointFromFooter(
  focalPoint: FooterFocus | SearchFocus | AddItemFocus,
  action: BoardNavigateAction,
  cardGrid: CardGrid,
): BoardFocus | null {
  const movement = action.navigation
  const lastHorizontalGroupIndex = getLastHorizontalGroupIndex(cardGrid)
  const currentHorizontalGroupIndex =
    focalPoint.type === 'footer' || focalPoint.type === 'add-item' ? focalPoint.details.horizontalGroupIndex : 0
  const horizontalGroup = cardGrid[currentHorizontalGroupIndex]
  invariant(horizontalGroup)

  const currentColumnIndex = horizontalGroup.verticalGroups.findIndex(
    col => col.verticalGroupId === focalPoint.details?.verticalGroupId,
  )
  if (currentColumnIndex === -1) {
    return focalPoint
  }

  let horizontalGroupIndex =
    focalPoint.details &&
    'horizontalGroupIndex' in focalPoint.details &&
    typeof focalPoint.details.horizontalGroupIndex === 'number'
      ? focalPoint.details?.horizontalGroupIndex
      : 0

  // if we don't have any changes in the y direction, then this is a no-op
  if (movement.y) {
    if (movement.y === NavigationDirection.Next) {
      if (horizontalGroupIndex === lastHorizontalGroupIndex) {
        return {
          type: 'search-input',
          focusType: FocusType.Focus,
          details: {},
        }
      }
      horizontalGroupIndex = Math.max(
        0,
        getNewHorizontalGroupIndex(cardGrid, horizontalGroupIndex, NavigationDirection.Next),
      )
    }

    const newColIndex = getNewColumnIndex(
      cardGrid,
      horizontalGroupIndex,
      currentColumnIndex,
      movement.x || NavigationDirection.Same,
    )
    let newColumn = cardGrid[horizontalGroupIndex]?.verticalGroups[newColIndex]

    if (newColIndex < 0 || newColIndex >= (cardGrid[horizontalGroupIndex]?.verticalGroups.length ?? 0)) {
      // If we have navigated off the edge of the board or ended up on a column with no items, don't change focus
      return focalPoint
    }

    let newRowIndex: null | number = null
    if (movement.y === NavigationDirection.Previous || movement.y === NavigationDirection.Last) {
      if (!isEmptyColumn(newColumn)) {
        // if we're moving up or setting to the last and we have items, then use the last item
        newRowIndex = not_typesafe_nonNullAssertion(newColumn).items.length - 1
      } else if (horizontalGroupIndex > 0) {
        // if we're moving up and there are no items, then move to the footer of the previous horizontal group
        horizontalGroupIndex = Math.max(0, getNewHorizontalGroupIndex(cardGrid, horizontalGroupIndex, movement.y))
        while (horizontalGroupIndex > 0 && cardGrid[horizontalGroupIndex]?.isFooterDisabled) {
          newColumn = cardGrid[horizontalGroupIndex]?.verticalGroups[newColIndex]
          newRowIndex = not_typesafe_nonNullAssertion(newColumn).items.length - 1

          if (newColumn && newColumn.items?.length > 0) break

          horizontalGroupIndex = Math.max(0, getNewHorizontalGroupIndex(cardGrid, horizontalGroupIndex, movement.y))
        }

        if (!cardGrid[horizontalGroupIndex]?.isFooterDisabled) {
          return {
            type: cardGrid.length > 1 ? 'add-item' : 'footer',
            focusType: FocusType.Focus,
            details: {
              verticalGroupId: not_typesafe_nonNullAssertion(newColumn).verticalGroupId,
              horizontalGroupIndex,
            },
          }
        } else {
          newColumn = cardGrid[horizontalGroupIndex]?.verticalGroups[newColIndex]
          newRowIndex = not_typesafe_nonNullAssertion(newColumn).items.length - 1
        }
      }
    } else if (movement.y === NavigationDirection.First && !isEmptyColumn(newColumn)) {
      // if we're setting to the first and we have items, then use the first item
      newRowIndex = 0
    } else if (movement.y === NavigationDirection.Next) {
      if (!isEmptyColumn(newColumn)) {
        newRowIndex = 0
      } else if (cardGrid.length - 1 >= horizontalGroupIndex) {
        return {
          type: cardGrid.length > 1 ? 'add-item' : 'footer',
          focusType: FocusType.Focus,
          details: {
            verticalGroupId: not_typesafe_nonNullAssertion(newColumn).verticalGroupId,
            horizontalGroupIndex,
          },
        }
      }
    }

    if (newRowIndex != null && newRowIndex > -1) {
      const newRowId = not_typesafe_nonNullAssertion(not_typesafe_nonNullAssertion(newColumn).items[newRowIndex]).id
      return {
        type: 'coordinate',
        focusType: FocusType.Focus,
        details: {
          x: newColIndex,
          y: newRowId,
          meta: {
            horizontalGroupIndex,
          },
        },
      }
    }

    return {
      type: 'search-input',
      focusType: FocusType.Focus,
      details: {},
    }
  }

  if (movement.x && focalPoint.type === 'add-item') {
    const newColIndex = getNewColumnIndex(
      cardGrid,
      horizontalGroupIndex,
      currentColumnIndex,
      movement.x || NavigationDirection.Same,
    )
    const newColumn = cardGrid[horizontalGroupIndex]?.verticalGroups[newColIndex]

    // Focus on the add item button if the new column is empty
    return {
      type: 'add-item',
      focusType: FocusType.Focus,
      details: {
        verticalGroupId: not_typesafe_nonNullAssertion(newColumn).verticalGroupId,
        horizontalGroupIndex,
      },
    }
  }

  return focalPoint
}

function navigateArray<T>(arr: ReadonlyArray<T>, currentIndex: number, direction: NavigationDirection): number {
  if (direction === NavigationDirection.Same) {
    return Math.min(currentIndex, arr.length - 1)
  }
  if (direction === NavigationDirection.First) {
    return 0
  }
  if (direction === NavigationDirection.Last) {
    return arr.length - 1
  }
  if (direction === NavigationDirection.Next) {
    const nextIndex = Math.min(currentIndex + 1, arr.length - 1)
    return nextIndex
  }
  // direction === NavigationDirection.Previous
  const prevIndex = Math.max(0, currentIndex - 1)
  return prevIndex
}

function isLastCardInColumnForHorizontalGroup(horizontalGroup: CardGrid[number], columnIndex: number, cardId: number) {
  const column = horizontalGroup.verticalGroups[columnIndex]
  if (isEmptyColumn(column)) {
    return false
  }

  const cardsForColumn = column ? column.items : []
  const lastCardIndex = cardsForColumn.length - 1
  const lastCardId = not_typesafe_nonNullAssertion(cardsForColumn[lastCardIndex]).id
  return cardId === lastCardId
}

function isFirstCardInColumnForHorizontalGroup(horizontalGroup: CardGrid[number], columnIndex: number, cardId: number) {
  const column = horizontalGroup.verticalGroups[columnIndex]
  if (isEmptyColumn(column)) {
    return false
  }

  const lastCardId = not_typesafe_nonNullAssertion(column?.items[0]).id
  return cardId === lastCardId
}

function getNewHorizontalGroupIndex(
  cardGrid: CardGrid,
  horizontalGroupIndex: number,
  navigationDirection: NavigationDirection,
) {
  let newHorizontalGroupIndex = navigateArray(cardGrid, horizontalGroupIndex, navigationDirection)
  while (
    cardGrid[newHorizontalGroupIndex]?.isCollapsed &&
    newHorizontalGroupIndex > 0 &&
    newHorizontalGroupIndex < cardGrid.length - 1
  ) {
    newHorizontalGroupIndex = navigateArray(cardGrid, newHorizontalGroupIndex, navigationDirection)
  }

  return newHorizontalGroupIndex
}

function getNewColumnIndex(
  cardGrid: CardGrid,
  horizontalGroupIndex: number,
  columnIndex: number,
  navigationDirection: NavigationDirection,
  keyboardMoving?: boolean,
) {
  const horizontalGroup = cardGrid[horizontalGroupIndex]
  invariant(horizontalGroup)
  // Find the new index based on the direction
  let newColIndex = navigateArray(horizontalGroup.verticalGroups, columnIndex, navigationDirection)

  if (keyboardMoving) {
    // When moving, avoid losing focus in an empty, hidden 'No Status' column on the left side of the board.
    if (
      isEmptyColumn(horizontalGroup.verticalGroups[newColIndex]) &&
      horizontalGroup.verticalGroups[newColIndex]?.verticalGroupId === MissingVerticalGroupId &&
      horizontalGroup.verticalGroups[newColIndex + 1]
    ) {
      newColIndex++
    }
  } else if (
    navigationDirection !== NavigationDirection.Same &&
    isEmptyColumn(horizontalGroup.verticalGroups[newColIndex]) &&
    (cardGrid.length === 1 || horizontalGroup.isFooterDisabled)
  ) {
    //If we weren't just keeping the same direction and ended up on a column with no items,
    // continue moving in the same direction until we either:
    // 1. Find a column with items
    // 2. Fall of the edge of the grid
    // We treat NavigationDirection.First and NavigationDirection.Next the same, because if you are looking for
    // the first and don't find it, you need to move right until you hit it.
    while (
      newColIndex >= 0 &&
      newColIndex < horizontalGroup.verticalGroups.length &&
      isEmptyColumn(horizontalGroup.verticalGroups[newColIndex])
    ) {
      newColIndex =
        navigationDirection === NavigationDirection.First || navigationDirection === NavigationDirection.Next
          ? newColIndex + 1
          : newColIndex - 1
    }
  }
  return newColIndex
}

/** returns true if the column is undefined or contains no cards */
function isEmptyColumn(column: BoardColumn | undefined) {
  return !column || column.items.length === 0
}
