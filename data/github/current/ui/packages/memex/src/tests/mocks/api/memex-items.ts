import type {
  GetItemsTrackedByParentResponse,
  GetMemexItemResponse,
  GetSuggestedAssigneesResponse,
  GetSuggestedIssueTypesResponse,
  GetSuggestedLabelsResponse,
  GetSuggestedMilestonesResponse,
  MemexItem,
  SuggestedAssignee,
  SuggestedIssueType,
  SuggestedLabel,
  SuggestedMilestone,
} from '../../../client/api/memex-items/contracts'
import type {GetPaginatedItemsResponse} from '../../../client/api/memex-items/paginated-views'
import type {GetRequestType} from '../../../mocks/msw-responders'
import {
  get_getItemsTrackedByParent,
  get_getMemexItem,
  get_getPaginatedItems,
  get_getSuggestedAssigneesForMemexItem,
  get_getSuggestedIssueTypesForMemexItem,
  get_getSuggestedLabelsForMemexItem,
  get_getSuggestedMilestonesForMemexItem,
} from '../../../mocks/msw-responders/memex-items'
import {stubApiMethod, stubApiMethodWithError} from './stub-api-method'

export function stubGetItem(memexProjectItem: MemexItem) {
  return stubApiMethod<GetRequestType, GetMemexItemResponse>(get_getMemexItem, {
    memexProjectItem,
  })
}

export function stubGetSuggestedAssignees(suggestions: Array<SuggestedAssignee>) {
  return stubApiMethod<GetRequestType, GetSuggestedAssigneesResponse>(get_getSuggestedAssigneesForMemexItem, {
    suggestions,
  })
}

export function stubGetSuggestedAssigneesWithError(error: Error) {
  return stubApiMethodWithError<GetRequestType, GetSuggestedAssigneesResponse>(
    get_getSuggestedAssigneesForMemexItem,
    error,
  )
}

export function stubGetSuggestedLabels(suggestions: Array<SuggestedLabel>) {
  return stubApiMethod<GetRequestType, GetSuggestedLabelsResponse>(get_getSuggestedLabelsForMemexItem, {
    suggestions,
  })
}

export function stubGetSuggestedLabelsWithError(error: Error) {
  return stubApiMethodWithError<GetRequestType, GetSuggestedLabelsResponse>(get_getSuggestedLabelsForMemexItem, error)
}

export function stubGetSuggestedMilestones(suggestions: Array<SuggestedMilestone>) {
  return stubApiMethod<GetRequestType, GetSuggestedMilestonesResponse>(get_getSuggestedMilestonesForMemexItem, {
    suggestions,
  })
}

export function stubGetSuggestedIssueTypes(suggestions: Array<SuggestedIssueType>) {
  return stubApiMethod<GetRequestType, GetSuggestedIssueTypesResponse>(get_getSuggestedIssueTypesForMemexItem, {
    suggestions,
  })
}

export function stubGetSuggestedIssueTypesWithError(error: Error) {
  return stubApiMethodWithError<GetRequestType, GetSuggestedIssueTypesResponse>(
    get_getSuggestedIssueTypesForMemexItem,
    error,
  )
}

export function stubGetSuggestedMilestonesWithError(error: Error) {
  return stubApiMethodWithError<GetRequestType, GetSuggestedMilestonesResponse>(
    get_getSuggestedMilestonesForMemexItem,
    error,
  )
}

export function stubGetItemsTrackedByParent(response: GetItemsTrackedByParentResponse) {
  return stubApiMethod<GetRequestType, GetItemsTrackedByParentResponse>(get_getItemsTrackedByParent, response)
}

export function stubGetPaginatedItems(response: GetPaginatedItemsResponse) {
  return stubApiMethod<GetRequestType, GetPaginatedItemsResponse>(get_getPaginatedItems, response)
}
