import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith, type RequestInitOverride} from '../../platform/functional-fetch-wrapper'
import type {GetCollaboratorsResponse} from './contracts'

export async function apiGetCollaborators(opts?: RequestInitOverride): Promise<GetCollaboratorsResponse> {
  const apiData = getApiMetadata('memex-collaborators-api-data')
  const {data} = await fetchJSONWith<GetCollaboratorsResponse>(apiData.url, opts)
  return data
}
