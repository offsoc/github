import {createContext, type Dispatch, useContext} from 'react'

import type {StatusUpdateAction, StatusUpdateEditorState} from './hooks/use-status-updates-editor-reducer'

export const NEW_STATUS_UPDATE_ID = 0

type StatusUpdatesEditorStateContext = {
  statusUpdateDrafts: StatusUpdateEditorState
  statusUpdateDraftsDispatch: Dispatch<StatusUpdateAction>
}

export const StatusUpdatesEditorStateContext = createContext<StatusUpdatesEditorStateContext | null>(null)

export function useStatusUpdatesEditorState() {
  const context = useContext(StatusUpdatesEditorStateContext)

  if (!context) {
    throw new Error('useStatusUpdatesEditorState must be used within a StatusUpdatesEditorStateContext.Provider.')
  }

  return context
}
