import type {PaginatedMemexItemsQueryVariables} from './types'

export function isGroupByApplied(variables: PaginatedMemexItemsQueryVariables) {
  return variables.horizontalGroupedByColumnId != null || variables.verticalGroupedByColumnId != null
}

export function isGroupByAppliedInBothDirections(variables: PaginatedMemexItemsQueryVariables) {
  return variables.horizontalGroupedByColumnId != null && variables.verticalGroupedByColumnId != null
}
