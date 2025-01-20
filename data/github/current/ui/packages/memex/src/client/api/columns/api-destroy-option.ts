import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {DestroyColumnOptionRequest, DestroyColumnOptionResponse} from './contracts/api'

export async function apiDestroyOption(body: DestroyColumnOptionRequest): Promise<DestroyColumnOptionResponse> {
  const apiData = getApiMetadata('memex-column-option-delete-api-data')
  const {data} = await fetchJSONWith<DestroyColumnOptionResponse>(apiData.url, {
    method: 'DELETE',
    body,
  })

  return data
}
