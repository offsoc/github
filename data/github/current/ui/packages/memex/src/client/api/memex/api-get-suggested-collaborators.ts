import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith, type RequestInitOverride} from '../../platform/functional-fetch-wrapper'
import type {GetSuggestedCollaboratorsResponse, IGetSuggestedCollaboratorsRequest} from './contracts'

export async function apiGetSuggestedCollaborators(
  {query}: IGetSuggestedCollaboratorsRequest,
  opts?: RequestInitOverride,
): Promise<GetSuggestedCollaboratorsResponse> {
  const apiData = getApiMetadata('memex-suggested-collaborators-api-data')
  const params = new URLSearchParams({
    q: query,
  })
  const urlWithQuery = `${apiData.url}?${params}`
  const {data} = await fetchJSONWith<GetSuggestedCollaboratorsResponse>(urlWithQuery, opts)
  return data
}
