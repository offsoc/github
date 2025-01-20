import {
  type BoardFocusState,
  type BoardNavigateAction,
  boardNavigationReducer,
  focusPrevious,
} from '../../../client/components/board/navigation'
import {ActionTypes} from '../../../client/navigation/context'
import {FocusType, NavigationDirection} from '../../../client/navigation/types'
import {createMockEnvironment} from '../../create-mock-environment'
import {createCardGrid} from './board-test-helper'

describe('boardNavigationReducer', () => {
  beforeEach(() => {
    createMockEnvironment()
  })
  it('does nothing if no current focus state', () => {
    const initialState = createInitialState()
    const meta = createCardGrid([])
    const action = createNavigateAction(NavigationDirection.First, NavigationDirection.First)

    const expectedState = initialState
    const reducedState = boardNavigationReducer(initialState, meta, action)
    expect(reducedState).toBe(expectedState)
  })

  it('focuses omnibar even if no current focus state', () => {
    const initialState = createInitialState()
    const meta = createCardGrid([{id: 'column1'}])
    const action: BoardNavigateAction = {
      type: ActionTypes.NAVIGATE,
      navigation: {
        focusType: FocusType.Focus,
        details: {type: 'footer', verticalGroupId: 'column1', horizontalGroupIndex: 0},
      },
    }

    const expectedState = createOmnibarFocusState('column1', 0)
    const reducedState = boardNavigationReducer(initialState, meta, action)
    expect(reducedState).toEqual(expectedState)
  })

  it('focuses omnibar for current column', () => {
    const initialState = createCardFocusState(1, 5, 0)
    const meta = createCardGrid([{id: 'column1'}, {id: 'column2', items: [5, 10]}])
    const action: BoardNavigateAction = {
      type: ActionTypes.NAVIGATE,
      navigation: {focusType: FocusType.Focus, details: {type: 'footer', horizontalGroupIndex: 0}},
    }

    const expectedState = {
      focus: createOmnibarFocusState('column2', 0).focus,
      previousFocus: initialState.focus,
    }
    const reducedState = boardNavigationReducer(initialState, meta, action)
    expect(reducedState).toEqual(expectedState)
  })

  it('focuses omnibar for current column in a group', () => {
    const initialState = createCardFocusState(1, 5, 0)
    const meta = createCardGrid([{id: 'column1'}, {id: 'column2', items: [5, 10]}])

    const action: BoardNavigateAction = {
      type: ActionTypes.NAVIGATE,
      navigation: {
        focusType: FocusType.Focus,
        details: {
          type: 'footer',
          verticalGroupId: 'column2',
          horizontalGroupIndex: 0,
        },
      },
    }

    const expectedState = {
      focus: createOmnibarFocusState('column2', 0).focus,
      previousFocus: initialState.focus,
    }
    const reducedState = boardNavigationReducer(initialState, meta, action)
    expect(reducedState).toEqual(expectedState)
  })

  describe('focus nearest card', () => {
    it('finds card that will soon have the same index as card id in action', () => {
      const initialState = createInitialState()
      const meta = createCardGrid([{id: 'column1', items: [5, 10]}])
      const action: BoardNavigateAction = {
        type: ActionTypes.NAVIGATE,
        navigation: {
          focusType: FocusType.Focus,
          details: {
            type: 'nearestCard',
            indexOfCardWithinColumn: 0,
            columnIndex: 0,
            cardId: 5,
            horizontalGroupIndex: 0,
          },
        },
      }

      const expectedState = {
        focus: createCardFocusState(0, 10, 0).focus,
        previousFocus: null,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('finds card just above last card in column', () => {
      const initialState = createInitialState()
      const meta = createCardGrid([{id: 'column1', items: [5, 10]}])
      const action: BoardNavigateAction = {
        type: ActionTypes.NAVIGATE,
        navigation: {
          focusType: FocusType.Focus,
          details: {
            type: 'nearestCard',
            indexOfCardWithinColumn: 1,
            columnIndex: 0,
            cardId: 10,
            horizontalGroupIndex: 0,
          },
        },
      }

      const expectedState = {
        focus: createCardFocusState(0, 5, 0).focus,
        previousFocus: null,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('focuses omnibar for column if last card in the board', () => {
      const initialState = createInitialState()
      const meta = createCardGrid([{id: 'column1', items: [5]}, {id: 'column2'}, {id: 'column3'}])
      const action: BoardNavigateAction = {
        type: ActionTypes.NAVIGATE,
        navigation: {
          focusType: FocusType.Focus,
          details: {
            type: 'nearestCard',
            indexOfCardWithinColumn: 0,
            columnIndex: 0,
            cardId: 5,
            horizontalGroupIndex: 0,
          },
        },
      }

      const expectedState = {
        focus: createOmnibarFocusState('column1', 0).focus,
        previousFocus: null,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('finds first card in previous column if there', () => {
      const initialState = createInitialState()
      const meta = createCardGrid([
        {id: 'column1', items: [5, 10]},
        {id: 'column2', items: [15]},
        {id: 'column3', items: [20, 25]},
      ])
      const action: BoardNavigateAction = {
        type: ActionTypes.NAVIGATE,
        navigation: {
          focusType: FocusType.Focus,
          details: {
            type: 'nearestCard',
            indexOfCardWithinColumn: 0,
            columnIndex: 1,
            cardId: 15,
            horizontalGroupIndex: 0,
          },
        },
      }

      const expectedState = {
        focus: createCardFocusState(0, 5, 0).focus,
        previousFocus: null,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('finds first card in next column if there', () => {
      const initialState = createInitialState()
      const meta = createCardGrid([
        {id: 'column1', items: []},
        {id: 'column2', items: [15]},
        {id: 'column3', items: [20, 25]},
      ])
      const action: BoardNavigateAction = {
        type: ActionTypes.NAVIGATE,
        navigation: {
          focusType: FocusType.Focus,
          details: {
            type: 'nearestCard',
            indexOfCardWithinColumn: 0,
            columnIndex: 1,
            cardId: 15,
            horizontalGroupIndex: 0,
          },
        },
      }

      const expectedState = {
        focus: createCardFocusState(2, 20, 0).focus,
        previousFocus: null,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('finds card in column that is not a neighbor if neighbor columns are empty', () => {
      const initialState = createInitialState()
      const meta = createCardGrid([
        {id: 'column1', items: []},
        {id: 'column2', items: [15]},
        {id: 'column3', items: []},
        {id: 'column4', items: [20]},
      ])
      const action: BoardNavigateAction = {
        type: ActionTypes.NAVIGATE,
        navigation: {
          focusType: FocusType.Focus,
          details: {
            type: 'nearestCard',
            indexOfCardWithinColumn: 0,
            columnIndex: 1,
            cardId: 15,
            horizontalGroupIndex: 0,
          },
        },
      }

      const expectedState = {
        focus: createCardFocusState(3, 20, 0).focus,
        previousFocus: null,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })
  })

  describe('card initial focus', () => {
    it('moves to previous card in column when moving up', () => {
      const initialState = createCardFocusState(0, 10, 0)
      const meta = createCardGrid([{id: 'column1', items: [5, 10]}])
      const action = createNavigateAction(undefined, NavigationDirection.Previous)

      const expectedState = {
        focus: createCardFocusState(0, 5, 0).focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('moves to search input when trying to move up and already first card in column', () => {
      const initialState = createCardFocusState(0, 5, 0)
      const meta = createCardGrid([{id: 'column1', items: [5, 10]}])
      const action = createNavigateAction(undefined, NavigationDirection.Previous)

      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(
        expect.objectContaining({
          focus: expect.objectContaining({
            type: 'search-input',
          }),
          previousFocus: initialState.focus,
        }),
      )
    })

    it('moves to next card in column when moving down', () => {
      const initialState = createCardFocusState(0, 5, 0)
      const meta = createCardGrid([{id: 'column1', items: [5, 10]}])
      const action = createNavigateAction(undefined, NavigationDirection.Next)

      const expectedState = {
        focus: createCardFocusState(0, 10, 0).focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('moves to omnibar when moving down from last card in column', () => {
      const initialState = createCardFocusState(0, 10, 0)
      const meta = createCardGrid([{id: 'column1', items: [5, 10]}])
      const action = createNavigateAction(undefined, NavigationDirection.Next)

      const expectedState = {
        focus: createOmnibarFocusState('column1', 0).focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('moves to card in next column when moving right', () => {
      const initialState = createCardFocusState(0, 5, 0)
      const meta = createCardGrid([
        {id: 'column1', items: [5, 10]},
        {id: 'column2', items: [15]},
      ])
      const action = createNavigateAction(NavigationDirection.Next, undefined)

      const expectedState = {
        focus: createCardFocusState(1, 15, 0).focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('moves to last card in next column when moving right and not enough cards in new column', () => {
      const initialState = createCardFocusState(0, 10, 0)
      const meta = createCardGrid([
        {id: 'column1', items: [5, 10]},
        {id: 'column2', items: [15]},
      ])
      const action = createNavigateAction(NavigationDirection.Next, undefined)

      const expectedState = {
        focus: createCardFocusState(1, 15, 0).focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('does nothing when in last column and trying to move right', () => {
      const initialState = createCardFocusState(1, 15, 0)
      const meta = createCardGrid([
        {id: 'column1', items: [5, 10]},
        {id: 'column2', items: [15]},
      ])
      const action = createNavigateAction(NavigationDirection.Next, undefined)

      const expectedState = {
        focus: initialState.focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('does nothing when trying to move right and only empty columns to the right', () => {
      const initialState = createCardFocusState(1, 15, 0)
      const meta = createCardGrid([
        {id: 'column1', items: [5, 10]},
        {id: 'column2', items: []},
        {id: 'column3', items: []},
      ])
      const action = createNavigateAction(NavigationDirection.Next, undefined)

      const expectedState = {
        focus: initialState.focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('finds column with cards when trying to move right and empty columns', () => {
      const initialState = createCardFocusState(0, 10, 0)
      const meta = createCardGrid([
        {id: 'column1', items: [5, 10]},
        {id: 'column2', items: []},
        {id: 'column3', items: []},
        {id: 'column4', items: [15]},
      ])
      const action = createNavigateAction(NavigationDirection.Next, undefined)

      const expectedState = {
        focus: createCardFocusState(3, 15, 0).focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('moves to card in previous column when moving left', () => {
      const initialState = createCardFocusState(1, 10, 0)
      const meta = createCardGrid([
        {id: 'column1', items: [5]},
        {id: 'column2', items: [10, 15]},
      ])
      const action = createNavigateAction(NavigationDirection.Previous, undefined)

      const expectedState = {
        focus: createCardFocusState(0, 5, 0).focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('moves to last card in previous column when moving left and not enough cards in new column', () => {
      const initialState = createCardFocusState(1, 15, 0)
      const meta = createCardGrid([
        {id: 'column1', items: [5]},
        {id: 'column2', items: [10, 15]},
      ])
      const action = createNavigateAction(NavigationDirection.Previous, undefined)

      const expectedState = {
        focus: createCardFocusState(0, 5, 0).focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('does nothing when in first column and trying to move left', () => {
      const initialState = createCardFocusState(0, 5, 0)
      const meta = createCardGrid([
        {id: 'column1', items: [5, 10]},
        {id: 'column2', items: [15]},
      ])
      const action = createNavigateAction(NavigationDirection.Previous, undefined)

      const expectedState = {
        focus: initialState.focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('does nothing when trying to move left and only empty columns to the left', () => {
      const initialState = createCardFocusState(2, 10, 0)
      const meta = createCardGrid([
        {id: 'column1', items: []},
        {id: 'column2', items: []},
        {id: 'column3', items: [5, 10]},
      ])
      const action = createNavigateAction(NavigationDirection.Previous, undefined)

      const expectedState = {
        focus: initialState.focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('finds column with cards when trying to move left and empty columns', () => {
      const initialState = createCardFocusState(3, 15, 0)
      const meta = createCardGrid([
        {id: 'column1', items: [5]},
        {id: 'column2', items: []},
        {id: 'column3', items: []},
        {id: 'column4', items: [10, 15]},
      ])
      const action = createNavigateAction(NavigationDirection.Previous, undefined)

      const expectedState = {
        focus: createCardFocusState(0, 5, 0).focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('moves to last card in column with Last in y direction', () => {
      const initialState = createCardFocusState(0, 5, 0)
      const meta = createCardGrid([{id: 'column1', items: [5, 10, 15]}])
      const action = createNavigateAction(undefined, NavigationDirection.Last)

      const expectedState = {
        focus: createCardFocusState(0, 15, 0).focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('does nothing when trying to move to last card in column with Last in y direction and already the last', () => {
      const initialState = createCardFocusState(0, 15, 0)
      const meta = createCardGrid([{id: 'column1', items: [5, 10, 15]}])
      const action = createNavigateAction(undefined, NavigationDirection.Last)

      const expectedState = {
        focus: initialState.focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('moves to first card in column with First in y direction', () => {
      const initialState = createCardFocusState(0, 15, 0)
      const meta = createCardGrid([{id: 'column1', items: [5, 10, 15]}])
      const action = createNavigateAction(undefined, NavigationDirection.First)

      const expectedState = {
        focus: createCardFocusState(0, 5, 0).focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('does nothing when trying to move to first card in column with First in y direction and already the first', () => {
      const initialState = createCardFocusState(0, 5, 0)
      const meta = createCardGrid([{id: 'column1', items: [5, 10, 15]}])
      const action = createNavigateAction(undefined, NavigationDirection.First)

      const expectedState = {
        focus: initialState.focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('moves to card in first column with First in x direction', () => {
      const initialState = createCardFocusState(1, 20, 0)
      const meta = createCardGrid([
        {id: 'column1', items: [5, 10]},
        {id: 'column2', items: [15, 20]},
      ])
      const action = createNavigateAction(NavigationDirection.First, undefined)

      const expectedState = {
        focus: createCardFocusState(0, 10, 0).focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('handles not enough cards in first column with First in x direction', () => {
      const initialState = createCardFocusState(1, 20, 0)
      const meta = createCardGrid([
        {id: 'column1', items: [5]},
        {id: 'column2', items: [15, 20]},
      ])
      const action = createNavigateAction(NavigationDirection.First, undefined)

      const expectedState = {
        focus: createCardFocusState(0, 5, 0).focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('handles first column being empty with First in x direction', () => {
      const initialState = createCardFocusState(2, 20, 0)
      const meta = createCardGrid([
        {id: 'column1', items: []},
        {id: 'column2', items: [5]},
        {id: 'column3', items: [15, 20]},
      ])
      const action = createNavigateAction(NavigationDirection.First, undefined)

      const expectedState = {
        focus: createCardFocusState(1, 5, 0).focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('does nothing with First in x direction when already in first column', () => {
      const initialState = createCardFocusState(0, 10, 0)
      const meta = createCardGrid([
        {id: 'column1', items: [5, 10]},
        {id: 'column2', items: [15, 20]},
      ])
      const action = createNavigateAction(NavigationDirection.First, undefined)

      const expectedState = {
        focus: initialState.focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('does nothing with First in x direction when already in first column with items', () => {
      const initialState = createCardFocusState(1, 10, 0)
      const meta = createCardGrid([
        {id: 'column1', items: []},
        {id: 'column2', items: [5, 10]},
      ])
      const action = createNavigateAction(NavigationDirection.First, undefined)

      const expectedState = {
        focus: initialState.focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('moves to card in last column with Last in x direction', () => {
      const initialState = createCardFocusState(0, 10, 0)
      const meta = createCardGrid([
        {id: 'column1', items: [5, 10]},
        {id: 'column2', items: [15, 20]},
      ])
      const action = createNavigateAction(NavigationDirection.Last, undefined)

      const expectedState = {
        focus: createCardFocusState(1, 20, 0).focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('handles not enough cards in last column with Last in x direction', () => {
      const initialState = createCardFocusState(0, 10, 0)
      const meta = createCardGrid([
        {id: 'column1', items: [5, 10]},
        {id: 'column2', items: [15]},
      ])
      const action = createNavigateAction(NavigationDirection.Last, undefined)

      const expectedState = {
        focus: createCardFocusState(1, 15, 0).focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('handles last column being empty with Last in x direction', () => {
      const initialState = createCardFocusState(0, 10, 0)
      const meta = createCardGrid([
        {id: 'column1', items: [5, 10]},
        {id: 'column2', items: [15]},
        {id: 'column3', items: []},
      ])
      const action = createNavigateAction(NavigationDirection.Last, undefined)

      const expectedState = {
        focus: createCardFocusState(1, 15, 0).focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('does nothing with Last in x direction when already in last column', () => {
      const initialState = createCardFocusState(1, 20, 0)
      const meta = createCardGrid([
        {id: 'column1', items: [5, 10]},
        {id: 'column2', items: [15, 20]},
      ])
      const action = createNavigateAction(NavigationDirection.Last, undefined)

      const expectedState = {
        focus: initialState.focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('does nothing with Last in x direction when already in last column with items', () => {
      const initialState = createCardFocusState(0, 10, 0)
      const meta = createCardGrid([
        {id: 'column1', items: [5, 10]},
        {id: 'column2', items: []},
      ])
      const action = createNavigateAction(NavigationDirection.Last, undefined)

      const expectedState = {
        focus: initialState.focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('moves to first card in first column with First in both directions', () => {
      const initialState = createCardFocusState(1, 20, 0)
      const meta = createCardGrid([
        {id: 'column1', items: [5, 10]},
        {id: 'column2', items: [15, 20]},
      ])
      const action = createNavigateAction(NavigationDirection.First, NavigationDirection.First)

      const expectedState = {
        focus: createCardFocusState(0, 5, 0).focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('does nothing when already on first card in first column with First in both directions', () => {
      const initialState = createCardFocusState(0, 5, 0)
      const meta = createCardGrid([
        {id: 'column1', items: [5, 10]},
        {id: 'column2', items: [15, 20]},
      ])
      const action = createNavigateAction(NavigationDirection.First, NavigationDirection.First)

      const expectedState = {
        focus: initialState.focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('handles empty columns with First in both directions', () => {
      const initialState = createCardFocusState(2, 10, 0)
      const meta = createCardGrid([
        {id: 'column1', items: []},
        {id: 'column2', items: []},
        {id: 'column3', items: [5, 10]},
      ])
      const action = createNavigateAction(NavigationDirection.First, NavigationDirection.First)

      const expectedState = {
        focus: createCardFocusState(2, 5, 0).focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('moves to last card in last column with Last in both directions', () => {
      const initialState = createCardFocusState(0, 5, 0)
      const meta = createCardGrid([
        {id: 'column1', items: [5, 10]},
        {id: 'column2', items: [15, 20]},
      ])
      const action = createNavigateAction(NavigationDirection.Last, NavigationDirection.Last)

      const expectedState = {
        focus: createCardFocusState(1, 20, 0).focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('does nothing when already on last card in last column with Last in both directions', () => {
      const initialState = createCardFocusState(1, 20, 0)
      const meta = createCardGrid([
        {id: 'column1', items: [5, 10]},
        {id: 'column2', items: [15, 20]},
      ])
      const action = createNavigateAction(NavigationDirection.Last, NavigationDirection.Last)

      const expectedState = {
        focus: initialState.focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('handles empty columns with Last in both directions', () => {
      const initialState = createCardFocusState(0, 5, 0)
      const meta = createCardGrid([
        {id: 'column1', items: [5, 10]},
        {id: 'column2', items: []},
        {id: 'column3', items: []},
      ])
      const action = createNavigateAction(NavigationDirection.Last, NavigationDirection.Last)

      const expectedState = {
        focus: createCardFocusState(0, 10, 0).focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })
  })

  describe('omnibar initial focus', () => {
    it('moves to search input when trying to move up and no cards in focused column', () => {
      const initialState = createOmnibarFocusState('column1', 0)
      const meta = createCardGrid([{id: 'column1'}, {id: 'column2', items: [5, 10]}])
      const action = createNavigateAction(undefined, NavigationDirection.Previous)

      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(
        expect.objectContaining({
          focus: expect.objectContaining({
            type: 'search-input',
          }),
          previousFocus: initialState.focus,
        }),
      )
    })

    it('moves to last card in column when moving up', () => {
      const initialState = createOmnibarFocusState('column1', 0)
      const meta = createCardGrid([{id: 'column1', items: [5, 10]}])
      const action = createNavigateAction(undefined, NavigationDirection.Previous)

      const expectedState = {
        focus: createCardFocusState(0, 10, 0).focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('handles First in both directions', () => {
      const initialState = createOmnibarFocusState('column2', 0)
      const meta = createCardGrid([
        {id: 'column1', items: [5, 10]},
        {id: 'column2', items: [15, 20]},
      ])
      const action = createNavigateAction(NavigationDirection.First, NavigationDirection.First)

      const expectedState = {
        focus: createCardFocusState(0, 5, 0).focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('handles First in both directions when first column is empty', () => {
      const initialState = createOmnibarFocusState('column1', 0)
      const meta = createCardGrid([{id: 'column1'}, {id: 'column2', items: [15, 20]}])
      const action = createNavigateAction(NavigationDirection.First, NavigationDirection.First)

      const expectedState = {
        focus: createCardFocusState(1, 15, 0).focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('handles First in both directions when board is empty', () => {
      const initialState = createOmnibarFocusState('column1', 0)
      const meta = createCardGrid([{id: 'column1'}, {id: 'column2'}])
      const action = createNavigateAction(NavigationDirection.First, NavigationDirection.First)

      const expectedState = {
        focus: initialState.focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('handles Last in both directions from omnibar', () => {
      const initialState = createOmnibarFocusState('column1', 0)
      const meta = createCardGrid([
        {id: 'column1', items: [5, 10]},
        {id: 'column2', items: [15, 20]},
      ])
      const action = createNavigateAction(NavigationDirection.Last, NavigationDirection.Last)

      const expectedState = {
        focus: createCardFocusState(1, 20, 0).focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('handles Last in both directions when last column is empty from omnibar', () => {
      const initialState = createOmnibarFocusState('column2', 0)
      const meta = createCardGrid([{id: 'column1', items: [5, 10]}, {id: 'column2'}])
      const action = createNavigateAction(NavigationDirection.Last, NavigationDirection.Last)

      const expectedState = {
        focus: createCardFocusState(0, 10, 0).focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('handles Last in both directions when board is empty', () => {
      const initialState = createOmnibarFocusState('column1', 0)
      const meta = createCardGrid([{id: 'column1'}, {id: 'column2'}])
      const action = createNavigateAction(NavigationDirection.Last, NavigationDirection.Last)

      const expectedState = {
        focus: initialState.focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('handles First in y with cards in column', () => {
      const initialState = createOmnibarFocusState('column1', 0)
      const meta = createCardGrid([{id: 'column1', items: [5, 10]}, {id: 'column2'}])
      const action = createNavigateAction(undefined, NavigationDirection.First)

      const expectedState = {
        focus: createCardFocusState(0, 5, 0).focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('handles First in y with no cards in column', () => {
      const initialState = createOmnibarFocusState('column2', 0)
      const meta = createCardGrid([{id: 'column1', items: [5, 10]}, {id: 'column2'}])
      const action = createNavigateAction(undefined, NavigationDirection.First)

      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(
        expect.objectContaining({
          focus: expect.objectContaining({
            type: 'search-input',
          }),
          previousFocus: initialState.focus,
        }),
      )
    })

    it('handles Last in y with cards in column', () => {
      const initialState = createOmnibarFocusState('column1', 0)
      const meta = createCardGrid([{id: 'column1', items: [5, 10]}, {id: 'column2'}])
      const action = createNavigateAction(undefined, NavigationDirection.Last)

      const expectedState = {
        focus: createCardFocusState(0, 10, 0).focus,
        previousFocus: initialState.focus,
      }
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('handles Last in y with no cards in column', () => {
      const initialState = createOmnibarFocusState('column2', 0)
      const meta = createCardGrid([{id: 'column1', items: [5, 10]}, {id: 'column2'}])
      const action = createNavigateAction(undefined, NavigationDirection.Last)

      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(
        expect.objectContaining({
          focus: expect.objectContaining({
            type: 'search-input',
          }),
          previousFocus: initialState.focus,
        }),
      )
    })
  })

  describe('revert to previously focused', () => {
    it('if search input is selected revert to previously focused', () => {
      const initialState = {
        focus: createSearchInputFocusState('column2').focus,
        previousFocus: createCardFocusState(2, 2, 0).focus,
      }
      const meta = createCardGrid([{id: 'column1', items: [5, 10]}, {id: 'column2'}])
      const action = focusPrevious()

      const expectedState = {focus: initialState.previousFocus, previousFocus: null}
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })

    it('if omnibar is selected revert to previously focused', () => {
      const initialState = {
        focus: createOmnibarFocusState('column2', 0).focus,
        previousFocus: createCardFocusState(2, 2, 0).focus,
      }
      const meta = createCardGrid([{id: 'column1', items: [5, 10]}, {id: 'column2'}])
      const action = focusPrevious()

      const expectedState = {focus: initialState.previousFocus, previousFocus: null}
      const reducedState = boardNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })
  })
})

function createInitialState(state?: Partial<BoardFocusState>): BoardFocusState {
  const init = {focus: null, previousFocus: null}
  const next = state ? {...init, ...state} : init

  return next
}

function createSearchInputFocusState(verticalGroupId: string): BoardFocusState {
  return createInitialState({
    focus: {type: 'search-input', focusType: FocusType.Focus, details: {verticalGroupId}},
  })
}

function createOmnibarFocusState(verticalGroupId: string, horizontalGroupIndex: number): BoardFocusState {
  return createInitialState({
    focus: {type: 'footer', focusType: FocusType.Focus, details: {verticalGroupId, horizontalGroupIndex}},
  })
}

function createCardFocusState(columnIndex: number, cardId: number, horizontalGroupIndex: number): BoardFocusState {
  return createInitialState({
    focus: {
      type: 'coordinate',
      focusType: FocusType.Focus,
      details: {
        x: columnIndex,
        y: cardId,
        meta: {
          horizontalGroupIndex,
        },
      },
    },
  })
}

function createNavigateAction(
  x: NavigationDirection | undefined,
  y: NavigationDirection | undefined,
): BoardNavigateAction {
  return {
    navigation: {focusType: FocusType.Focus, x, y},
    type: ActionTypes.NAVIGATE,
  }
}
