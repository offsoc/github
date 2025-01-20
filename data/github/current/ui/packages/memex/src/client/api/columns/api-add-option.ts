import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {CreateColumnOptionRequest, CreateColumnOptionResponse} from './contracts/api'

export async function apiAddOption(body: CreateColumnOptionRequest): Promise<CreateColumnOptionResponse> {
  const apiData = getApiMetadata('memex-column-option-create-api-data')
  const {data} = await fetchJSONWith<CreateColumnOptionResponse>(apiData.url, {
    method: 'POST',
    body,
  })

  return data
}
