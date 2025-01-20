import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSON} from '../../platform/functional-fetch-wrapper'
import type {GetSuggestedMilestonesResponse, IGetSuggestedMilestonesRequest} from './contracts'

export async function apiGetSuggestedMilestones({
  memexProjectItemId,
}: IGetSuggestedMilestonesRequest): Promise<GetSuggestedMilestonesResponse> {
  const apiData = getApiMetadata('memex-item-suggested-milestones-api-data')
  const url = new URL(apiData.url, window.location.origin)
  url.searchParams.set('memexProjectItemId', `${memexProjectItemId}`)
  const {data} = await fetchJSON<GetSuggestedMilestonesResponse>(url)

  return data
}
