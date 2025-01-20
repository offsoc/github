import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSON} from '../../platform/functional-fetch-wrapper'
import type {GetSuggestedLabelsResponse, IGetSuggestedLabelsRequest} from './contracts'

export async function apiGetSuggestedLabels({
  memexProjectItemId,
}: IGetSuggestedLabelsRequest): Promise<GetSuggestedLabelsResponse> {
  const apiData = getApiMetadata('memex-item-suggested-labels-api-data')
  const url = new URL(apiData.url, window.location.origin)
  url.searchParams.set('memexProjectItemId', `${memexProjectItemId}`)
  const {data} = await fetchJSON<GetSuggestedLabelsResponse>(url)

  return data
}
