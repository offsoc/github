import {createContext, type MutableRefObject, useMemo, useState} from 'react'

import type {ClientMemexWorkflow, MemexWorkflowAction, MemexWorkflowContentType} from '../../api/workflows/contracts'
import {useWorkflowEditorActions} from './use-workflow-editor-actions'

type AutomationGraphContextType = {
  filterCount: number
  setFilterCount: (count: number) => void
  localContentTypes: Array<MemexWorkflowContentType>
  shouldDisableWorkflowToggle: boolean
  setLocalContentTypes: React.Dispatch<React.SetStateAction<Array<MemexWorkflowContentType>>>
  setLocalQuery: (query: string) => void
  saveWorkflowChanges: MutableRefObject<(() => Promise<boolean>) | undefined>
  isEditing: boolean
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
  edit: () => void
  discard: () => void
  save: (enabled?: boolean) => void
  saveNameChange: (newWorkflowName: string) => void
  localQuery: string
  workflow: ClientMemexWorkflow
  setWorkflow: React.Dispatch<React.SetStateAction<ClientMemexWorkflow>>
  replaceAction: (action: MemexWorkflowAction) => void
  localRepositoryId?: number
  setLocalRepositoryId: React.Dispatch<React.SetStateAction<number | undefined>>
  workflowName: string
  setWorkflowName: (name: string) => void
  initialQuery: string
  initialRepositoryId?: number
  isWorkflowValid: boolean
  setIsWorkflowValid: React.Dispatch<React.SetStateAction<boolean>>
}

type AutomationGraphStateProviderProps = {
  children: React.ReactNode
  initialWorkflow: ClientMemexWorkflow
  startInEditMode: boolean
}

export const AutomationGraphContext = createContext<AutomationGraphContextType | null>(null)

export const AutomationGraphStateProvider: React.FC<AutomationGraphStateProviderProps> = ({
  children,
  initialWorkflow,
  startInEditMode,
}) => {
  // This is used to display the filter count in manual run confirmation dialog
  const [filterCount, setFilterCount] = useState<number>(0)

  const {
    localContentTypes,
    setLocalContentTypes,
    localQuery,
    setLocalQuery,
    localRepositoryId,
    setLocalRepositoryId,
    workflowName,
    setWorkflowName,
    isEditing,
    setIsEditing,
    edit,
    discard,
    save,
    saveNameChange,
    saveWorkflowChanges,
    shouldDisableWorkflowToggle,
    workflow,
    setWorkflow,
    replaceAction,
    initialQuery,
    initialRepositoryId,
    isWorkflowValid,
    setIsWorkflowValid,
  } = useWorkflowEditorActions(initialWorkflow, filterCount, startInEditMode)

  return (
    <AutomationGraphContext.Provider
      value={useMemo(
        () => ({
          filterCount,
          setFilterCount,
          localContentTypes,
          shouldDisableWorkflowToggle,
          setLocalContentTypes,
          localQuery,
          setLocalQuery,
          saveWorkflowChanges,
          isEditing,
          setIsEditing,
          edit,
          discard,
          save,
          saveNameChange,
          workflow,
          setWorkflow,
          replaceAction,
          localRepositoryId,
          setLocalRepositoryId,
          workflowName,
          setWorkflowName,
          initialQuery,
          initialRepositoryId,
          isWorkflowValid,
          setIsWorkflowValid,
        }),
        [
          filterCount,
          localContentTypes,
          shouldDisableWorkflowToggle,
          setLocalContentTypes,
          localQuery,
          setLocalQuery,
          saveWorkflowChanges,
          isEditing,
          setIsEditing,
          edit,
          discard,
          save,
          saveNameChange,
          workflow,
          setWorkflow,
          replaceAction,
          localRepositoryId,
          setLocalRepositoryId,
          workflowName,
          setWorkflowName,
          initialQuery,
          initialRepositoryId,
          isWorkflowValid,
          setIsWorkflowValid,
        ],
      )}
    >
      {children}
    </AutomationGraphContext.Provider>
  )
}
