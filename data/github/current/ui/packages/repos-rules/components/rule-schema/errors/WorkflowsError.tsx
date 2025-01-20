import type {RegisteredRuleErrorComponent, ValidationError, WorkflowError} from '../../../types/rules-types'
import {RulesetFormErrorFlash} from '../../RulesetFormErrorFlash'
import {useRegisterErrors, type ErrorFilterFunction} from '../../../hooks/use-register-errors'

const workflowErrorFilters: Record<string, ErrorFilterFunction> = {
  unexpectedType: {
    args: 'error',
    func: (error: ValidationError) => {
      for (const subError of error.sub_errors as WorkflowError[]) {
        if (
          error.field === 'workflows' &&
          subError.error_code === 'unexpected_type' &&
          subError.message === 'Expected array, got NilClass'
        ) {
          return true
        }
      }
      return false
    },
  },
  // This function is used to indicate that the error is handled by the form control
  // We must register these so they don't show in the error component
  handledByFormControl: {
    args: 'error',
    func: (error: ValidationError) => {
      for (const subError of error.sub_errors as WorkflowError[]) {
        if (error.field === 'workflows' && subError.repo_and_path !== undefined) {
          return true
        }
      }
      return false
    },
  },
}

export function WorkflowsError({errors, errorId, errorRef, fields}: RegisteredRuleErrorComponent) {
  const parsedErrors = useRegisterErrors({errors, fields, filters: workflowErrorFilters})
  let message: string | undefined = undefined

  if (parsedErrors.unexpectedType && parsedErrors.unexpectedType.length > 0) {
    message = 'Workflows cannot be empty. Please add at least one workflow or disable the rule.'
  } else if (parsedErrors.unregistered && parsedErrors.unregistered.length > 0) {
    message = parsedErrors.unregistered[0]?.message || 'An error occurred'
  }

  if (message) {
    return (
      <RulesetFormErrorFlash errorId={errorId} errorRef={errorRef}>
        {message}
      </RulesetFormErrorFlash>
    )
  }
  return null
}
