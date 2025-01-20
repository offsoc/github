import {useMemo} from 'react'
import invariant from 'tiny-invariant'

import {MemexActionType, type MemexWorkflow} from '../../api/workflows/contracts'
import {isArchiveWorkflow} from '../../helpers/workflow-utilities'
import {useWorkflowSetFieldAction} from '../../hooks/use-workflow-action'
import {useWorkflowPermissions} from '../../hooks/use-workflow-permissions'
import {useArchiveStatus} from './use-archive-status'

export const useWorkflowToggleState = (workflow: MemexWorkflow, localQuery: string) => {
  const defaultAction = workflow.actions[0]
  invariant(defaultAction, 'defaultAction must exist')
  const {selectedOption} = useWorkflowSetFieldAction(defaultAction)
  const {hasWorkflowWritePermission} = useWorkflowPermissions()
  const {shouldDisableArchiveForActiveWorkflow} = useArchiveStatus()

  const isToggleDisabled = useMemo(() => {
    const isSetField = defaultAction.actionType === MemexActionType.SetField
    const selectedOptionName = selectedOption?.nameHtml

    const isMissingSelectedOption = isSetField && !selectedOptionName

    const isQueryEmpty = localQuery.length === 0 && isArchiveWorkflow(workflow)

    return (
      isMissingSelectedOption || !hasWorkflowWritePermission || shouldDisableArchiveForActiveWorkflow || isQueryEmpty
    )
  }, [
    defaultAction.actionType,
    selectedOption?.nameHtml,
    localQuery.length,
    workflow,
    hasWorkflowWritePermission,
    shouldDisableArchiveForActiveWorkflow,
  ])

  return isToggleDisabled
}
