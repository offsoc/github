import {
  type ClientMemexWorkflow,
  type MemexWorkflowConfiguration,
  type MemexWorkflowPersisted,
  MemexWorkflowTriggerType,
} from '../../api/workflows/contracts'
import {findWorkflowIndex, MemexWorkflowConverter, workflowTypeAsIdentity} from '../../helpers/workflow-utilities'

/**
 * Get clientIds of default workflows
 *
 * @param workflows - current workflows in the state
 * @returns all workflows to be displayed
 */
function getDefaultWorkflowClientIds(workflows: Array<ClientMemexWorkflow>): Map<string, string> {
  const defaultWorkflowClientIdMap = new Map<string, string>()

  for (const workflow of workflows) {
    const key = workflowTypeAsIdentity(workflow)
    if (!defaultWorkflowClientIdMap.has(key) && !workflow.isUserWorkflow) {
      defaultWorkflowClientIdMap.set(key, workflow.clientId)
    }
  }

  return defaultWorkflowClientIdMap
}

/**
 * Merges default workflow configurations with the persisted workflows
 *
 * @param currentWorkflows - current workflows in the state
 * @param workflowConfigurations - default workflow configurations from the server
 * @param createdWorkflows - persisted workflows from the server
 * @param isAutoCloseWorkflowEnabled - if auto close is enabled
 * @returns all workflows to be displayed
 */
export function mergeInitialWorkflows(
  currentWorkflows: Array<ClientMemexWorkflow>,
  workflowConfigurations: Array<MemexWorkflowConfiguration>,
  createdWorkflows: Array<MemexWorkflowPersisted>,
  isSubIssuesWorkflowEnabled: boolean,
): Array<ClientMemexWorkflow> {
  const defaultWorkflowClientIdMap = getDefaultWorkflowClientIds(currentWorkflows)

  // Initialize unpersisted default workflows
  const allWorkflows: Array<ClientMemexWorkflow> = workflowConfigurations.map(workflowConfiguration => {
    const {defaultWorkflow} = workflowConfiguration
    return MemexWorkflowConverter.toClient(
      defaultWorkflow,
      false,
      defaultWorkflowClientIdMap.get(workflowTypeAsIdentity(defaultWorkflow)),
    )
  })

  const numWorkflowsByType = new Map<string, number>()

  for (const createdWorkflow of createdWorkflows) {
    const key = workflowTypeAsIdentity(createdWorkflow)
    const numExistingWorkflows = numWorkflowsByType.get(key) || 0

    // We take the first workflow of its type as the default workflow
    // This is ok because we will only allow addition of new workflow when the default workflow of its type is saved
    const isUserAdded = numExistingWorkflows > 0

    const workflow = MemexWorkflowConverter.toClient(createdWorkflow, isUserAdded, createdWorkflow.id.toString())
    const workflowIndex = findWorkflowIndex(allWorkflows, workflow, key)

    if (workflowIndex !== -1) {
      if (!isUserAdded) {
        allWorkflows.splice(workflowIndex, 1, workflow)
      } else {
        allWorkflows.push(workflow)
      }
    } else {
      allWorkflows.push(workflow)
    }

    numWorkflowsByType.set(key, numExistingWorkflows + 1)
  }

  if (!isSubIssuesWorkflowEnabled) {
    return allWorkflows.filter(workflow => workflow.triggerType !== MemexWorkflowTriggerType.SubIssues)
  }

  return allWorkflows
}
