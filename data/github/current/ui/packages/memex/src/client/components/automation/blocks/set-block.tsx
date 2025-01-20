import {PencilIcon} from '@primer/octicons-react'
import invariant from 'tiny-invariant'

import type {PersistedOption} from '../../../api/columns/contracts/single-select'
import type {MemexWorkflowAction} from '../../../api/workflows/contracts'
import {useWorkflowSetFieldAction} from '../../../hooks/use-workflow-action'
import {useAutomationGraph} from '../../../state-providers/workflows/use-automation-graph'
import {StatusPicker} from '../status-picker'
import {AutomationBlock} from './automation-block'

interface SetBlockProps {
  headerDescription: string
}

export const SetBlock = ({headerDescription}: SetBlockProps) => {
  const {isEditing, workflow, replaceAction} = useAutomationGraph()
  const action = workflow.actions[0]
  invariant(action, 'Action must be defined')
  const {column, selectedOption} = useWorkflowSetFieldAction(action)
  const options = column && 'options' in column.settings ? column.settings.options : []

  const onStatusSelected = (option: PersistedOption | undefined) => {
    const updatedAction: MemexWorkflowAction = {
      ...action,
      arguments: {...action.arguments, fieldOptionId: option?.id},
    }
    replaceAction(updatedAction)
  }

  return (
    <AutomationBlock
      icon={PencilIcon}
      iconBg={'attention.subtle'}
      iconColor={'attention.fg'}
      headerDescription={headerDescription}
    >
      <StatusPicker
        onStatusSelected={onStatusSelected}
        options={options}
        selectedOption={selectedOption ? {...selectedOption} : undefined}
        isEditing={isEditing}
        testId="workflow-set-field"
      />
    </AutomationBlock>
  )
}
