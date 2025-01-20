import {
  type ClientMemexWorkflow,
  MemexActionType,
  MemexWorkflowContentType,
  MemexWorkflowTriggerType,
} from '../../../api/workflows/contracts'

export const newAutoAddWorkflow = (name: string, workflowTemplate?: ClientMemexWorkflow): ClientMemexWorkflow => {
  const workflowSettings = {
    triggerType: workflowTemplate?.triggerType || MemexWorkflowTriggerType.QueryMatched,
    contentTypes: workflowTemplate?.contentTypes || [
      MemexWorkflowContentType.Issue,
      MemexWorkflowContentType.PullRequest,
    ],
    actions: workflowTemplate?.actions.map(action => {
      const newAction = {...action}
      delete newAction.id
      return newAction
    }) || [
      {
        actionType: MemexActionType.GetItems,
        arguments: {query: 'is:pr,issue is:open label:bug', repositoryId: undefined},
      },
      {
        actionType: MemexActionType.AddProjectItem,
        arguments: {},
      },
    ],
  }

  return {
    id: undefined,
    clientId: crypto.randomUUID(),
    isUserWorkflow: true,
    name,
    enabled: false,
    ...workflowSettings,
  }
}
