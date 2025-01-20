import {validateRegexValuePath} from '@github-ui/paths'
import {requestServerValidation} from './use-async-validation'

export const validateRegexValue = async (pattern?: string, value?: string): Promise<boolean> => {
  if (!pattern?.length || !value?.length) {
    return true
  }

  return await requestServerValidation({pattern, value}, validateRegexValuePath())
}
