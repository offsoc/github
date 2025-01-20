import {MergeMethod} from '../types'

export function validateMergeMethod(mergeMethod: string): mergeMethod is MergeMethod {
  return Object.values<string>(MergeMethod).includes(mergeMethod)
}
