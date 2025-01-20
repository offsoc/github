import {useAsyncValidation} from '@github-ui/repos-async-validation/use-async-validation'
import type {JSONRequestInit} from '@github-ui/verified-fetch'

export const useValidateRulesetNameUnique = (baseValidationUrl: string) => {
  const {validate: baseValidation, ...baseHookResult} = useAsyncValidation(baseValidationUrl, 'ruleset_name')

  const validate = async (name: string, id?: number, header: JSONRequestInit = {}): Promise<boolean> => {
    if (!name.length) {
      baseHookResult.reset()
      return true
    }

    return baseValidation({name, id}, header)
  }

  return {
    ...baseHookResult,
    validate,
  }
}
