import type {Icon} from '@primer/octicons-react'

import {MemexActionType, type MemexWorkflowAction, MemexWorkflowTriggerType} from '../../../api/workflows/contracts'
import {getWorkflowIcon} from '../../../helpers/workflow-utilities'
import {useAutomationGraph} from '../../../state-providers/workflows/use-automation-graph'
import {WorkflowResources} from '../../../strings'
import {Connector} from '../connector'
import {AddItemBlock} from './add-item-block'
import {ArchiveBlock} from './archive-block'
import {CloseItemBlock} from './close-item-block'
import {GetItemsBlock} from './get-items-block'
import {GetProjectItemsBlock} from './get-project-items-block'
import {GetSubIssuesBlock} from './get-sub-issues-block'
import {SetBlock} from './set-block'
import {WhenBlock} from './when-block'

type ActionBlockProps = {
  action: MemexWorkflowAction
  sortedActions: Array<MemexWorkflowAction>
  onNoSuggestedRepositories?: () => void
}

type WhenBlockHeaderProps = {
  description: string
  icon: Icon
  iconColor: string
  iconBg: string
}

function getWhenBlockHeaderPropsByTriggerType(triggerType: MemexWorkflowTriggerType): WhenBlockHeaderProps {
  switch (triggerType) {
    case MemexWorkflowTriggerType.ItemAdded: {
      return {
        description: WorkflowResources.itemAddedToProjectLabel,
        icon: getWorkflowIcon(triggerType),
        iconColor: 'success.fg',
        iconBg: 'success.subtle',
      }
    }
    case MemexWorkflowTriggerType.Reopened: {
      return {
        description: WorkflowResources.itemReopenedLabel,
        icon: getWorkflowIcon(triggerType),
        iconColor: 'success.fg',
        iconBg: 'success.subtle',
      }
    }
    case MemexWorkflowTriggerType.Closed: {
      return {
        description: WorkflowResources.itemClosedLabel,
        icon: getWorkflowIcon(triggerType),
        iconColor: 'fg.muted',
        iconBg: 'canvas.inset',
      }
    }
    case MemexWorkflowTriggerType.ReviewChangesRequested: {
      return {
        description: WorkflowResources.codeChangesRequestedLabel,
        icon: getWorkflowIcon(triggerType),
        iconColor: 'danger.fg',
        iconBg: 'danger.subtle',
      }
    }
    case MemexWorkflowTriggerType.ReviewApproved: {
      return {
        description: WorkflowResources.codeReviewApprovedLabel,
        icon: getWorkflowIcon(triggerType),
        iconColor: 'open.fg',
        iconBg: 'success.subtle',
      }
    }
    case MemexWorkflowTriggerType.Merged: {
      return {
        description: WorkflowResources.pullRequestMergedLabel,
        icon: getWorkflowIcon(triggerType),
        iconColor: 'done.fg',
        iconBg: 'done.subtle',
      }
    }
    default: {
      throw new Error(`${triggerType} is not a valid MemexWorkflowTriggerType for a WhenBlock`)
    }
  }
}

export const ActionBlock = ({action, onNoSuggestedRepositories}: ActionBlockProps) => {
  const {workflow} = useAutomationGraph()
  switch (action.actionType) {
    case MemexActionType.SetField: {
      const whenBlockHeaderProps = getWhenBlockHeaderPropsByTriggerType(workflow.triggerType)
      return (
        <>
          <WhenBlock {...whenBlockHeaderProps} />
          <Connector />
          <SetBlock headerDescription={WorkflowResources.setValueLabel} />
        </>
      )
    }
    case MemexActionType.GetProjectItems: {
      if (workflow.triggerType === MemexWorkflowTriggerType.ProjectItemColumnUpdate) {
        return <SetBlock headerDescription={WorkflowResources.projectItemColumnUpdateLabel} />
      } else {
        return <GetProjectItemsBlock />
      }
    }
    case MemexActionType.GetItems: {
      return <GetItemsBlock onNoSuggestedRepositories={onNoSuggestedRepositories} />
    }
    case MemexActionType.ArchiveProjectItem: {
      return <ArchiveBlock />
    }
    case MemexActionType.AddProjectItem: {
      return (
        <AddItemBlock
          headerDescription={
            action.arguments.subIssue ? WorkflowResources.addSubIssuesBlockLabel : WorkflowResources.addItemBlockLabel
          }
        />
      )
    }
    case MemexActionType.CloseItem: {
      return <CloseItemBlock />
    }
    case MemexActionType.GetSubIssues: {
      return <GetSubIssuesBlock />
    }
    default: {
      return null
    }
  }
}
