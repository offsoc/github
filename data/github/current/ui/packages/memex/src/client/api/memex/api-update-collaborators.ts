import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import {rolesMap} from '../common-contracts'
import type {IUpdateCollaboratorsRequest, UpdateCollaboratorsResponse} from './contracts'

export async function apiUpdateCollaborators({
  role,
  collaborators,
}: IUpdateCollaboratorsRequest): Promise<UpdateCollaboratorsResponse> {
  const apiData = getApiMetadata('memex-add-collaborators-api-data')
  const {data} = await fetchJSONWith<UpdateCollaboratorsResponse>(apiData.url, {
    method: 'POST',
    body: {
      permission: rolesMap.get(role),
      collaborators,
    },
  })
  return data
}
