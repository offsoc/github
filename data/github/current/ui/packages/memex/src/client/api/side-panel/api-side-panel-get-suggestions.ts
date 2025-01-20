import {getApiMetadata} from '../../helpers/api-metadata'
import {assertNever} from '../../helpers/assert-never'
import {fetchJSON} from '../../platform/functional-fetch-wrapper'
import type {
  GetSuggestedAssigneesResponse,
  GetSuggestedIssueTypesResponse,
  GetSuggestedLabelsResponse,
  GetSuggestedMilestonesResponse,
} from '../memex-items/contracts'
import {type GetSidePanelDataRequest, type IssueKey, ItemKeyType, type ProjectDraftIssueKey} from './contracts'

export async function apiSidePanelGetSuggestedMilestonesForItem(
  query: IssueKey | ProjectDraftIssueKey,
): Promise<GetSuggestedMilestonesResponse> {
  return getSuggestions(query, 'milestones')
}

export async function apiSidePanelGetSuggestedLabelsForItem(
  query: IssueKey | ProjectDraftIssueKey,
): Promise<GetSuggestedLabelsResponse> {
  return getSuggestions(query, 'labels')
}

export async function apiSidePanelGetSuggestedAssigneesForItem(
  query: IssueKey | ProjectDraftIssueKey,
): Promise<GetSuggestedAssigneesResponse> {
  return getSuggestions(query, 'assignees')
}

export async function apiSidePanelGetSuggestedIssueTypesForItem(
  query: IssueKey,
): Promise<GetSuggestedIssueTypesResponse> {
  return getSuggestions(query, 'issue_types')
}

async function getSuggestions(
  query: GetSidePanelDataRequest,
  suggestionsType: 'labels',
): Promise<GetSuggestedLabelsResponse>
async function getSuggestions(
  query: GetSidePanelDataRequest,
  suggestionsType: 'milestones',
): Promise<GetSuggestedMilestonesResponse>
async function getSuggestions(
  query: GetSidePanelDataRequest,
  suggestionsType: 'assignees',
): Promise<GetSuggestedAssigneesResponse>
async function getSuggestions(
  query: GetSidePanelDataRequest,
  suggestionsType: 'issue_types',
): Promise<GetSuggestedIssueTypesResponse>
async function getSuggestions<
  SuggestionType extends 'labels' | 'milestones' | 'assignees' | 'issue_types',
  T extends
    | GetSuggestedLabelsResponse
    | GetSuggestedMilestonesResponse
    | GetSuggestedAssigneesResponse
    | GetSuggestedIssueTypesResponse,
>(query: GetSidePanelDataRequest, suggestionsType: SuggestionType): Promise<T> {
  const apiData = getApiMetadata('memex-sidepanel-item-suggestions-api-data')
  const url = new URL(apiData.url, window.location.origin)

  switch (query.kind) {
    case ItemKeyType.ISSUE: {
      url.searchParams.set('kind', query.kind)
      url.searchParams.set('item_id', `${query.itemId}`)
      url.searchParams.set('repository_id', `${query.repositoryId}`)
      url.searchParams.set('suggestions_type', suggestionsType)
      break
    }
    case ItemKeyType.PROJECT_DRAFT_ISSUE: {
      url.searchParams.set('kind', query.kind)
      url.searchParams.set('project_item_id', `${query.projectItemId}`)
      url.searchParams.set('suggestions_type', suggestionsType)
      break
    }
    default: {
      assertNever(query)
    }
  }
  const {data} = await fetchJSON<T>(url)
  return data
}
