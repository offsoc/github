import {useDebounce} from '@github-ui/use-debounce'
import {useCallback, useState} from 'react'

import {validateWorkflowName} from '../../../helpers/workflow-validation'

const INPUT_VALIDATION_DEBOUNCE_DELAY_MS = 200

interface UseWorkflowNameValidationParams {
  onWorkflowNameValidation?: (isValid: boolean) => void
  onWorkflowNameChange?: (name: string) => void
  debounceDelay?: number
  workflowNames: ReadonlySet<string>
}

export const useWorkflowNameValidation = ({
  onWorkflowNameValidation,
  onWorkflowNameChange,
  debounceDelay,
  workflowNames,
}: UseWorkflowNameValidationParams) => {
  const [error, setError] = useState<string | undefined>()

  const validate = useCallback(
    (name: string) => {
      const validationResult = validateWorkflowName(name, workflowNames)
      if (!validationResult.isValid) {
        onWorkflowNameValidation?.(false)
        setError(validationResult.errorMessage)
      } else if (error) {
        onWorkflowNameValidation?.(true)
        setError(undefined)
      }
    },
    [error, onWorkflowNameValidation, workflowNames],
  )

  const debouncedValidation = useDebounce(validate, debounceDelay ?? INPUT_VALIDATION_DEBOUNCE_DELAY_MS)

  const onChangeHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newWorkflowName = event.target.value
      onWorkflowNameChange?.(newWorkflowName)
      debouncedValidation(newWorkflowName)
    },
    [debouncedValidation, onWorkflowNameChange],
  )

  return {
    validate,
    onChangeHandler,
    error,
  }
}
