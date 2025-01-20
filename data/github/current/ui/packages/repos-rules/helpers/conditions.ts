import {INCLUDE_ALL_PATTERN} from '../types/rules-types'
import type {
  ConditionParameters,
  ExpandedRepoTargetType,
  IncludeExcludeParameters,
  TargetObjectType,
  TargetType,
} from '../types/rules-types'

export function isAllCondition(targetType: TargetType, parameters: ConditionParameters) {
  const params = parameters as IncludeExcludeParameters
  return (
    (targetType === 'repository_name' || targetType === 'organization_name') &&
    params.include.length === 1 &&
    params.include[0] === INCLUDE_ALL_PATTERN &&
    params.exclude.length === 0
  )
}

export function getDefaultTargetByObject(
  objectType: TargetObjectType,
  options?: {
    supportedConditionTargetObjects?: TargetObjectType[]
  },
): ExpandedRepoTargetType {
  if (objectType === 'organization') {
    return 'organization_name'
  }
  if (objectType === 'repository') {
    if (options?.supportedConditionTargetObjects?.includes('organization')) {
      return 'all_repos'
    } else {
      return 'repository_name'
    }
  }
  if (objectType === 'ref') {
    return 'ref_name'
  }
  throw new Error(`Unknown target object type: ${objectType}`)
}
