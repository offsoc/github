import {useReducer} from 'react'

import type {DropSide} from '../../../helpers/dnd-kit/drop-helpers'

export const DragStateActionTypes = {
  RESET_STATE: 'RESET_STATE',
  SET_DROP: 'SET_DROP',
} as const
export type DragStateActionTypes = ObjectValues<typeof DragStateActionTypes>

type ResetStateAction = {
  type: typeof DragStateActionTypes.RESET_STATE
}

type SetDropAction = {
  type: typeof DragStateActionTypes.SET_DROP
  dropId: number | undefined
  dropSide: DropSide
}

type DragStateAction = ResetStateAction | SetDropAction

export type DragState = {
  dropId: number | undefined
  dropSide: DropSide | undefined
}

const initialState: DragState = {
  dropId: undefined,
  dropSide: undefined,
}

function dragStateReducer(state: DragState, action: DragStateAction) {
  switch (action.type) {
    case DragStateActionTypes.RESET_STATE: {
      return {
        ...initialState,
      }
    }
    case DragStateActionTypes.SET_DROP: {
      return {
        ...state,
        dropId: action.dropId,
        dropSide: action.dropSide,
      }
    }
    default:
      return state
  }
}

export function useBoardDndReducer() {
  return useReducer(dragStateReducer, initialState)
}
