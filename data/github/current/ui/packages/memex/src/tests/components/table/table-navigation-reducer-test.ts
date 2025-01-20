import type {TableOptions} from 'react-table'

import {SystemColumnId} from '../../../client/api/columns/contracts/memex-column'
import {
  focusSearchInput,
  type NavigateActionOptions,
  type TableFocusMeta,
  type TableFocusState,
  TableFocusType,
  type TableNavigateAction,
  tableNavigationReducer,
} from '../../../client/components/react_table/navigation'
import type {TableDataType} from '../../../client/components/react_table/table-data-type'
import {ActionTypes} from '../../../client/navigation/context'
import {FocusType, NavigationDirection} from '../../../client/navigation/types'
import {createMockEnvironment} from '../../create-mock-environment'
import {columns, data} from './data/projects-table'
import {renderTable} from './table-renderer'

describe('tableNavigationReducer', () => {
  beforeEach(() => {
    createMockEnvironment()
  })

  it('does nothing if no current focus state', () => {
    const initialState = {focus: null, previousFocus: null}
    const meta = createMeta({
      initialState: {
        groupByColumnIds: [],
      },
    })
    const action = createNavigateAction(NavigationDirection.First, NavigationDirection.First)

    const expectedState = initialState
    const reducedState = tableNavigationReducer(initialState, meta, action)
    expect(reducedState).toBe(expectedState)
  })

  it('can move to next column when moving across from first row and column', () => {
    const initialState = createFocusedNavigationState({x: SystemColumnId.Title, y: 0})
    const meta = createMeta({
      initialState: {
        groupByColumnIds: [],
      },
    })
    const action = createNavigateAction(NavigationDirection.Next, NavigationDirection.Same)

    const expectedState = {
      focus: createFocusedNavigationState({x: 'status', y: 0}).focus,
      previousFocus: initialState.focus,
    }
    const reducedState = tableNavigationReducer(initialState, meta, action)
    expect(reducedState).toMatchObject(expectedState)
  })

  it('can move to next row when moving down from first row and column', () => {
    const initialState = createFocusedNavigationState({x: SystemColumnId.Title, y: 0})
    const meta = createMeta({
      initialState: {
        groupByColumnIds: [],
      },
    })
    const action = createNavigateAction(NavigationDirection.Same, NavigationDirection.Next)

    const expectedState = {
      focus: createFocusedNavigationState({x: SystemColumnId.Title, y: 1}).focus,
      previousFocus: initialState.focus,
    }
    const reducedState = tableNavigationReducer(initialState, meta, action)
    expect(reducedState).toMatchObject(expectedState)
  })

  it('can move to header focus when moving up from previous row', () => {
    const initialState = createFocusedNavigationState({x: SystemColumnId.Title, y: 0})
    const meta = createMeta({
      initialState: {
        groupByColumnIds: [],
      },
    })
    const action = createNavigateAction(NavigationDirection.Same, NavigationDirection.Previous)

    const expectedState = {
      focus: focusSearchInput().focus,
      previousFocus: initialState.focus,
    }
    const reducedState = tableNavigationReducer(initialState, meta, action)
    expect(reducedState).toMatchObject(expectedState)
  })

  it('wrap to next row if specified when moving across and no available columns', () => {
    const initialState = createFocusedNavigationState({x: 'status', y: 0})
    const meta = createMeta({
      initialState: {
        groupByColumnIds: [],
      },
    })

    const action = createNavigateAction(NavigationDirection.Next, NavigationDirection.Same)
    const reducedState = tableNavigationReducer(initialState, meta, action)
    expect(reducedState).toMatchObject({
      focus: initialState.focus,
      previousFocus: initialState.focus,
    })

    const actionWithWrap = createNavigateAction(NavigationDirection.Next, NavigationDirection.Same, {wrap: true})
    const reducedStateWithWrap = tableNavigationReducer(initialState, meta, actionWithWrap)
    const expectedState = {
      focus: createFocusedNavigationState({x: SystemColumnId.Title, y: 1}).focus,
      previousFocus: initialState.focus,
    }
    expect(reducedStateWithWrap).toMatchObject(expectedState)
  })
  it('wrap to next row from last row and cell moves to omnibar', () => {
    const initialState = createFocusedNavigationState({x: 'status', y: 1})
    const meta = createMeta({
      initialState: {
        // required for useCustomGroupBy
        groupByColumnIds: [],
      },
    })

    const action = createNavigateAction(NavigationDirection.Next, NavigationDirection.Same, {wrap: true})
    const reducedState = tableNavigationReducer(initialState, meta, action)
    const expectedState = {
      focus: createOmnibarFocusState().focus,
      previousFocus: initialState.focus,
    }
    expect(reducedState).toMatchObject(expectedState)
  })

  describe('revert to previously focused', () => {
    it('if omnibar is selected revert to previously focused', () => {
      const initialState = {
        focus: createOmnibarFocusState().focus,
        previousFocus: createFocusedNavigationState({x: SystemColumnId.Title, y: 0}).focus,
      }
      const meta = createMeta({
        initialState: {
          groupByColumnIds: [],
        },
      })
      const action = createNavigateAction(undefined, undefined, {previousFocus: true})

      const expectedState = {
        focus: initialState.previousFocus,
        previousFocus: initialState.previousFocus,
      }
      const reducedState = tableNavigationReducer(initialState, meta, action)
      expect(reducedState).toEqual(expectedState)
    })
  })
})

function createMeta(
  options: Partial<TableOptions<TableDataType>>,
  getHeaderFocus = () => focusSearchInput().focus,
): TableFocusMeta {
  const {result} = renderTable(columns, data, options)
  const instance = result.current
  return {
    instance,
    getHeaderFocus,
  }
}

function createNavigateAction(
  x: NavigationDirection | undefined,
  y: NavigationDirection | undefined,
  details?: NavigateActionOptions,
): TableNavigateAction {
  return {
    navigation: {focusType: FocusType.Focus, x, y, details},
    type: ActionTypes.NAVIGATE,
  }
}

function createFocusedNavigationState({x, y}: {x: string; y: number}): TableFocusState {
  const rowIdAtIndexY = data[y].id.toString()
  return {
    focus: {
      type: 'coordinate',
      details: {x, y: rowIdAtIndexY, meta: {}},
      focusType: FocusType.Focus,
    },
    previousFocus: null,
  }
}

function createOmnibarFocusState(): TableFocusState {
  return {
    focus: {
      type: TableFocusType.FOOTER,
      details: null,
      focusType: FocusType.Focus,
    },
    previousFocus: null,
  }
}
