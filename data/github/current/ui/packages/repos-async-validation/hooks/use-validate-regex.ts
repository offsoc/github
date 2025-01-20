import {useAsyncValidation} from './use-async-validation'
import {validateRegexPath} from '@github-ui/paths'

export const useValidateRegex = () => {
  const {validate: baseValidation, ...baseHookResult} = useAsyncValidation(validateRegexPath(), 'pattern')

  const validate = async (pattern?: string): Promise<boolean> => {
    if (!pattern?.length) {
      baseHookResult.reset()
      return true
    }

    return baseValidation({pattern})
  }

  return {
    ...baseHookResult,
    validate,
  }
}
