import {useReducer} from 'react'

import type {PersistedOption} from '../../../api/columns/contracts/single-select'
import type {StatusUpdate} from '../status-updates-context'

export const StatusUpdateActionTypes = {
  UPDATE_STATUS: 'UPDATE_STATUS',
  UPDATE_BODY: 'UPDATE_BODY',
  UPDATE_START_DATE: 'UPDATE_START_DATE',
  UPDATE_TARGET_DATE: 'UPDATE_TARGET_DATE',
  SET_STATUS_UPDATE: 'SET_STATUS_UPDATE',
  CLEAR_STATUS_UPDATE: 'CLEAR_STATUS_UPDATE',
} as const

export type StatusUpdateEditorState = {[id: string]: StatusUpdate}

export type StatusUpdateAction =
  | {
      type: typeof StatusUpdateActionTypes.UPDATE_BODY
      payload: {id: number; body: string}
    }
  | {
      type: typeof StatusUpdateActionTypes.UPDATE_STATUS
      payload: {id: number; status: PersistedOption | null}
    }
  | {
      type: typeof StatusUpdateActionTypes.UPDATE_START_DATE | typeof StatusUpdateActionTypes.UPDATE_TARGET_DATE
      payload: {id: number; date: Date | null}
    }
  | {
      type: typeof StatusUpdateActionTypes.SET_STATUS_UPDATE
      payload: StatusUpdate
    }
  | {
      type: typeof StatusUpdateActionTypes.CLEAR_STATUS_UPDATE
      payload: {id: number}
    }

const statusUpdateDraftsReducer = (
  state: StatusUpdateEditorState,
  {type, payload}: StatusUpdateAction,
): StatusUpdateEditorState => {
  const statusUpdate = state[payload.id]

  switch (type) {
    case StatusUpdateActionTypes.UPDATE_BODY: {
      if (!statusUpdate) return state
      return {...state, [payload.id]: {...statusUpdate, body: payload.body}}
    }
    case StatusUpdateActionTypes.UPDATE_START_DATE: {
      if (!statusUpdate) return state
      return {...state, [payload.id]: {...statusUpdate, startDate: payload.date}}
    }
    case StatusUpdateActionTypes.UPDATE_STATUS: {
      if (!statusUpdate) return state
      return {...state, [payload.id]: {...statusUpdate, status: payload.status}}
    }
    case StatusUpdateActionTypes.UPDATE_TARGET_DATE: {
      if (!statusUpdate) return state
      return {...state, [payload.id]: {...statusUpdate, targetDate: payload.date}}
    }
    case StatusUpdateActionTypes.SET_STATUS_UPDATE: {
      return {...state, [payload.id]: payload}
    }
    case StatusUpdateActionTypes.CLEAR_STATUS_UPDATE: {
      const {[payload.id]: _, ...newState} = state
      return newState
    }
  }
}

export const useCreateStatusUpdateReducer = () => {
  const [statusUpdateDrafts, statusUpdateDraftsDispatch] = useReducer(statusUpdateDraftsReducer, {})

  return {statusUpdateDrafts, statusUpdateDraftsDispatch}
}
