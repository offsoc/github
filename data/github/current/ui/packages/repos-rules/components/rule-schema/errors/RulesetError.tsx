import {useRegisterErrors} from '../../../hooks/use-register-errors'
import type {RegisteredRuleErrorComponent} from '../../../types/rules-types'
import {RulesetFormErrorFlash} from '../../RulesetFormErrorFlash'

export const RulesetError = ({errors, errorId, errorRef, fields}: RegisteredRuleErrorComponent) => {
  const parsedErrors = useRegisterErrors({errors, fields})
  if (parsedErrors.unregistered && parsedErrors.unregistered.length > 0) {
    return (
      <RulesetFormErrorFlash errorId={errorId} errorRef={errorRef}>
        {parsedErrors.unregistered[0]?.message || 'An error occurred'}
      </RulesetFormErrorFlash>
    )
  }
  return null
}
