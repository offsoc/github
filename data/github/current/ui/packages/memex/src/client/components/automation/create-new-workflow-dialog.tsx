import {testIdProps} from '@github-ui/test-id-props'
import {Box, Button, Dialog, FormControl, Heading, Text, TextInput} from '@primer/react'
import {useCallback, useEffect, useRef} from 'react'

import {useNewWorkflowDialog, useWorkflows} from '../../state-providers/workflows/use-workflows'
import {CreateWorkflowResources} from '../../strings'
import {useWorkflowNameValidation} from './hooks/use-workflow-name-validation'

type CreateNewWorkflowDialogProps = {
  setStartInEditMode: (editing: boolean) => void
}

export const CreateNewWorkflowDialog = ({setStartInEditMode}: CreateNewWorkflowDialogProps) => {
  const {
    isDialogOpen,
    setIsDialogOpen,
    workflowName,
    setWorkflowName,
    workflowTemplate,
    applyWorkflowTemplate,
    returnFocusClientId,
  } = useNewWorkflowDialog()

  const {workflowNames, activeWorkflow, newWorkflow, handleReturnFocus} = useWorkflows()
  const {error, onChangeHandler, validate} = useWorkflowNameValidation({
    onWorkflowNameChange: setWorkflowName,
    workflowNames: activeWorkflow ? new Set(workflowNames).add(activeWorkflow.name.toLocaleLowerCase()) : workflowNames,
  })

  const initialFocusRef = useRef<HTMLInputElement>(null)

  const createWorkflow = useCallback(() => {
    newWorkflow(workflowName, 'query_matched_add_project_item', workflowTemplate)
    setIsDialogOpen(false)
    setStartInEditMode(true)
  }, [newWorkflow, setStartInEditMode, setIsDialogOpen, workflowName, workflowTemplate])

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false)
    // Reset workflow template
    applyWorkflowTemplate()

    handleReturnFocus(returnFocusClientId)
  }, [applyWorkflowTemplate, setIsDialogOpen, handleReturnFocus, returnFocusClientId])

  useEffect(() => {
    if (isDialogOpen) {
      validate(workflowName)
    }
    // We only want to run this effect when the dialog is opened
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDialogOpen])

  return (
    <Dialog
      isOpen={isDialogOpen}
      initialFocusRef={initialFocusRef}
      onDismiss={closeDialog}
      aria-labelledby="new-workflow-header"
    >
      <Dialog.Header sx={{background: 'none', border: 'none'}} id="new-workflow-header">
        <Heading as="h3" sx={{fontSize: 3}}>
          {CreateWorkflowResources.duplicateWorkflowLabel}
        </Heading>
      </Dialog.Header>
      <Box sx={{px: 3}}>
        <FormControl sx={{my: 2}}>
          <FormControl.Label>{CreateWorkflowResources.workflowNameInputLabel}</FormControl.Label>
          <TextInput
            ref={initialFocusRef}
            sx={{width: '100%', minHeight: '34px'}}
            value={workflowName}
            onChange={onChangeHandler}
            validationStatus={error ? 'error' : undefined}
            {...testIdProps('new-workflow-dialog-input')}
          />
          {error && (
            <Text as="p" sx={{color: 'danger.fg'}} {...testIdProps('new-workflow-dialog-error')}>
              {error}
            </Text>
          )}
        </FormControl>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mt: 4,
          py: 3,
          px: 3,
          borderTop: '1px solid',
          borderColor: 'border.default',
        }}
      >
        <Button
          disabled={!!error}
          variant="primary"
          onClick={createWorkflow}
          {...testIdProps('new-workflow-dialog-create-button')}
        >
          {CreateWorkflowResources.duplicateButton}
        </Button>
      </Box>
    </Dialog>
  )
}
