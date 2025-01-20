import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {AddMemexItemRequest, AddMemexItemResponse} from './contracts'

export async function apiAddItem(body: AddMemexItemRequest): Promise<AddMemexItemResponse> {
  const apiData = getApiMetadata('memex-item-create-api-data')

  const {data} = await fetchJSONWith<AddMemexItemResponse>(apiData.url, {
    method: 'POST',
    body,
  })
  return data
}
