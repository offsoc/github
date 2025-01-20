import type {ActionType, ReducerTableState, TableState, UseTableHooks} from 'react-table'

import {shallowEqual} from '../../helpers/util'
import type {CellFocus} from './navigation'

export type UseRowMenuShortcutTableState = {
  /**
   * The cell from which the shortcut was just invoked.
   */
  rowMenuShortcutOrigin?: CellFocus
}

const ActionTypes = {
  SET_ROW_MENU_OPEN: 'useRowMenuShortcut.setRowMenuOpen',
} as const
type ActionTypes = ObjectValues<typeof ActionTypes>

type SetRowMenuOpenAction = {
  type: typeof ActionTypes.SET_ROW_MENU_OPEN
  origin?: CellFocus
}

type Action = SetRowMenuOpenAction

const actionTypeValues: Array<string> = Object.values(ActionTypes)

const isPluginAction = (action: ActionType): action is Action => {
  return actionTypeValues.includes(action.type)
}

export const setRowMenuOpen = (origin?: CellFocus): SetRowMenuOpenAction => {
  return {
    type: ActionTypes.SET_ROW_MENU_OPEN,
    origin,
  }
}

export const useRowMenuShortcut = <D extends object>(hooks: UseTableHooks<D>) => {
  hooks.stateReducers.push(reducer)
}

useRowMenuShortcut.pluginName = 'useRowMenuShortcut'

const reducer = <D extends object>(state: TableState<D>, action: ActionType): TableState<D> | undefined => {
  if (!isPluginAction(action)) {
    return state
  }

  let newState: ReducerTableState<D>

  switch (action.type) {
    case ActionTypes.SET_ROW_MENU_OPEN:
      newState = {...state, rowMenuShortcutOrigin: action.origin}

      if (shallowEqual(state, newState)) {
        return state
      }

      return newState
  }
}
