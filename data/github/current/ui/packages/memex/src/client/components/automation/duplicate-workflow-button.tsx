import {DuplicateIcon} from '@primer/octicons-react'
import {ActionList} from '@primer/react'
import {useCallback} from 'react'

import type {ClientMemexWorkflow} from '../../api/workflows/contracts'
import {useNewWorkflowDialog, useWorkflows} from '../../state-providers/workflows/use-workflows'
import {CreateWorkflowResources} from '../../strings'

type DuplicateWorkflowButtonProps = {
  workflowToDuplicate: ClientMemexWorkflow
}

export const DuplicateWorkflowButton = ({workflowToDuplicate}: DuplicateWorkflowButtonProps) => {
  const {setIsDialogOpen, applyWorkflowTemplate} = useNewWorkflowDialog()
  const {autoAddWorkflowLimitReached, setWorkflowMenuState} = useWorkflows()

  const onSelectHandler = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      applyWorkflowTemplate(workflowToDuplicate)
      setIsDialogOpen(true)
      setWorkflowMenuState(workflowToDuplicate.clientId)
      e.stopPropagation()
    },
    [applyWorkflowTemplate, workflowToDuplicate, setIsDialogOpen, setWorkflowMenuState],
  )

  return (
    <ActionList.Item
      onSelect={onSelectHandler}
      disabled={autoAddWorkflowLimitReached}
      inactiveText={autoAddWorkflowLimitReached ? CreateWorkflowResources.autoAddWorkflowLimitReached : undefined}
    >
      <ActionList.LeadingVisual>
        <DuplicateIcon />
      </ActionList.LeadingVisual>
      {CreateWorkflowResources.duplicateWorkflowLabel}
    </ActionList.Item>
  )
}
