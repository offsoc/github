import {useContext} from 'react'

import {NewWorkflowDialogContext} from './new-workflow-dialog-state-provider'
import {WorkflowsContext} from './workflows-state-provider'

export function useWorkflows() {
  const context = useContext(WorkflowsContext)
  if (!context) {
    throw new Error('useWorkflows must be used within a WorkflowsStateProvider')
  }
  return context
}

export function useNewWorkflowDialog() {
  const context = useContext(NewWorkflowDialogContext)
  if (!context) {
    throw new Error('useNewWorkflowCreation must be used within a NewWorkflowCreationProvider')
  }
  return context
}
