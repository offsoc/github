type PaginatedArchiveState = {
  currentCursor?: string
  previousCursors: Array<{cursor: string | undefined; previousPagesItemCount: number}>
  debouncedFilterValue: string
  itemSelection: Array<number> | 'all_on_server'
}

type SetNextCursorAction = {
  type: 'SET_NEXT_CURSOR'
  nextCursor: string
  currentPageItemCount: number
}

type SetPreviousCursorAction = {
  type: 'SET_PREVIOUS_CURSOR'
}

type SetDebouncedFilterValueAction = {
  type: 'SET_DEBOUNCED_FILTER_VALUE'
  debouncedFilterValue: string
}

type SetItemSelectionAction = {
  type: 'SET_ITEM_SELECTION'
  itemSelection: Array<number> | 'all_on_server'
}

type PaginatedArchiveAction =
  | SetNextCursorAction
  | SetPreviousCursorAction
  | SetDebouncedFilterValueAction
  | SetItemSelectionAction

export const setNextCursor = (nextCursor: string, currentPageItemCount: number): SetNextCursorAction => {
  return {type: 'SET_NEXT_CURSOR', nextCursor, currentPageItemCount}
}

export const setPreviousCursor = (): SetPreviousCursorAction => {
  return {type: 'SET_PREVIOUS_CURSOR'}
}

export const setDebouncedFilterValue = (debouncedFilterValue: string): SetDebouncedFilterValueAction => {
  return {type: 'SET_DEBOUNCED_FILTER_VALUE', debouncedFilterValue}
}

export const setItemSelection = (itemSelection: Array<number> | 'all_on_server'): SetItemSelectionAction => {
  return {type: 'SET_ITEM_SELECTION', itemSelection}
}

export const paginatedArchiveReducer = (
  state: PaginatedArchiveState,
  action: PaginatedArchiveAction,
): PaginatedArchiveState => {
  switch (action.type) {
    case 'SET_NEXT_CURSOR': {
      const lastCursor = state.previousCursors[state.previousCursors.length - 1]
      const previousCursors = state.previousCursors.concat({
        cursor: state.currentCursor,
        previousPagesItemCount: (lastCursor ? lastCursor.previousPagesItemCount : 0) + action.currentPageItemCount,
      })
      return {
        ...state,
        previousCursors,
        currentCursor: action.nextCursor,
        itemSelection: state.itemSelection === 'all_on_server' ? 'all_on_server' : [],
      }
    }
    case 'SET_PREVIOUS_CURSOR': {
      const previousCursors = [...state.previousCursors]
      const currentCursor = previousCursors.pop()
      return {
        ...state,
        previousCursors,
        currentCursor: currentCursor?.cursor,
        itemSelection: state.itemSelection === 'all_on_server' ? 'all_on_server' : [],
      }
    }
    case 'SET_DEBOUNCED_FILTER_VALUE': {
      return {
        ...state,
        debouncedFilterValue: action.debouncedFilterValue,
        previousCursors: [],
        currentCursor: undefined,
        itemSelection: [],
      }
    }
    case 'SET_ITEM_SELECTION': {
      return {
        ...state,
        itemSelection: action.itemSelection,
      }
    }
    default:
      return state
  }
}

export const initialPaginatedArchiveState: PaginatedArchiveState = {
  currentCursor: undefined,
  previousCursors: [],
  debouncedFilterValue: '',
  itemSelection: [],
}
