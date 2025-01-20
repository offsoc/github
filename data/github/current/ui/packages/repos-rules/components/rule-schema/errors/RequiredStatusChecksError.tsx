import {useRegisterErrors, type ErrorFilterFunction} from '../../../hooks/use-register-errors'
import type {RegisteredRuleErrorComponent, ValidationError} from '../../../types/rules-types'
import {RulesetFormErrorFlash} from '../../RulesetFormErrorFlash'

const requiredStatusCheckFilters: Record<string, ErrorFilterFunction> = {
  unexpectedType: {
    args: 'error',
    func: (error: ValidationError) => {
      for (const subError of error.sub_errors as ValidationError[]) {
        if (
          error.field === 'required_status_checks' &&
          subError.error_code === 'unexpected_type' &&
          subError.message === 'Expected array, got NilClass'
        ) {
          return true
        }
      }
      return false
    },
  },
}

export function RequiredStatusChecksError({errors, errorId, errorRef, fields}: RegisteredRuleErrorComponent) {
  const parsedErrors = useRegisterErrors({errors, fields, filters: requiredStatusCheckFilters})
  let message: string | undefined = undefined

  if (parsedErrors.unexpectedType && parsedErrors.unexpectedType.length > 0) {
    message = 'Required status checks cannot be empty. Please add at least one status check or disable the rule.'
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
