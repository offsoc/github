import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSON} from '../../platform/functional-fetch-wrapper'
import type {GetSuggestedAssigneesResponse, IGetSuggestedAssigneesRequest} from './contracts'

export async function apiGetSuggestedAssignees({
  memexProjectItemId,
}: IGetSuggestedAssigneesRequest): Promise<GetSuggestedAssigneesResponse> {
  const apiData = getApiMetadata('memex-item-suggested-assignees-api-data')
  const url = new URL(apiData.url, window.location.origin)
  url.searchParams.set('memexProjectItemId', `${memexProjectItemId}`)
  const {data} = await fetchJSON<GetSuggestedAssigneesResponse>(url)

  return data
}
