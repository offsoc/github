import {createContext, memo, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import type {Environment} from 'react-relay'
import {useMatch} from 'react-router-dom'

import {apiCreateWorkflow} from '../../api/workflows/api-create-workflow'
import {apiUpdateWorkflow} from '../../api/workflows/api-update-workflow'
import type {
  ClientMemexWorkflow,
  CreateWorkflowRequestChanges,
  CreateWorkflowResponse,
  MemexWorkflow,
  MemexWorkflowAction,
  MemexWorkflowConfiguration,
  MemexWorkflowContentType,
  MemexWorkflowMenuState,
  MemexWorkflowPersisted,
  MemexWorkflowTriggerType,
  MemexWorkflowType,
  UpdateMemexWorkflowEnabledRequest,
  UpdateWorkflowRequest,
  UpdateWorkflowRequestChanges,
} from '../../api/workflows/contracts'
import {newAutoAddWorkflow} from '../../components/automation/helpers/create-new-workflows'
import {useWorkflowsState} from '../../components/automation/hooks/use-workflows-state'
import deleteProjectV2WorkflowByNumberMutation from '../../components/automation/mutations/delete-project-v2-workflow-by-number-mutation'
import useToasts from '../../components/toasts/use-toasts'
import {getInitialState} from '../../helpers/initial-state'
import {fetchJSONIslandData} from '../../helpers/json-island'
import {
  findWorkflowIndex,
  isArchiveWorkflow,
  isAutoAddWorkflow,
  isWorkflowPersisted,
  MemexWorkflowConverter,
} from '../../helpers/workflow-utilities'
import {validateWorkflow} from '../../helpers/workflow-validation'
import {type UseApiRequest, useApiRequest} from '../../hooks/use-api-request'
import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import {PROJECT_WORKFLOW_CLIENT_ID_ROUTE} from '../../routes'
import {WorkflowResources} from '../../strings'
import {NewWorkflowDialogProvider} from './new-workflow-dialog-state-provider'
import {useArchiveStatus} from './use-archive-status'
import {mergeInitialWorkflows} from './workflows-helpers'

type WorkflowsContextType = {
  /** A list of workflows to expose to the user - these could be default (uncreated with an id: -1) or persisted */
  workflows: ReadonlyArray<ClientMemexWorkflow>

  /** A set of existing workflow names excluding name of the active workflow */
  workflowNames: ReadonlySet<string>

  /** Callback to update the `enabled` state of the specified workflow.
   * This creates the workflow if it isn't already persisted in the database.
   */
  handleEnabledChangeRequest: UseApiRequest<UpdateMemexWorkflowEnabledRequest>

  /**
   * Callback to get the list of valid content types for a workflow,
   * based on its trigger type - this data is read from the workflows-configuration
   * JSON island
   */
  getValidContentTypesForTriggerType: (triggerType: MemexWorkflowTriggerType) => Array<MemexWorkflowContentType>

  /**
   * Callback to set all of the workflows in the local state
   * from the response from the server to a refresh event
   */
  setAllWorkflows: (
    newWorkflowConfigurations: Array<MemexWorkflowConfiguration>,
    newPersistedWorkflows: Array<MemexWorkflowPersisted>,
  ) => void
  /**
   * Callback to determine whether or not users should be able to create workflows
   * with the given trigger type. Determined by reading the workflows-configuration
   * JSON island
   */
  workflowWithTriggerTypeIsEnableable: (triggerType: MemexWorkflowTriggerType) => boolean

  /**
   * Callback that returns the persisted workflows that include actions dependent upon
   * the specified fieldId and fieldOptionId that define a column option.
   */
  workflowsUsingColumnOption: (fieldId: number, fieldOptionId: string) => Array<MemexWorkflow>

  /**
   * Callback that returns the persisted workflows that include actions dependent upon
   * the specified fieldId but the fieldOptionId that defines a column option is missing in fieldOptionIds.
   */
  workflowsUsingMissingColumnOption: (fieldId: number, fieldOptionIds: Array<string>) => Array<MemexWorkflow>

  /**
   * Current workflow shown in the workflow editor
   */
  activeWorkflow: ClientMemexWorkflow | undefined

  /** Callback to update a workflow and its actions.
   * This creates the workflow if it isn't already persisted in the database.
   * An invalid action will update local state and return Promise<undefined>
   */
  updateWorkflowAndAction: (
    workflow: ClientMemexWorkflow,
    actions: Array<MemexWorkflowAction>,
  ) => Promise<CreateWorkflowResponse | undefined>

  /**
   * Callback to create a new non persisted workflow instance in the workflows state
   */
  newWorkflow: (name: string, triggerType: MemexWorkflowType, workflowTemplate?: ClientMemexWorkflow) => boolean

  /**
   * Callback to toggle the menu state of a workflow
   */
  setWorkflowMenuState: (workflowClientId: ClientMemexWorkflow['clientId']) => void

  /**
   * Callback to reset the menu state of all workflows closing all menus
   */
  resetWorkflowMenuStates: () => void

  /**
   * Callback to check if a menu is open
   */
  isWorkflowMenuOpen: (workflowClientId: ClientMemexWorkflow['clientId']) => boolean

  /**
   * Indicates if the auto-add workflow limit has been reached
   */
  autoAddWorkflowLimitReached: boolean

  /**
   * Deletes a workflow
   */
  deleteWorkflow: (workflowNumber: number, environment: Environment) => void

  /**
   * Deletes a non persisted workflow
   */
  deleteNonPersistedWorkflow: (clientId: string) => void

  handleReturnFocus: (clientId: string | undefined) => void
  getWorkflowMenuItemsMap: () => Map<string, HTMLElement>
  itemsRef: React.RefObject<Map<string, HTMLButtonElement>>
}

export const WorkflowsContext = createContext<WorkflowsContextType | null>(null)

export const WorkflowsStateProvider = memo<{children: React.ReactNode}>(function WorkflowsStateProvider({children}) {
  const {sub_issues} = useEnabledFeatures()

  const isSubIssuesWorkflowEnabled = sub_issues

  const {
    projectLimits: {autoAddCreationLimit},
  } = getInitialState()

  const {isArchiveFull, setShouldDisableArchiveForActiveWorkflow} = useArchiveStatus()

  const activeWorkflowClientId = useMatch(PROJECT_WORKFLOW_CLIENT_ID_ROUTE.path)?.params.workflowClientId

  const [workflowConfigurations] = useState(() => fetchJSONIslandData('memex-workflow-configurations-data') || [])
  const [createdWorkflows] = useState(() => fetchJSONIslandData('memex-workflows-data') || [])
  const [workflows, setWorkflows] = useState<Array<ClientMemexWorkflow>>(() =>
    mergeInitialWorkflows([], workflowConfigurations, createdWorkflows, isSubIssuesWorkflowEnabled),
  )
  const [contentTypeConstraints] = useState(() => extractContentTypeConstraints(workflowConfigurations))
  const [triggerTypeEnablement] = useState(() => extractTriggerTypeEnablement(workflowConfigurations))

  // We have to manage the menu state for each of the different workflows
  const initialMenuStates = workflows
    .map(workflow => workflow.clientId)
    .reduce((o, workflowClientId) => Object.assign(o, {[workflowClientId]: false}), {}) as MemexWorkflowMenuState

  const [workflowMenuStates, setWorkflowMenuStates] = useState(initialMenuStates)

  const pendingRequestsRef = useRef<Map<ClientMemexWorkflow['clientId'], Promise<CreateWorkflowResponse>>>(new Map())
  const {activeWorkflow, workflowNames, autoArchiveWorkflow, hasUnpersistedUserAddedWorkflow, navigateToWorkflow} =
    useWorkflowsState(workflows, activeWorkflowClientId)

  const projectGlobalRelayId = fetchJSONIslandData('memex-relay-ids')?.memexProject
  const {addToast} = useToasts()

  const replaceWorkflowInLocalState = useCallback((workflow: ClientMemexWorkflow, isValid = true) => {
    if (!isValid) {
      workflow.enabled = false
    }
    setWorkflows(prevWorkflows => {
      const workflowIndex = findWorkflowIndex(prevWorkflows, workflow)
      prevWorkflows.splice(workflowIndex, 1, workflow)
      return [...prevWorkflows]
    })
  }, [])

  const setAllWorkflows = useCallback(
    (
      newWorkflowConfigurations: Array<MemexWorkflowConfiguration>,
      newPersistedWorkflows: Array<MemexWorkflowPersisted>,
    ) => {
      if (!hasUnpersistedUserAddedWorkflow) {
        setWorkflows(currentWorkflows => {
          return mergeInitialWorkflows(
            currentWorkflows,
            newWorkflowConfigurations,
            newPersistedWorkflows,
            isSubIssuesWorkflowEnabled,
          )
        })
      }
    },
    [hasUnpersistedUserAddedWorkflow, isSubIssuesWorkflowEnabled],
  )
  const newWorkflow = useCallback(
    (name: string, workflowType: MemexWorkflowType, workflowTemplate?: ClientMemexWorkflow) => {
      if (workflows.some(workflow => workflow.name === name)) return false

      let workflow = undefined as ClientMemexWorkflow | undefined

      switch (workflowType) {
        case 'query_matched_add_project_item':
          workflow = newAutoAddWorkflow(name, workflowTemplate)
          break
        default:
          return false
      }

      setWorkflows(prevWorkflows => {
        if (workflow) {
          prevWorkflows.push(workflow)
        }
        return [...prevWorkflows]
      })

      navigateToWorkflow(workflow.clientId)

      return true
    },
    [navigateToWorkflow, workflows],
  )

  const createWorkflow = useCallback(
    async (workflow: ClientMemexWorkflow) => {
      let promise = pendingRequestsRef.current.get(workflow.clientId)
      if (!promise) {
        // Try to execute the request
        // Failures will propagate up and display a toast
        try {
          promise = add(MemexWorkflowConverter.toServer(workflow))
          pendingRequestsRef.current.set(workflow.clientId, promise)
          const response = await promise
          const createdClientMemexWorkflow = MemexWorkflowConverter.toClient(
            response.workflow,
            workflow.isUserWorkflow,
            response.workflow.id.toString(),
          )

          // After the workflow is created, the clientId is replaced with the workflow Id, so we replace
          // it in the local state
          setWorkflows(prevWorkflows => {
            const workflowIndex = findWorkflowIndex(prevWorkflows, workflow)
            prevWorkflows.splice(workflowIndex, 1, createdClientMemexWorkflow)
            return [...prevWorkflows]
          })

          setWorkflowMenuStates(prevMenuStates => {
            const menuStates = {...prevMenuStates}
            delete menuStates[workflow.clientId]
            return {
              ...menuStates,
              [createdClientMemexWorkflow.clientId]: false,
            }
          })

          navigateToWorkflow(createdClientMemexWorkflow.clientId)
        } finally {
          // Always remove the promise from the map (success or error)
          pendingRequestsRef.current.delete(workflow.clientId)
        }
      }
      return promise
    },
    [navigateToWorkflow],
  )

  const deleteWorkflow = useCallback(
    async (workflowNumber: number, environment: Environment) => {
      if (!projectGlobalRelayId) return
      const workflowIndex = workflows.findIndex(
        workflow => isWorkflowPersisted(workflow) && (workflow as MemexWorkflowPersisted).number === workflowNumber,
      )
      const workflowToShow = getWorkflowToShow(workflows, workflowIndex)
      const deletedWorkflow = workflows[workflowIndex]
      if (!deletedWorkflow) return

      deleteProjectV2WorkflowByNumberMutation({
        environment,
        input: {
          workflowNumber,
          projectId: projectGlobalRelayId,
        },
        optimisticUpdater: () => {
          setWorkflows(prevWorkflows => {
            prevWorkflows.splice(workflowIndex, 1)
            return [...prevWorkflows]
          })
        },
        onCompleted: () => {
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({message: WorkflowResources.deleteWorkflowSuccess, type: 'success'})
          navigateToWorkflow(workflowToShow?.clientId)
        },
        onError: () => {
          setWorkflows(prevWorkflows => {
            prevWorkflows.splice(workflowIndex, 0, deletedWorkflow)
            return [...prevWorkflows]
          })
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({message: WorkflowResources.deleteWorkflowError, type: 'error'})
        },
      })
    },
    [addToast, navigateToWorkflow, projectGlobalRelayId, workflows],
  )

  const deleteNonPersistedWorkflow = useCallback(
    (clientId: string) => {
      const workflowIndex = workflows.findIndex(workflow => workflow.clientId === clientId)
      const deletedWorkflow = workflows[workflowIndex]
      const workflowToShow = getWorkflowToShow(workflows, workflowIndex)
      if (!deletedWorkflow) return

      setWorkflows(prevWorkflows => {
        prevWorkflows.splice(workflowIndex, 1)
        return [...prevWorkflows]
      })

      if (activeWorkflowClientId === deletedWorkflow.clientId) {
        navigateToWorkflow(workflowToShow?.clientId)
      }
    },
    [activeWorkflowClientId, navigateToWorkflow, workflows],
  )

  const updateWorkflow = useCallback(async (request: UpdateWorkflowRequest) => await apiUpdateWorkflow(request), [])

  const updateOrCreateWorkflow = useCallback(
    async (workflow: ClientMemexWorkflow, changes: UpdateWorkflowRequestChanges | CreateWorkflowRequestChanges) => {
      const workflowWithChanges = {...workflow, ...changes}
      if (isWorkflowPersisted(workflow)) {
        const updatedWorkflow = await updateWorkflow({
          ...{workflowNumber: workflow.number},
          ...(changes as UpdateWorkflowRequestChanges),
        })
        replaceWorkflowInLocalState(workflowWithChanges)
        navigateToWorkflow(workflow.id.toString())
        return updatedWorkflow
      } else {
        return createWorkflow(workflowWithChanges)
      }
    },
    [createWorkflow, navigateToWorkflow, replaceWorkflowInLocalState, updateWorkflow],
  )

  const enableWorkflow = useCallback(
    async (workflow: ClientMemexWorkflow, enabled: boolean) => {
      return updateOrCreateWorkflow(workflow, {enabled})
    },
    [updateOrCreateWorkflow],
  )

  // Used in ContentNext to update workflow and action
  const updateWorkflowAndAction: WorkflowsContextType['updateWorkflowAndAction'] = useCallback(
    async (workflow: ClientMemexWorkflow, actions: Array<MemexWorkflowAction>) => {
      const updatedActions = actions.reduce(
        (acc, updatedAction) =>
          acc.map(originalAction =>
            originalAction.actionType === updatedAction.actionType ? updatedAction : originalAction,
          ),
        workflow.actions,
      )

      const updatedWorkflow = {...workflow, ...{actions: updatedActions}}
      if (!validateWorkflow(updatedWorkflow, workflowNames).isValid) {
        replaceWorkflowInLocalState(updatedWorkflow, false)
      } else {
        return updateOrCreateWorkflow(updatedWorkflow, {
          name: updatedWorkflow.name,
          contentTypes: updatedWorkflow.contentTypes,
          enabled: updatedWorkflow.enabled,
          actions: updatedActions,
        })
      }
    },
    [replaceWorkflowInLocalState, updateOrCreateWorkflow, workflowNames],
  )

  const getValidContentTypesForTriggerType = useCallback(
    (triggerType: MemexWorkflowTriggerType) => {
      return contentTypeConstraints[triggerType]
    },
    [contentTypeConstraints],
  )

  const workflowWithTriggerTypeIsEnableable = useCallback(
    (triggerType: MemexWorkflowTriggerType) => {
      return triggerTypeEnablement[triggerType]
    },
    [triggerTypeEnablement],
  )

  const workflowsUsingColumnOption = useCallback(
    (fieldId: number, fieldOptionId: string) => {
      return workflows.filter(workflow => {
        return (
          isWorkflowPersisted(workflow) &&
          workflow.actions.find(action => {
            return action.arguments.fieldId === fieldId && action.arguments.fieldOptionId === fieldOptionId
          })
        )
      })
    },
    [workflows],
  )

  const workflowsUsingMissingColumnOption = useCallback(
    (fieldId: number, fieldOptionIds: Array<string>) => {
      const fieldOptionIdsSet = new Set(fieldOptionIds)
      return workflows.filter(workflow => {
        return (
          isWorkflowPersisted(workflow) &&
          workflow.actions.find(action => {
            return (
              action.arguments.fieldId === fieldId &&
              action.arguments.fieldOptionId &&
              !fieldOptionIdsSet.has(action.arguments.fieldOptionId)
            )
          })
        )
      })
    },
    [workflows],
  )

  const setWorkflowMenuState = useCallback(
    (workflowClientId: ClientMemexWorkflow['clientId']) => {
      for (const key in workflowMenuStates)
        workflowMenuStates[key] = key === workflowClientId ? !workflowMenuStates[key] : false

      setWorkflowMenuStates({...workflowMenuStates})
    },
    [workflowMenuStates],
  )

  const resetWorkflowMenuStates = useCallback(() => {
    setWorkflowMenuStates({...initialMenuStates})
  }, [initialMenuStates])

  const isWorkflowMenuOpen = useCallback(
    (workflowClientId: ClientMemexWorkflow['clientId']) => workflowMenuStates[workflowClientId] as boolean,
    [workflowMenuStates],
  )

  const itemsRef = useRef<Map<string, HTMLButtonElement>>(new Map())

  const getWorkflowMenuItemsMap = useCallback(() => {
    return itemsRef.current
  }, [])

  const handleReturnFocus = useCallback(
    (id: string | undefined) => {
      if (!id) return
      requestAnimationFrame(() => {
        const map = getWorkflowMenuItemsMap()
        const node = map.get(id)
        node?.focus()
      })
    },
    [getWorkflowMenuItemsMap],
  )

  const enableWorkflowRequest = useCallback(
    async ({workflow, enable}: UpdateMemexWorkflowEnabledRequest) => {
      await enableWorkflow(workflow, enable)
    },
    [enableWorkflow],
  )

  const handleEnabledChangeRequest: WorkflowsContextType['handleEnabledChangeRequest'] = useApiRequest({
    request: enableWorkflowRequest,
  })

  useEffect(() => {
    // Side effect to disable the auto archive workflow if archive is full and the workflow is enabled
    // Maybe we can remove this once we implement disabling auto archive when limit is reached in dotcom
    if (isArchiveFull && autoArchiveWorkflow?.enabled) {
      handleEnabledChangeRequest.perform({workflow: autoArchiveWorkflow, enable: false})
    }
  }, [autoArchiveWorkflow, handleEnabledChangeRequest, isArchiveFull])

  useEffect(() => {
    if (activeWorkflow) {
      setShouldDisableArchiveForActiveWorkflow(isArchiveWorkflow(activeWorkflow) && isArchiveFull)
    }
  }, [activeWorkflow, isArchiveFull, setShouldDisableArchiveForActiveWorkflow])

  const autoAddWorkflows = useMemo(() => workflows.filter(workflow => isAutoAddWorkflow(workflow)), [workflows])

  const autoAddWorkflowLimitReached = useMemo(() => {
    return autoAddWorkflows.length >= autoAddCreationLimit
  }, [autoAddWorkflows.length, autoAddCreationLimit])

  const contextValue = useMemo(() => {
    return {
      activeWorkflow,
      workflows,
      workflowNames,
      handleEnabledChangeRequest,
      updateWorkflowAndAction,
      getValidContentTypesForTriggerType,
      setAllWorkflows,
      workflowWithTriggerTypeIsEnableable,
      workflowsUsingColumnOption,
      workflowsUsingMissingColumnOption,
      newWorkflow,
      setWorkflowMenuState,
      resetWorkflowMenuStates,
      isWorkflowMenuOpen,
      handleReturnFocus,
      getWorkflowMenuItemsMap,
      itemsRef,
      autoAddWorkflowLimitReached,
      deleteWorkflow,
      deleteNonPersistedWorkflow,
    }
  }, [
    activeWorkflow,
    workflows,
    workflowNames,
    handleEnabledChangeRequest,
    updateWorkflowAndAction,
    getValidContentTypesForTriggerType,
    setAllWorkflows,
    workflowWithTriggerTypeIsEnableable,
    workflowsUsingColumnOption,
    workflowsUsingMissingColumnOption,
    newWorkflow,
    setWorkflowMenuState,
    resetWorkflowMenuStates,
    isWorkflowMenuOpen,
    handleReturnFocus,
    getWorkflowMenuItemsMap,
    itemsRef,
    autoAddWorkflowLimitReached,
    deleteWorkflow,
    deleteNonPersistedWorkflow,
  ])

  return (
    <WorkflowsContext.Provider value={contextValue}>
      <NewWorkflowDialogProvider>{children}</NewWorkflowDialogProvider>
    </WorkflowsContext.Provider>
  )
})

async function add(workflow: MemexWorkflow): Promise<CreateWorkflowResponse> {
  const {id: removedId, ...enabledWorkflowWithoutId} = workflow

  return apiCreateWorkflow({workflow: enabledWorkflowWithoutId})
}

type ContentTypeConstraintsMap = {[key in MemexWorkflowTriggerType]: Array<MemexWorkflowContentType>}

function extractContentTypeConstraints(workflowConfigurations: Array<MemexWorkflowConfiguration>) {
  return workflowConfigurations.reduce((map, configuration) => {
    map[configuration.triggerType] = configuration.constraints.contentTypes
    return map
  }, {} as ContentTypeConstraintsMap)
}

type TriggerTypeEnablementMap = {[key in MemexWorkflowTriggerType]: boolean}

function extractTriggerTypeEnablement(workflowConfigurations: Array<MemexWorkflowConfiguration>) {
  return workflowConfigurations.reduce((map, configuration) => {
    map[configuration.triggerType] = configuration.enableable
    return map
  }, {} as TriggerTypeEnablementMap)
}

function getWorkflowToShow(workflows: Array<ClientMemexWorkflow>, deletedWorkflowIndex: number) {
  return deletedWorkflowIndex > 0 ? workflows[deletedWorkflowIndex - 1] : workflows[1]
}
