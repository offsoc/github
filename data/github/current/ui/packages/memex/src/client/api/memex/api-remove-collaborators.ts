import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {IRemoveCollaboratorsRequest, RemoveCollaboratorsResponse} from './contracts'

export async function apiRemoveCollaborators(body: IRemoveCollaboratorsRequest): Promise<RemoveCollaboratorsResponse> {
  const apiData = getApiMetadata('memex-remove-collaborators-api-data')
  const {data} = await fetchJSONWith<RemoveCollaboratorsResponse>(apiData.url, {
    method: 'DELETE',
    body,
  })
  return data
}
