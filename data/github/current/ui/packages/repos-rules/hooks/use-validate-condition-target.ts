import {useAsyncValidation} from '@github-ui/repos-async-validation/use-async-validation'

export const useValidateConditionTarget = (baseValidationUrl: string) => {
  const {validate: baseValidation, ...baseHookResult} = useAsyncValidation(baseValidationUrl, 'condition_target')

  const validate = async (conditionTarget: string, target: string, id?: number): Promise<boolean> => {
    if (!conditionTarget.length) {
      baseHookResult.reset()
      return true
    }

    return baseValidation({conditionTarget, target, id})
  }

  return {
    ...baseHookResult,
    validate,
  }
}
