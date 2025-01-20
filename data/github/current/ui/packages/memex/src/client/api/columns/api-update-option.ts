import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {UpdateColumnOptionRequest, UpdateColumnOptionResponse} from './contracts/api'

export async function apiUpdateOption(body: UpdateColumnOptionRequest): Promise<UpdateColumnOptionResponse> {
  const apiData = getApiMetadata('memex-column-option-update-api-data')
  const {data} = await fetchJSONWith<UpdateColumnOptionResponse>(apiData.url, {
    method: 'PUT',
    body,
  })

  return data
}
