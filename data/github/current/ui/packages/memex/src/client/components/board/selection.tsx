import {createContext, memo, useContext, useMemo, useReducer} from 'react'

import {not_typesafe_nonNullAssertion} from '../../helpers/non-null-assertion'
import useBodyClass from '../../hooks/use-body-class'
import type {MemexItemModel} from '../../models/memex-item-model'
import {Direction} from '../../selection/types'
import type {CardGrid} from './navigation'

type CardSelectionState = {
  selected: {
    [key: string]: boolean
  }
}

const ActionTypes = {
  TOGGLE_SELECTED: 'TOGGLE_SELECTED',
  TOGGLE_ALL_SELECTED: 'TOGGLE_ALL_SELECTED',
  EXPAND_COLUMN_SELECTION: 'EXPAND_COLUMN_SELECTION',
  EXPAND_COLUMN_SELECTION_VIA_KEYS: 'EXPAND_COLUMN_SELECTION_VIA_KEYS',
  SELECT_ALL_CYCLE: 'SELECT_ALL_CYCLE',
  INIT: 'INIT',
} as const
type ActionTypes = ObjectValues<typeof ActionTypes>

type ToggleSelectedAction = {
  type: typeof ActionTypes.TOGGLE_SELECTED
  itemId: number
  state?: boolean
}

type ToggleAllSelectedAction = {
  type: typeof ActionTypes.TOGGLE_ALL_SELECTED
  state?: boolean
}

type InitAction = {
  type: typeof ActionTypes.INIT
  state: CardSelectionState
}

type ExpandColumnSelectionAction = {
  type: typeof ActionTypes.EXPAND_COLUMN_SELECTION
  anchorColumnIndex: number
  anchorId: number
  targetId: number
}

type ExpandColumnSelectionViaKeysAction = {
  type: typeof ActionTypes.EXPAND_COLUMN_SELECTION_VIA_KEYS
  anchorColumnIndex: number
  anchorId: number
  direction: Direction
}

type SelectAllCycleAction = {
  type: typeof ActionTypes.SELECT_ALL_CYCLE
  columnIndex: number
}

type CardSelectionAction =
  | ToggleSelectedAction
  | ToggleAllSelectedAction
  | InitAction
  | ExpandColumnSelectionAction
  | ExpandColumnSelectionViaKeysAction
  | SelectAllCycleAction

export const createToggleSelectedAction = (itemId: number, state?: boolean): ToggleSelectedAction => ({
  type: ActionTypes.TOGGLE_SELECTED,
  itemId,
  state,
})

export const createToggleAllSelectedAction = (state?: boolean): ToggleAllSelectedAction => ({
  type: ActionTypes.TOGGLE_ALL_SELECTED,
  state,
})

export const createInitAction = (state: CardSelectionState): InitAction => ({
  type: ActionTypes.INIT,
  state,
})

export const createExpandColumnSelectionAction = (
  anchorColumnIndex: number,
  anchorId: number,
  targetId: number,
): ExpandColumnSelectionAction => ({
  type: ActionTypes.EXPAND_COLUMN_SELECTION,
  anchorColumnIndex,
  anchorId,
  targetId,
})

export const createExpandColumnSelectionViaKeysAction = (
  anchorColumnIndex: number,
  anchorId: number,
  direction: Direction,
): ExpandColumnSelectionViaKeysAction => ({
  type: ActionTypes.EXPAND_COLUMN_SELECTION_VIA_KEYS,
  anchorColumnIndex,
  anchorId,
  direction,
})

export const createSelectAllCycleAction = (columnIndex: number): SelectAllCycleAction => ({
  type: ActionTypes.SELECT_ALL_CYCLE,
  columnIndex,
})

type CardSelectionContextValue = {
  state: CardSelectionState
  selectionDispatch: React.Dispatch<CardSelectionAction>
}

type MetaRef = React.MutableRefObject<{
  cardGrid: CardGrid
}>

type CardSelectionProviderProps = {
  initialState: CardSelectionState
  metaRef: MetaRef
  children: React.ReactNode
}

const createCardSelectionContext = (): {
  CardSelectionContext: React.Context<CardSelectionContextValue>
  CardSelectionProvider: React.FC<CardSelectionProviderProps>
  useCardSelectionDispatch: () => CardSelectionContextValue
} => {
  const CardSelectionContext = createContext<CardSelectionContextValue>({
    state: {selected: {}},
    selectionDispatch: () => void 0,
  })

  const useCardSelectionDispatch = () => {
    const contextValue = useContext(CardSelectionContext)
    return contextValue
  }

  const CardSelectionProvider = memo(function CardSelectionProvider({
    initialState,
    metaRef,
    children,
  }: React.PropsWithChildren<CardSelectionProviderProps>) {
    const [state, selectionDispatch] = useCardSelectionReducer(initialState, metaRef)
    const value = useMemo(() => ({state, selectionDispatch}), [state, selectionDispatch])
    useBodyClass('is-keyboard-moving-card', Object.keys(state.selected).length > 0)

    return <CardSelectionContext.Provider value={value}>{children}</CardSelectionContext.Provider>
  })

  return {CardSelectionContext, CardSelectionProvider, useCardSelectionDispatch}
}

const toggleSelectedReducer = (state: CardSelectionState, action: ToggleSelectedAction) => {
  const requestedValue = action.state
  const currentValue = state.selected[action.itemId] ?? false
  const nextValue = requestedValue !== undefined ? requestedValue : !currentValue
  return {
    selected: {
      ...state.selected,
      [action.itemId]: nextValue,
    },
  }
}

const toggleAllSelectedReducer = (metaRef: MetaRef, action: ToggleAllSelectedAction) => {
  if (action.state !== true) {
    return {
      selected: {},
    }
  } else {
    const cards = metaRef.current.cardGrid.flatMap(horizontalGroup =>
      horizontalGroup.verticalGroups.flatMap(i => i.items),
    )
    const newState: CardSelectionState = {selected: {}}
    cards.map(card => (newState.selected[card.id] = true))

    return newState
  }
}

const expandColumnSelectionReducer = (
  state: CardSelectionState,
  metaRef: MetaRef,
  action: ExpandColumnSelectionAction,
) => {
  const columnItems = metaRef.current.cardGrid.flatMap(
    horizontalGroup => horizontalGroup.verticalGroups[action.anchorColumnIndex]?.items ?? [],
  )
  const anchorIndex = columnItems.findIndex(i => i.id === action.anchorId)
  const targetIndex = columnItems.findIndex(i => i.id === action.targetId)

  // modify selection iff the target and anchor cards are in the same column
  if (anchorIndex > -1 && targetIndex > -1) {
    let cardsToSelect: Array<MemexItemModel> = []
    // select items from card above to focused card
    if (targetIndex < anchorIndex) {
      cardsToSelect = columnItems.slice(targetIndex, anchorIndex + 1)
    }
    // select items from card below to focused card
    else if (targetIndex > anchorIndex) {
      cardsToSelect = columnItems.slice(anchorIndex, targetIndex + 1)
    }

    if (cardsToSelect.length) {
      const newState: CardSelectionState = {selected: {}}
      for (const card of cardsToSelect) {
        newState.selected[card.id] = true
      }
      return newState
    } else {
      return state
    }
  } else {
    return state
  }
}

const expandColumnSelectionViaKeysReducer = (
  state: CardSelectionState,
  metaRef: MetaRef,
  action: ExpandColumnSelectionViaKeysAction,
) => {
  const columnItems = metaRef.current.cardGrid.flatMap(
    horizontalGroup => horizontalGroup.verticalGroups[action.anchorColumnIndex]?.items ?? [],
  )
  const indices = columnItems.reduce<{[key: string]: number}>((acc, item, index) => {
    acc[item.id] = index
    return acc
  }, {})
  const anchorIndex = indices[action.anchorId]
  // ensure anchorId exists in the column
  if (anchorIndex !== undefined) {
    const {selected} = state
    const columnSelection = Object.keys(selected)
      // reduce current selection to anchor column
      .filter(id => selected[id] && indices[id] !== undefined)
      .sort((a, b) => {
        return (indices[a] ?? 0) - (indices[b] ?? 0)
      })
    const startIndex = indices[not_typesafe_nonNullAssertion(columnSelection[0])] ?? anchorIndex
    const endIndex = indices[not_typesafe_nonNullAssertion(columnSelection[columnSelection.length - 1])] ?? anchorIndex
    const up = action.direction === Direction.Up
    const down = action.direction === Direction.Down

    let cardsToSelect: Array<MemexItemModel> = []
    if (columnSelection.length <= 1) {
      // focused card <- start index, end index
      if (up) {
        cardsToSelect = columnItems.slice(startIndex - 1, startIndex + 1)
      } else if (down) {
        cardsToSelect = columnItems.slice(startIndex, startIndex + 2)
      }
    } else if (anchorIndex < endIndex) {
      // focused card <- start index
      // selected card
      // selected card <- end index
      if (up) {
        cardsToSelect = columnItems.slice(startIndex, endIndex)
      } else if (down) {
        cardsToSelect = columnItems.slice(startIndex, endIndex + 2)
      }
    } else {
      // selected card <- start index
      // selected card
      // focused card <- end index
      if (up && startIndex !== 0) {
        cardsToSelect = columnItems.slice(startIndex - 1, anchorIndex + 1)
      } else if (down) {
        cardsToSelect = columnItems.slice(startIndex + 1, anchorIndex + 1)
      }
    }

    if (cardsToSelect.length) {
      const newState: CardSelectionState = {selected: {}}
      cardsToSelect.map(card => (newState.selected[card.id] = true))
      return newState
    } else {
      return state
    }
  } else {
    return state
  }
}

const selectAllCycleReducer = (state: CardSelectionState, metaRef: MetaRef, action: SelectAllCycleAction) => {
  const selectedItems = Object.keys(state.selected).filter(key => state.selected[key] === true)

  const allItemsCount = metaRef.current.cardGrid.reduce((acc, horizontalGroup) => {
    return acc + horizontalGroup.verticalGroups.reduce((count, verticalGroup) => count + verticalGroup.items.length, 0)
  }, 0)

  const columnItems = metaRef.current.cardGrid.flatMap(
    horizontalGroup => horizontalGroup.verticalGroups[action.columnIndex]?.items ?? [],
  )
  const isNothingOrColumnPartiallySelected = selectedItems.length === 0 || selectedItems.length < columnItems.length

  const isEverythingSelected = selectedItems.length === allItemsCount
  const isColumnSelected = columnItems.every(item => selectedItems.includes(item.id.toString()))

  if (isNothingOrColumnPartiallySelected) {
    // select the column
    const newState: CardSelectionState = {selected: {}}
    columnItems.map(card => (newState.selected[card.id] = true))
    return newState
  } else if (isEverythingSelected) {
    // deselect all
    return {selected: {}}
  } else if (isColumnSelected) {
    // select all
    return toggleAllSelectedReducer(metaRef, createToggleAllSelectedAction(true))
  }

  return state
}

const useCardSelectionReducer = (
  initialState: CardSelectionState,
  metaRef: MetaRef,
): [CardSelectionState, React.Dispatch<CardSelectionAction>] => {
  const reducer: React.Reducer<CardSelectionState, CardSelectionAction> = (state, action) => {
    switch (action.type) {
      case ActionTypes.TOGGLE_SELECTED:
        return toggleSelectedReducer(state, action)
      case ActionTypes.TOGGLE_ALL_SELECTED:
        return toggleAllSelectedReducer(metaRef, action)
      case ActionTypes.EXPAND_COLUMN_SELECTION:
        return expandColumnSelectionReducer(state, metaRef, action)
      case ActionTypes.EXPAND_COLUMN_SELECTION_VIA_KEYS:
        return expandColumnSelectionViaKeysReducer(state, metaRef, action)
      case ActionTypes.SELECT_ALL_CYCLE:
        return selectAllCycleReducer(state, metaRef, action)
      case ActionTypes.INIT:
        return action.state
      default:
        return state
    }
  }

  return useReducer(reducer, initialState)
}

export const {CardSelectionProvider, useCardSelectionDispatch} = createCardSelectionContext()
