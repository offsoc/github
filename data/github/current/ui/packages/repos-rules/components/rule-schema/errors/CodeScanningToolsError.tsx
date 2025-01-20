import {useRegisterErrors, type ErrorFilterFunction} from '../../../hooks/use-register-errors'
import type {RegisteredRuleErrorComponent, ValidationError} from '../../../types/rules-types'
import {RulesetFormErrorFlash} from '../../RulesetFormErrorFlash'

const CodeScanningToolsFilter: Record<string, ErrorFilterFunction> = {
  missing: {
    args: 'error',
    func: (error: ValidationError) => {
      for (const subError of error.sub_errors as ValidationError[]) {
        if (error.field === 'code_scanning_tools' && subError.error_code === 'missing') {
          return true
        }
      }
      return false
    },
  },
}
export const CodeScanningToolsError = ({errors, errorId, errorRef, fields}: RegisteredRuleErrorComponent) => {
  const parsedErrors = useRegisterErrors({errors, fields, filters: CodeScanningToolsFilter})
  let message: string | undefined = undefined
  if (parsedErrors.missing && parsedErrors.missing.length > 0) {
    message = parsedErrors.missing[0]?.sub_errors?.[0]?.message || 'Please select at least one code scanning tool'
  } else if (parsedErrors.unregistered && parsedErrors.unregistered.length > 0) {
    message = parsedErrors.unregistered[0]?.message || 'An error occurred'
  }
  return message ? (
    <RulesetFormErrorFlash errorId={errorId} errorRef={errorRef}>
      {message}
    </RulesetFormErrorFlash>
  ) : null
}
