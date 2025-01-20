import {testIdProps} from '@github-ui/test-id-props'
import {LockIcon, PencilIcon} from '@primer/octicons-react'
import {Box, Button, Octicon, ToggleSwitch, useConfirm} from '@primer/react'
import {forwardRef, type PropsWithChildren, useCallback, useEffect, useRef} from 'react'

import type {ClientMemexWorkflow} from '../../api/workflows/contracts'
import {isWorkflowPersisted} from '../../helpers/workflow-utilities'
import {usePreviousValue} from '../../hooks/common/use-previous-value'
import {AutomationGraphStateProvider} from '../../state-providers/workflows/automation-graph-state-provider'
import {useAutomationGraph} from '../../state-providers/workflows/use-automation-graph'
import {useWorkflows} from '../../state-providers/workflows/use-workflows'
import {WorkflowResources} from '../../strings'
import {BlankslateErrorMessage} from '../error-boundaries/blankslate-error-message'
import {ErrorBoundary} from '../error-boundaries/error-boundary'
import {AutomationGraph} from './automation-graph'
import {WorkflowName} from './workflow-name'

type AutomationGraphViewProps = {
  startInEditMode: boolean
  workflow: ClientMemexWorkflow
  onNoSuggestedRepositories?: () => void
}

const ReadOnlyLabel = () => {
  return (
    <Box
      sx={{mb: 5, color: 'fg.muted', fontSize: '12px', display: 'flex', alignItems: 'center'}}
      {...testIdProps('read-only-label')}
    >
      <Octicon icon={LockIcon} size={12} sx={{color: 'fg.muted', mr: 1}} />
      <span>{WorkflowResources.readOnlyLabel}</span>
    </Box>
  )
}
const DiscardButton = forwardRef<HTMLButtonElement>((_, ref) => {
  const {discard} = useAutomationGraph()

  return (
    <Button ref={ref} onClick={discard} {...testIdProps('workflow-discard-button')} sx={{ml: 2}}>
      {WorkflowResources.discardWorkflow}
    </Button>
  )
})

DiscardButton.displayName = 'DiscardButton'

const DeleteButton = ({clientId}: {clientId: string}) => {
  const {deleteNonPersistedWorkflow} = useWorkflows()
  const confirm = useConfirm()

  const onDelete = useCallback(async () => {
    const shouldDelete = await confirm({
      title: WorkflowResources.deleteWorkflowConfirmationTitle,
      content: WorkflowResources.deleteWorkflowConfirmationContent,
      confirmButtonContent: WorkflowResources.deleteWorkflowConfirmationButton,
      confirmButtonType: 'danger',
    })

    if (shouldDelete) {
      deleteNonPersistedWorkflow(clientId)
    }
  }, [confirm, deleteNonPersistedWorkflow, clientId])

  return (
    <Button onClick={() => onDelete()} {...testIdProps('workflow-delete-button')} sx={{ml: 2}}>
      {WorkflowResources.deleteWorkflow}
    </Button>
  )
}

const AutomationGraphViewContent = ({children}: PropsWithChildren) => {
  const {isEditing, edit, workflow, save, isWorkflowValid} = useAutomationGraph()

  const {shouldDisableWorkflowToggle} = useAutomationGraph()

  const toggleOnClick = useCallback(async () => {
    save(!workflow.enabled)
  }, [save, workflow])

  const isPersisted = isWorkflowPersisted(workflow)
  const discardButtonRef = useRef<HTMLButtonElement>(null)
  const editButtonRef = useRef<HTMLButtonElement>(null)
  const isEditingPrev = usePreviousValue(isEditing)

  useEffect(() => {
    // skip when there aren't any changes
    if (isEditing === isEditingPrev) {
      return
    }

    if (isEditing) {
      // if we were not previously editing and now we are, return focus to the discard button
      discardButtonRef.current?.focus()
    } else {
      // if we were previously editing and now we're not, return focus to the edit button
      editButtonRef.current?.focus()
    }
  }, [isEditing, isEditingPrev])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box
        sx={{
          py: [1, 2, 3],
          px: [2, 3, 4],
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          width: '100%',
          borderBottom: '1px solid',
          borderBottomColor: 'border.subtle',
        }}
      >
        <WorkflowName />
        <Box sx={{display: 'flex'}}>
          {!isEditing && (
            <>
              {isPersisted && (
                <span {...testIdProps('workflow-enable-toggle-container')}>
                  <ToggleSwitch
                    checked={workflow.enabled}
                    onClick={toggleOnClick}
                    disabled={shouldDisableWorkflowToggle}
                    aria-labelledby="workflow-name"
                  />
                </span>
              )}
              <Button
                ref={editButtonRef}
                sx={{ml: 2}}
                leadingVisual={PencilIcon}
                onClick={edit}
                {...testIdProps('workflow-edit-button')}
              >
                {WorkflowResources.editWorkflow}
              </Button>
            </>
          )}
          {isEditing && (
            <>
              {!isPersisted && workflow.isUserWorkflow ? (
                <DeleteButton clientId={workflow.clientId} />
              ) : (
                <DiscardButton ref={discardButtonRef} />
              )}
              <Button
                sx={{ml: 2}}
                variant="primary"
                disabled={!isWorkflowValid}
                onClick={() => {
                  save()
                }}
                {...testIdProps('workflow-save-button')}
              >
                {WorkflowResources.saveWorkflow}
              </Button>
            </>
          )}
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: '100%',
          backgroundColor: 'canvas.inset',
          py: 5,
          borderRadius: 2,
        }}
      >
        {!isEditing && <ReadOnlyLabel />}
        {children}
      </Box>
    </Box>
  )
}

export const AutomationGraphView = ({
  workflow,
  onNoSuggestedRepositories,
  startInEditMode,
}: AutomationGraphViewProps) => (
  <AutomationGraphStateProvider startInEditMode={startInEditMode} initialWorkflow={workflow}>
    <ErrorBoundary
      fallback={
        <BlankslateErrorMessage heading="Oops!" content="Something went wrong loading this workflow configuration." />
      }
    >
      <AutomationGraphViewContent>
        <AutomationGraph onNoSuggestedRepositories={onNoSuggestedRepositories} />
      </AutomationGraphViewContent>
    </ErrorBoundary>
  </AutomationGraphStateProvider>
)
