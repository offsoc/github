import type {ActionType, ReducerTableState, TableState, UseTableHooks} from 'react-table'

import {shallowEqual} from '../../helpers/util'

export type UseDeselectAllRowsTableState = {
  selectedRowIds?: Record<string, boolean>
}

const ActionTypes = {
  DESELECT_ALL_ROWS: 'useDeselectAllRows.deselectAllRows',
} as const
type ActionTypes = ObjectValues<typeof ActionTypes>

type DeselectAllRowsAction = {
  type: typeof ActionTypes.DESELECT_ALL_ROWS
}

type Action = DeselectAllRowsAction

const actionTypeValues: Array<string> = Object.values(ActionTypes)

const isPluginAction = (action: ActionType): action is Action => {
  return actionTypeValues.includes(action.type)
}

export const deselectAllRows = (): DeselectAllRowsAction => {
  return {
    type: ActionTypes.DESELECT_ALL_ROWS,
  }
}

export const useDeselectAllRows = <D extends object>(hooks: UseTableHooks<D>) => {
  hooks.stateReducers.push(reducer)
}

useDeselectAllRows.pluginName = 'useDeselectAllRows'

const defaultSelectedRowIds = {}
// There appears to be an open issue in `react-table` where
// `toggleAllRowsSelected` doesn't work correctly deselect rows that are not visible:
// https://github.com/tannerlinsley/react-table/issues/3142
// This reducer is a workaround that forces all rows to be deselected.
const reducer = <D extends object>(state: TableState<D>, action: ActionType): TableState<D> | undefined => {
  if (!isPluginAction(action)) {
    return state
  }

  let newState: ReducerTableState<D>

  switch (action.type) {
    case ActionTypes.DESELECT_ALL_ROWS:
      newState = {...state, selectedRowIds: defaultSelectedRowIds}

      if (shallowEqual(state, newState)) {
        return state
      }

      return newState
  }
}
