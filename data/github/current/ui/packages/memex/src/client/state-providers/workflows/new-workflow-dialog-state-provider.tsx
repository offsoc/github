import {createContext, useCallback, useMemo, useState} from 'react'

import type {ClientMemexWorkflow} from '../../api/workflows/contracts'
import {CreateWorkflowResources} from '../../strings'

type NewWorkflowDialogContextType = {
  isDialogOpen: boolean
  workflowTemplate: ClientMemexWorkflow | undefined
  workflowName: string
  applyWorkflowTemplate: (workflowTemplate?: ClientMemexWorkflow) => void
  setWorkflowName: (workflowName: string) => void
  setIsDialogOpen: (isOpen: boolean) => void
  returnFocusClientId: string | undefined
}

export const NewWorkflowDialogContext = createContext<NewWorkflowDialogContextType | null>(null)

export const NewWorkflowDialogProvider = ({children}: {children: React.ReactNode}) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [workflowTemplate, setWorkflowTemplate] = useState<ClientMemexWorkflow | undefined>()
  const [workflowName, setWorkflowName] = useState<string>(CreateWorkflowResources.defaultWorkflowName)
  const [returnFocusClientId, setReturnFocusClientId] = useState<string | undefined>()

  const applyWorkflowTemplate = useCallback((workflowToDuplicate?: ClientMemexWorkflow) => {
    if (workflowToDuplicate === undefined) {
      setWorkflowTemplate(undefined)
      setWorkflowName(CreateWorkflowResources.defaultWorkflowName)
    } else {
      setWorkflowTemplate({...workflowToDuplicate})
      setReturnFocusClientId(workflowToDuplicate.clientId)
      setWorkflowName(CreateWorkflowResources.newWorkflowName(workflowToDuplicate.name))
    }
  }, [])

  const contextValue = useMemo(() => {
    return {
      isDialogOpen,
      workflowTemplate,
      workflowName,
      setWorkflowName,
      applyWorkflowTemplate,
      setIsDialogOpen,
      returnFocusClientId,
    }
  }, [applyWorkflowTemplate, isDialogOpen, returnFocusClientId, workflowName, workflowTemplate])

  return <NewWorkflowDialogContext.Provider value={contextValue}>{children}</NewWorkflowDialogContext.Provider>
}
