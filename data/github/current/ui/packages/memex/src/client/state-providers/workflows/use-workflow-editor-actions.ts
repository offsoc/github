import {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import {
  type ClientMemexWorkflow,
  MemexActionType,
  type MemexWorkflowAction,
  type MemexWorkflowContentType,
  MemexWorkflowTriggerType,
} from '../../api/workflows/contracts'
import {formatQuery, initializeQuery} from '../../components/automation/helpers/search-constants'
import {useWorkflowManualRunConfirmation} from '../../components/automation/hooks/use-workflow-manual-run-confirmation'
import {ConfirmationSource, isArchiveWorkflow} from '../../helpers/workflow-utilities'
import {validateWorkflow} from '../../helpers/workflow-validation'
import {useApiRequest} from '../../hooks/use-api-request'
import {useWorkflowToggleState} from './use-workflow-toggle-state'
import {useWorkflows} from './use-workflows'

export const useWorkflowEditorActions = (
  initialWorkflow: ClientMemexWorkflow,
  filterCount: number,
  startInEditMode: boolean,
) => {
  const {workflowNames} = useWorkflows()

  const [workflow, setWorkflow] = useState<ClientMemexWorkflow>(initialWorkflow)
  const [workflowName, setWorkflowName] = useState<string>(initialWorkflow.name)
  const [isWorkflowValid, setIsWorkflowValid] = useState<boolean>(
    validateWorkflow(initialWorkflow, workflowNames).isValid,
  )
  const [isEditing, setIsEditing] = useState<boolean>(startInEditMode)

  const initialQuery = useMemo(() => {
    if (initialWorkflow.triggerType === MemexWorkflowTriggerType.ProjectItemColumnUpdate) {
      return ''
    }

    const query = initialWorkflow.actions.find(action => typeof action.arguments.query === 'string')?.arguments.query

    if (typeof query === 'string') {
      return initializeQuery(query, initialWorkflow.contentTypes)
    }
    return ''
  }, [initialWorkflow.actions, initialWorkflow.contentTypes, initialWorkflow.triggerType])

  const initialRepositoryId = useMemo(() => {
    return initialWorkflow.actions.find(action => action.arguments.repositoryId)?.arguments.repositoryId
  }, [initialWorkflow])

  const [localContentTypes, setLocalContentTypes] = useState<Array<MemexWorkflowContentType>>(workflow.contentTypes)
  const [localQuery, setLocalQuery] = useState<string>(initialQuery)
  const [localRepositoryId, setLocalRepositoryId] = useState<number | undefined>(initialRepositoryId)

  // TODO: remove this as it is used in classic workflow editor
  const saveWorkflowChanges = useRef<() => Promise<boolean>>()

  const {updateWorkflowAndAction} = useWorkflows()
  const shouldDisableWorkflowToggle = useWorkflowToggleState(workflow, localQuery)
  const openWorkflowManualRunConfirmationDialog = useWorkflowManualRunConfirmation()

  const replaceAction = useCallback(
    (action: MemexWorkflowAction) => {
      const index = workflow.actions.findIndex(a => a.id === action.id)
      const actions = [...workflow.actions]
      actions[index] = action
      setWorkflow({
        ...workflow,
        actions: [...actions],
      })
    },
    [workflow],
  )

  const initializeQueryMatchedStates = useCallback(() => {
    if (initialWorkflow.triggerType === MemexWorkflowTriggerType.QueryMatched) {
      setLocalQuery(initialQuery)
      setLocalRepositoryId(initialRepositoryId)
    }
  }, [initialQuery, initialRepositoryId, initialWorkflow.triggerType])

  const initializeSharedWorkflowStates = useCallback(() => {
    setWorkflow({...initialWorkflow})
    setLocalContentTypes(initialWorkflow.contentTypes)
    setWorkflowName(initialWorkflow.name)
  }, [initialWorkflow])

  const edit = useCallback(() => {
    setIsEditing(true)
  }, [])

  const discard = useCallback(() => {
    setIsEditing(false)
  }, [])

  const processWorkflowActions = useCallback(() => {
    return workflow.actions.map(action => {
      switch (action.actionType) {
        case MemexActionType.GetItems:
          return {
            ...action,
            arguments: {
              ...action.arguments,
              query: formatQuery(localQuery),
              repositoryId: localRepositoryId,
            },
          }

        case MemexActionType.AddProjectItem:
          return {
            ...action,
            arguments: {
              ...action.arguments,
              repositoryId: localRepositoryId,
            },
          }

        case MemexActionType.GetProjectItems:
          return {
            ...action,
            arguments: {
              ...action.arguments,
              query: localQuery,
            },
          }

        default:
          return action
      }
    })
  }, [localQuery, localRepositoryId, workflow.actions])

  const actionChangeRequest = useCallback(
    async (enabled: boolean) => {
      const updatedActions = enabled ? processWorkflowActions() : workflow.actions
      await updateWorkflowAndAction(
        {
          ...workflow,
          name: workflowName.trim(),
          contentTypes: [...localContentTypes],
          enabled,
        },
        [...updatedActions],
      )
    },
    [localContentTypes, processWorkflowActions, updateWorkflowAndAction, workflow, workflowName],
  )

  const saveNameChangeRequest = useCallback(
    async (newWorkflowName: string) => {
      await updateWorkflowAndAction(
        {
          ...workflow,
          name: newWorkflowName.trim(),
        },
        workflow.actions,
      )
    },
    [updateWorkflowAndAction, workflow],
  )

  const handleSaveNameChangeRequest = useApiRequest({
    request: saveNameChangeRequest,
  })

  const handleActionChangeRequest = useApiRequest({
    request: actionChangeRequest,
  })

  const saveNameChange = useCallback(
    async (newWorkflowName: string) => {
      await handleSaveNameChangeRequest.perform(newWorkflowName)
    },
    [handleSaveNameChangeRequest],
  )

  const save = useCallback(
    async (enabled = true) => {
      let ifDismissed = false
      if (isArchiveWorkflow(workflow) && filterCount > 0 && enabled) {
        await openWorkflowManualRunConfirmationDialog({
          count: filterCount,
          confirmationSource: ConfirmationSource.enable,
          onConfirm: async () => await handleActionChangeRequest.perform(enabled),
          onDismiss: () => {
            ifDismissed = true
          },
        })
      } else {
        await handleActionChangeRequest.perform(enabled)
      }
      if (handleActionChangeRequest.status.current.status === 'succeeded' && !ifDismissed) {
        setIsEditing(false)
      }
    },
    [filterCount, handleActionChangeRequest, openWorkflowManualRunConfirmationDialog, workflow],
  )

  useEffect(() => {
    if (!isEditing) {
      initializeSharedWorkflowStates()
      initializeQueryMatchedStates()
    }
  }, [initializeQueryMatchedStates, initializeSharedWorkflowStates, isEditing])

  useEffect(() => {
    const actions = processWorkflowActions()
    setIsWorkflowValid(
      validateWorkflow({
        ...workflow,
        actions,
      }).isValid,
    )
  }, [processWorkflowActions, workflow])

  return {
    localContentTypes,
    setLocalContentTypes,
    localQuery,
    setLocalQuery,
    localRepositoryId,
    setLocalRepositoryId,
    workflowName,
    setWorkflowName,
    isEditing,
    setIsEditing,
    edit,
    discard,
    save,
    saveNameChange,
    saveWorkflowChanges,
    shouldDisableWorkflowToggle,
    workflow,
    setWorkflow,
    replaceAction,
    initialQuery,
    initialRepositoryId,
    isWorkflowValid,
    setIsWorkflowValid,
  }
}
