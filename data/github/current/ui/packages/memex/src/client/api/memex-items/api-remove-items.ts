import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {IRemoveMemexItemResponse, RemoveMemexItemRequest} from './contracts'

export async function apiRemoveItems(body: RemoveMemexItemRequest): Promise<IRemoveMemexItemResponse> {
  const apiData = getApiMetadata('memex-item-delete-api-data')
  const {data} = await fetchJSONWith<IRemoveMemexItemResponse>(apiData.url, {
    method: 'DELETE',
    body,
  })
  return data
}
