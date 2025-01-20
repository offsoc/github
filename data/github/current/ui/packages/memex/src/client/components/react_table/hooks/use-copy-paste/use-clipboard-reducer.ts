import {type Dispatch, type Reducer, useReducer} from 'react'

import {ClipboardActionTypes} from './constants'
import {emptyClipboard} from './empty-clipboard'
import type {ClipboardAction, ClipboardState} from './types'

const reducer: Reducer<ClipboardState, ClipboardAction> = (state, action) => {
  switch (action.type) {
    case ClipboardActionTypes.CLEAR_CLIPBOARD:
      return emptyClipboard
    case ClipboardActionTypes.UPDATE_CLIPBOARD:
      return {type: 'populated', value: action.state}
    default:
      return state
  }
}

export const useClipboardReducer = (initialState: ClipboardState): [ClipboardState, Dispatch<ClipboardAction>] => {
  return useReducer(reducer, initialState)
}
