import {
  CheckCircleFillIcon,
  DiffIcon,
  GitMergeIcon,
  type Icon,
  IssueReopenedIcon,
  PlusIcon,
  SkipIcon,
  WorkflowIcon,
} from '@primer/octicons-react'

import {
  type ClientMemexWorkflow,
  MemexActionType,
  type MemexWorkflow,
  type MemexWorkflowAction,
  MemexWorkflowActionPriority,
  type MemexWorkflowPersisted,
  MemexWorkflowTriggerType,
  type MemexWorkflowType,
} from '../api/workflows/contracts'

export class MemexWorkflowConverter {
  static toClient(workflow: MemexWorkflow, isUserWorkflow = false, clientId?: string): ClientMemexWorkflow {
    return {
      ...workflow,
      clientId: clientId || crypto.randomUUID(),
      isUserWorkflow,
    }
  }

  static toServer(workflow: ClientMemexWorkflow): MemexWorkflow {
    const {id, name, triggerType, contentTypes, enabled, actions} = workflow
    return {
      id,
      name,
      triggerType,
      contentTypes,
      enabled,
      actions,
    }
  }
}

export function isLastWorkflowOfType(
  workflows: ReadonlyArray<ClientMemexWorkflow>,
  searchWorkflow: ClientMemexWorkflow,
) {
  const searchWorkflowActionTypes = searchWorkflow.actions.map(action => action.actionType)

  return (
    workflows.filter(
      workflow =>
        workflow.id &&
        workflow.triggerType === searchWorkflow.triggerType &&
        workflow.actions.every(action => searchWorkflowActionTypes.includes(action.actionType)),
    ).length === 1
  )
}

export function isWorkflowPersisted(workflow: MemexWorkflow): workflow is MemexWorkflowPersisted {
  return typeof workflow.id === 'number'
}

export function isSubIssuesWorkflow(workflow: MemexWorkflow): boolean {
  return workflow.triggerType === MemexWorkflowTriggerType.SubIssues
}

export function isArchiveWorkflow(workflow: MemexWorkflow): boolean {
  return workflow.actions.some(action => action.actionType === MemexActionType.ArchiveProjectItem)
}

export function isAutoAddWorkflow(workflow: MemexWorkflow): boolean {
  if (isSubIssuesWorkflow(workflow)) return false
  return workflow.actions.some(action => action.actionType === MemexActionType.AddProjectItem)
}

function clientIdAsIdentity(workflow: ClientMemexWorkflow) {
  return workflow.clientId
}

export function sortActionsByPriority(a: MemexWorkflowAction, b: MemexWorkflowAction) {
  return (MemexWorkflowActionPriority[a.actionType] ?? 0) - (MemexWorkflowActionPriority[b.actionType] ?? 0)
}

export function workflowTypeAsIdentity(workflow: ClientMemexWorkflow | MemexWorkflow): MemexWorkflowType {
  const sortedActions = Array.from(workflow.actions).sort(sortActionsByPriority)
  const actionType = sortedActions[sortedActions.length - 1]?.actionType ?? ''
  // every kind of workflow can be identified by triggerType + actionTypes
  return `${workflow.triggerType}_${actionType}` as MemexWorkflowType
}

export function findWorkflowIndex(
  workflows: Array<ClientMemexWorkflow>,
  workflow: ClientMemexWorkflow,
  workflowType?: MemexWorkflowType,
): number {
  const identifierFunc = workflowType ? workflowTypeAsIdentity : clientIdAsIdentity
  const wfIdentity = workflowType ?? identifierFunc(workflow)

  // assumption: all actionTypes should match, as actionTypes do not change for the same kind of workflows
  return workflows.findIndex(wf => identifierFunc(wf) === wfIdentity)
}

export const getWorkflowIcon = (dataType: MemexWorkflowTriggerType): Icon => {
  switch (dataType) {
    case MemexWorkflowTriggerType.ItemAdded: {
      return PlusIcon
    }
    case MemexWorkflowTriggerType.Reopened: {
      return IssueReopenedIcon
    }
    case MemexWorkflowTriggerType.ReviewChangesRequested: {
      return DiffIcon
    }
    case MemexWorkflowTriggerType.ReviewApproved: {
      return CheckCircleFillIcon
    }
    case MemexWorkflowTriggerType.Closed: {
      return SkipIcon
    }
    case MemexWorkflowTriggerType.Merged: {
      return GitMergeIcon
    }
    default: {
      return WorkflowIcon
    }
  }
}

export const ConfirmationSource = {
  update: 'update',
  enable: 'enable',
  disable: 'disable',
  saveAndEnable: 'saveAndEnable',
} as const

export type ConfirmationSource = ObjectValues<typeof ConfirmationSource>
