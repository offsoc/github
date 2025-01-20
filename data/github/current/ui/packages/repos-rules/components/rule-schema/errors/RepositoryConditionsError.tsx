import {useRegisterErrors, type ErrorFilterFunction} from '../../../hooks/use-register-errors'
import type {RegisteredRuleErrorComponent, ValidationError} from '../../../types/rules-types'
import {RulesetFormErrorFlash} from '../../RulesetFormErrorFlash'

const repositoryConditionsFilter: Record<string, ErrorFilterFunction> = {
  unexpectedType: {
    args: 'error',
    func: (error: ValidationError) => {
      if (
        error.field === 'repository_id' &&
        error.message === 'Invalid parameter repository_ids: repository ids cannot be empty'
      ) {
        return true
      }
      return false
    },
  },
}
export const RepositoryConditionsError = ({
  errors,
  errorId,
  errorRef,
}: Omit<RegisteredRuleErrorComponent, 'sourceType' | 'fields'>) => {
  const parsedErrors = useRegisterErrors({errors, fields: [], filters: repositoryConditionsFilter})
  let message: string | undefined = undefined
  if (parsedErrors.unexpectedType && parsedErrors.unexpectedType.length > 0) {
    message = 'Repository conditions cannot be empty'
  } else if (parsedErrors.unregistered && parsedErrors.unregistered.length > 0) {
    message = parsedErrors.unregistered[0]?.message || 'An error occurred'
  }
  return (
    (message && (
      <RulesetFormErrorFlash errorId={errorId} errorRef={errorRef}>
        {message}
      </RulesetFormErrorFlash>
    )) ||
    null
  )
}
