import type {RegisteredRuleErrorComponent, ValidationError} from '../../../types/rules-types'
import {GitMergeQueueIcon} from '@primer/octicons-react'
import {RulesetFormErrorFlash} from '../../RulesetFormErrorFlash'
import {useRegisterErrors, type ErrorFilterFunction} from '../../../hooks/use-register-errors'

const mergeQueueErrorFilters: Record<string, ErrorFilterFunction> = {
  wildcardPresent: {
    args: 'error',
    func: (error: ValidationError) => {
      return error.error_code === 'ref_name_wildcard_present'
    },
  },
}

export function MergeQueueError({errors, errorId, errorRef, fields}: RegisteredRuleErrorComponent) {
  const parsedErrors = useRegisterErrors({errors, fields, filters: mergeQueueErrorFilters})

  if (parsedErrors.wildcardPresent && parsedErrors.wildcardPresent.length > 0) {
    return (
      <RulesetFormErrorFlash errorId={errorId} errorRef={errorRef}>
        <GitMergeQueueIcon />
        Merge queue rules are only supported for named branches or the default branch. Please adjust your branch
        targets.
      </RulesetFormErrorFlash>
    )
  }

  if (parsedErrors.unregistered && parsedErrors.unregistered.length > 0) {
    return (
      <RulesetFormErrorFlash errorId={errorId} errorRef={errorRef}>
        {parsedErrors.unregistered[0]?.message || 'An error occurred'}
      </RulesetFormErrorFlash>
    )
  }

  return null
}
