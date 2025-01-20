import {useCallback, useMemo} from 'react'

import type {ClientMemexWorkflow} from '../../../api/workflows/contracts'
import {isArchiveWorkflow, isWorkflowPersisted} from '../../../helpers/workflow-utilities'
import {useNavigate} from '../../../router'
import {useProjectRouteParams} from '../../../router/use-project-route-params'
import {PROJECT_WORKFLOW_CLIENT_ID_ROUTE, PROJECT_WORKFLOWS_ROUTE} from '../../../routes'

export const useWorkflowsState = (workflows: Array<ClientMemexWorkflow>, activeWorkflowClientId?: string) => {
  const navigate = useNavigate()
  const projectRouteParams = useProjectRouteParams()
  const activeWorkflow = useMemo<ClientMemexWorkflow | undefined>(() => {
    // Sets active workflow to match the workflowClientId in URL or to the default workflow if workflowId is invalid or not present
    return (
      workflows.find(workflow => {
        return workflow.clientId === activeWorkflowClientId
      }) ?? getDefaultWorkflow(workflows)
    )
  }, [activeWorkflowClientId, workflows])

  const workflowNames = useMemo<ReadonlySet<string>>(() => {
    // Returns a new set of workflow names when workflows are updated or active workflow changes
    const names = new Set<string>(workflows.map(workflow => workflow.name.toLocaleLowerCase()))
    if (activeWorkflow?.name) {
      names.delete(activeWorkflow?.name?.toLocaleLowerCase())
    }
    return names
  }, [activeWorkflow?.name, workflows])

  const autoArchiveWorkflow = useMemo<ClientMemexWorkflow | undefined>(
    () => workflows.find(workflow => isArchiveWorkflow(workflow)),
    [workflows],
  )

  const hasUnpersistedUserAddedWorkflow = useMemo<boolean>(() => {
    return workflows.some(workflow => workflow.isUserWorkflow && !isWorkflowPersisted(workflow))
  }, [workflows])

  const navigateToWorkflow = useCallback(
    (workflowClientId?: ClientMemexWorkflow['clientId']) => {
      if (workflowClientId) {
        navigate(
          PROJECT_WORKFLOW_CLIENT_ID_ROUTE.generatePath({
            ...projectRouteParams,
            workflowClientId: encodeURIComponent(workflowClientId),
          }),
          {
            replace: true,
          },
        )
      } else {
        navigate(PROJECT_WORKFLOWS_ROUTE.generatePath(projectRouteParams), {
          replace: true,
        })
      }
    },
    [navigate, projectRouteParams],
  )

  return {
    activeWorkflow,
    workflowNames,
    autoArchiveWorkflow,
    hasUnpersistedUserAddedWorkflow,
    navigateToWorkflow,
    projectRouteParams,
  }
}

export function getDefaultWorkflow(workflows: Array<ClientMemexWorkflow>): ClientMemexWorkflow | undefined {
  // Take the first enabled workflow as the default workflow, or the first workflow if none are enabled
  return workflows.find(workflow => workflow.enabled) ?? workflows[0]
}
