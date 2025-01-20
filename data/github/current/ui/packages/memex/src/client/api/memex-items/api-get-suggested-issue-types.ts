import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSON} from '../../platform/functional-fetch-wrapper'
import type {GetSuggestedIssueTypesResponse, IGetSuggestedIssueTypesRequest} from './contracts'

export async function apiGetSuggestedIssueTypes({
  memexProjectItemId,
}: IGetSuggestedIssueTypesRequest): Promise<GetSuggestedIssueTypesResponse> {
  const apiData = getApiMetadata('memex-item-suggested-issue-types-api-data')
  const url = new URL(apiData.url, window.location.origin)
  url.searchParams.set('memexProjectItemId', `${memexProjectItemId}`)
  const {data} = await fetchJSON<GetSuggestedIssueTypesResponse>(url)

  return data
}
