import {testIdProps} from '@github-ui/test-id-props'
import {useDebounce} from '@github-ui/use-debounce'
import {PencilIcon} from '@primer/octicons-react'
import {Box, Button, Dialog, FormControl, Heading, IconButton, TextInput} from '@primer/react'
import {type RefObject, useCallback, useRef, useState} from 'react'

import {validateWorkflowName} from '../../helpers/workflow-validation'
import {useAutomationGraph} from '../../state-providers/workflows/use-automation-graph'
import {useWorkflows} from '../../state-providers/workflows/use-workflows'
import {SEARCH_DEBOUNCE_DELAY_MS} from './helpers/search-constants'

export const WorkflowName = () => {
  const [isEditingName, setIsEditingName] = useState(false)
  const {workflowName, isEditing} = useAutomationGraph()
  const editButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
        <Heading
          as="h2"
          sx={{fontSize: 3, color: 'fg.default', wordBreak: 'break-word'}}
          id="workflow-name"
          {...testIdProps('workflow-name-heading')}
        >
          {workflowName}
        </Heading>
        {!isEditing && (
          <IconButton
            ref={editButtonRef}
            icon={PencilIcon}
            onClick={() => setIsEditingName(true)}
            variant="invisible"
            aria-label="Edit workflow name"
            {...testIdProps('workflow-name-edit-button')}
          />
        )}
      </Box>
      <WorkflowNameEditorDialog isOpen={isEditingName} setIsOpen={setIsEditingName} returnFocusRef={editButtonRef} />
    </>
  )
}

const WorkflowNameEditorDialog = ({
  isOpen,
  setIsOpen,
  returnFocusRef,
}: {
  isOpen: boolean
  setIsOpen: React.Dispatch<boolean>
  returnFocusRef: RefObject<HTMLButtonElement>
}) => {
  const {workflowNames} = useWorkflows()

  const {workflowName, saveNameChange} = useAutomationGraph()
  const [localWorkflowName, setLocalWorkflowName] = useState<string>(workflowName)
  const [error, setError] = useState<string | undefined>()

  const inputRef = useRef<HTMLInputElement>(null)

  const validate = useCallback(
    (name: string) => {
      const validationResult = validateWorkflowName(name, workflowNames)
      if (!validationResult.isValid) {
        setError(validationResult.errorMessage)
      } else if (error) {
        setError(undefined)
      }
    },
    [workflowNames, error],
  )

  const debouncedValidation = useDebounce(validate, SEARCH_DEBOUNCE_DELAY_MS)
  const onWorkflowNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newWorkflowName = event.target.value
      setLocalWorkflowName(newWorkflowName)
      debouncedValidation(newWorkflowName)
    },
    [debouncedValidation],
  )

  const handleNameChange = useCallback(() => {
    if (error) return

    setIsOpen(false)
    saveNameChange(localWorkflowName)
  }, [error, localWorkflowName, saveNameChange, setIsOpen])

  const closeDialog = useCallback(() => {
    setLocalWorkflowName(workflowName)
    setIsOpen(false)
    setError(undefined)
  }, [setIsOpen, workflowName])

  return (
    <Dialog
      isOpen={isOpen}
      initialFocusRef={inputRef}
      returnFocusRef={returnFocusRef}
      onDismiss={closeDialog}
      aria-labelledby="workflow-name-editor-header"
      key={isOpen ? 'open' : 'closed'}
    >
      <Dialog.Header sx={{background: 'none', border: 'none'}} id="workflow-name-editor-header">
        <Heading as="h3" sx={{fontSize: 3}}>
          Edit workflow name
        </Heading>
      </Dialog.Header>
      <Box sx={{px: 3}}>
        <FormControl sx={{flex: 1}}>
          <FormControl.Label>Workflow name</FormControl.Label>
          <TextInput
            ref={inputRef}
            name="workflowName"
            value={localWorkflowName}
            onChange={onWorkflowNameChange}
            validationStatus={error ? 'error' : undefined}
            sx={{width: '100%'}}
            aria-describedby="workflow-name-editor-error"
            {...testIdProps('workflow-name-editor-input')}
          />
          {error && (
            <FormControl.Validation variant="error" id="workflow-name-editor-error">
              {error}
            </FormControl.Validation>
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
          gap: 1,
        }}
      >
        <Button variant="default" onClick={closeDialog}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleNameChange}>
          Save
        </Button>
      </Box>
    </Dialog>
  )
}
