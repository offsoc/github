import {useRegisterErrors, type ErrorFilterFunction} from '../../../hooks/use-register-errors'
import type {RegisteredRuleErrorComponent, ValidationError} from '../../../types/rules-types'
import {RulesetFormErrorFlash} from '../../RulesetFormErrorFlash'

const maxFilePathFilters: Record<string, ErrorFilterFunction> = {
  maxFilePath: {
    args: 'error',
    // max file path errors are handled inline by the ui control
    func: (error: ValidationError) => {
      return error.field === 'max_file_path_length'
    },
  },
}

export const MaxFilePathError = ({errors, errorId, errorRef, fields}: RegisteredRuleErrorComponent) => {
  const parsedErrors = useRegisterErrors({errors, fields, filters: maxFilePathFilters})
  if (parsedErrors.unregistered && parsedErrors.unregistered.length > 0) {
    return (
      <RulesetFormErrorFlash errorId={errorId} errorRef={errorRef}>
        {parsedErrors.unregistered[0]?.message || 'An error occurred'}
      </RulesetFormErrorFlash>
    )
  }
  return null
}
